package server

import (
	"PandoraHelper"
	"PandoraHelper/docs"
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/middleware"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/http"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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
) *http.Server {
	gin.SetMode(gin.ReleaseMode)
	s := http.NewServer(
		gin.Default(),
		logger,
		http.WithServerHost(conf.GetString("http.host")),
		http.WithServerPort(conf.GetInt("http.port")),
	)

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

	s.POST("/login_share", shareHandler.LoginShare)
	s.POST("/api/login_share", shareHandler.LoginShare)

	v1 := s.Group("/api")
	{
		// No route group has permission
		v1.POST("/login", userHandler.Login)

		shareAuthRouter := v1.Group("/share").Use(middleware.StrictAuth(jwt, logger))
		{
			shareAuthRouter.POST("/add", shareHandler.CreateShare)
			shareAuthRouter.POST("/update", shareHandler.UpdateShare)
			shareAuthRouter.POST("/delete", shareHandler.DeleteShare)
			shareAuthRouter.POST("/search", shareHandler.SearchShare)
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
