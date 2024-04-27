package server

import (
	"PandoraHelper"
	"PandoraHelper/docs"
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/middleware"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/http"
	"github.com/gin-contrib/static"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"

	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
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

	s.Use(static.Serve("/", static.EmbedFolder(PandoraHelper.EmbedFrontendFS, "frontend/dist")))

	v1 := s.Group("/api")
	{
		// No route group has permission
		noAuthRouter := v1.Group("/")
		{
			noAuthRouter.POST("/login", userHandler.Login)
		}

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
