package server

import (
	"PandoraHelper"
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/middleware"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/http"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"github.com/ulule/limiter/v3"
	"go.uber.org/zap"
	"strings"
	"time"

	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	smem "github.com/ulule/limiter/v3/drivers/store/memory"
	"io/fs"
	nethttp "net/http"
)

func NewHTTPServer(
	logger *log.Logger,
	conf *viper.Viper,
	jwt *jwt.JWT,
	userHandler *handler.UserHandler,
	shareHandler *handler.ShareHandler,
	accountHandler *handler.AccountHandler,
	hearthCheckHandler *handler.HealthCheckHandler,
) *http.Server {
	gin.SetMode(gin.ReleaseMode)
	s := http.NewServer(
		gin.Default(),
		logger,
		http.WithServerHost(conf.GetString("http.host")),
		http.WithServerPort(conf.GetInt("http.port")),
	)

	// rate limiter
	var rateStr string
	if conf.InConfig("http.rate") {
		rateStr = fmt.Sprintf("%d-M", conf.GetInt("http.rate"))
	} else {
		rateStr = "100-M"
	}

	rate, err := limiter.NewRateFromFormatted(rateStr)
	if err != nil {
		panic(err)
	}
	store := smem.NewStore()
	limitMiddleware := mgin.NewMiddleware(limiter.New(store, rate))
	s.ForwardedByClientIP = true
	s.Use(limitMiddleware)

	s.Use(
		middleware.CORSMiddleware(),
		middleware.ResponseLogMiddleware(logger),
		middleware.RequestLogMiddleware(logger),
		//middleware.SignMiddleware(log),
	)

	// 获取前端文件系统
	frontendFS, err := fs.Sub(PandoraHelper.EmbedFrontendFS, "frontend/dist")
	if err != nil {
		panic(err)
	}

	// 静态文件处理器
	fileServer := nethttp.FileServer(nethttp.FS(frontendFS))

	// 处理所有非 API 路由
	s.NoRoute(func(c *gin.Context) {
		// 跳过 API 请求
		if strings.HasPrefix(c.Request.URL.Path, "/api") {
			c.String(nethttp.StatusNotFound, "404 not found")
			return
		}

		// 尝试提供静态文件
		path := c.Request.URL.Path
		if _, err := frontendFS.Open(strings.TrimPrefix(path, "/")); err == nil {
			fileServer.ServeHTTP(c.Writer, c.Request)
			return
		}

		// 返回 index.html 用于客户端路由
		file, err := PandoraHelper.EmbedFrontendFS.ReadFile("frontend/dist/index.html")
		if err != nil {
			c.String(nethttp.StatusInternalServerError, err.Error())
			return
		}
		c.Data(nethttp.StatusOK, "text/html; charset=utf-8", file)
	})

	checkURLs(conf, logger)

	// health check
	s.GET("/health", hearthCheckHandler.GetHealthCheck)
	s.GET("/readiness", hearthCheckHandler.ReadinessHandler)

	v1 := s.Group("/api")
	{
		v1.POST("/login_share", shareHandler.LoginShare)
		v1.POST("/reset_password", shareHandler.ShareResetPassword)
		// No route group has permission
		v1.POST("/login", userHandler.Login)
		v1.POST("/share_accounts", accountHandler.GetShareAccountList)
		v1.POST("/login_free_account", accountHandler.LoginShareAccount)

		shareAuthRouter := v1.Group("/share").Use(middleware.StrictAuth(jwt, logger))
		{
			shareAuthRouter.POST("/add", shareHandler.CreateShare)
			shareAuthRouter.POST("/update", shareHandler.UpdateShare)
			shareAuthRouter.POST("/delete", shareHandler.DeleteShare)
			shareAuthRouter.POST("/search", shareHandler.SearchShare)
			shareAuthRouter.POST("/statistic", shareHandler.ShareStatistic)
		}

		accountAuthRouter := v1.Group("/account").Use(middleware.StrictAuth(jwt, logger))
		{
			accountAuthRouter.POST("/add", accountHandler.CreateAccount)
			accountAuthRouter.POST("/refresh", accountHandler.RefreshAccount)
			accountAuthRouter.POST("/search", accountHandler.SearchAccount)
			accountAuthRouter.POST("/delete", accountHandler.DeleteAccount)
			accountAuthRouter.POST("/update", accountHandler.UpdateAccount)
			accountAuthRouter.POST("/oneapi/channels", accountHandler.GetOneApiChannelList)
		}

		userAuthRouter := v1.Group("/user").Use(middleware.StrictAuth(jwt, logger))
		{
			userAuthRouter.GET("/2fa_secret", userHandler.Get2FASecret)
			userAuthRouter.POST("/2fa_verify", userHandler.Verify2FA)
		}

		settingRouter := v1.Group("/setting")
		{
			settingRouter.GET("/login", userHandler.GetLoginSettings)
		}
	}

	return s
}

func checkURLs(conf *viper.Viper, logger *log.Logger) {
	urls := []string{
		conf.GetString("pandora.domain.index"),
		conf.GetString("pandora.domain.claude"),
	}

	client := nethttp.Client{
		Timeout: 10 * time.Second,
	}

	for _, url := range urls {
		resp, err := client.Get(url)
		if err != nil {
			logger.Error("无法访问URL", zap.String("url", url), zap.Error(err))
			continue
		}
		defer resp.Body.Close()

		if resp.StatusCode == nethttp.StatusOK {
			logger.Info("URL可以正常访问", zap.String("url", url))
		} else if resp.StatusCode == nethttp.StatusForbidden {
			logger.Error("403 访问URL被拦截", zap.String("url", url), zap.Int("status", resp.StatusCode))
		} else {
			logger.Error("URL返回非200状态码", zap.String("url", url), zap.Int("status", resp.StatusCode))
		}
	}
}
