package server

import (
	"PandoraHelper"
	"PandoraHelper/docs"
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/middleware"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/http"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	limiter "github.com/ulule/limiter/v3"
	"go.uber.org/zap"
	"time"

	mgin "github.com/ulule/limiter/v3/drivers/middleware/gin"
	smem "github.com/ulule/limiter/v3/drivers/store/memory"
	"html/template"
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

	// health check
	s.GET("/health", hearthCheckHandler.GetHealthCheck)
	s.GET("/readiness", hearthCheckHandler.ReadinessHandler)

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

	// swagger doc
	docs.SwaggerInfo.BasePath = "/v1"
	s.GET("/swagger/*any", ginSwagger.WrapHandler(
		swaggerfiles.Handler,
		//ginSwagger.URL(fmt.Sprintf("http://localhost:%d/swagger/doc.json", conf.GetInt("app.http.port"))),
		ginSwagger.DefaultModelsExpandDepth(-1),
	))

	s.Use(
		middleware.CORSMiddleware(),
		middleware.ResponseLogMiddleware(logger),
		middleware.RequestLogMiddleware(logger),
		//middleware.SignMiddleware(log),
	)
	subFS, err := fs.Sub(PandoraHelper.EmbedWebFS, "web")
	if err != nil {
		panic(err)
	}
	s.StaticFS("/static", nethttp.FS(subFS))
	tmpl := template.Must(template.New("").ParseFS(subFS, "auth/*.html"))
	s.SetHTMLTemplate(tmpl)

	// 首页重定向到登录页
	s.GET("/", func(c *gin.Context) {
		c.Redirect(nethttp.StatusMovedPermanently, "/login")
	})
	s.GET("/login", userHandler.ChatLoginIndex)

	//s.Use(static.Serve("/admin", static.EmbedFolder(PandoraHelper.EmbedFrontendFS, "frontend/dist")))
	subFS1, err := fs.Sub(PandoraHelper.EmbedFrontendFS, "frontend/dist")

	s.StaticFS("/admin", nethttp.FS(subFS1))
	s.NoRoute(func(c *gin.Context) {
		file, err := PandoraHelper.EmbedFrontendFS.ReadFile("frontend/dist/index.html")
		if err != nil {
			return
		}
		c.Data(nethttp.StatusOK, "text/html; charset=utf-8", file)
	})

	checkURLs(conf, logger)

	s.POST("/login_share", shareHandler.LoginShare)
	s.POST("/reset_password", shareHandler.ShareResetPassword)
	s.POST("/api/login_share", shareHandler.LoginShare)

	v1 := s.Group("/api")
	{
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
