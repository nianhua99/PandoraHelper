//go:build wireinject
// +build wireinject

package wire

import (
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/middleware"
	"PandoraHelper/internal/repository"
	"PandoraHelper/internal/server"
	"PandoraHelper/internal/service"
	"PandoraHelper/pkg/app"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	serverType "PandoraHelper/pkg/server"
	"PandoraHelper/pkg/server/http"
	"PandoraHelper/pkg/server/reverse/chatgpt"
	"PandoraHelper/pkg/server/reverse/claude"
	"PandoraHelper/pkg/sid"
	"github.com/google/wire"
	"github.com/spf13/viper"
)

var repositorySet = wire.NewSet(
	repository.NewDB,
	//repository.NewRedis,
	repository.NewRepository,
	repository.NewTransaction,
	repository.NewAccountRepository,
	repository.NewShareRepository,
	repository.NewConversationRepository,
)

var serviceCoordinatorSet = wire.NewSet(
	service.NewServiceCoordinator,
)

var serviceSet = wire.NewSet(
	service.NewService,
	service.NewUserService,
	serviceCoordinatorSet,
	service.NewAccountService,
	service.NewShareService,
	server.NewTask,
)

var migrateSet = wire.NewSet(
	server.NewMigrate,
)

var handlerSet = wire.NewSet(
	handler.NewHandler,
	handler.NewUserHandler,
	handler.NewShareHandler,
	handler.NewAccountHandler,
	handler.NewHealthCheckHandler,
)

var serverSet = wire.NewSet(
	server.NewHTTPServer,
	server.NewChatGPTReverseProxyServer,
	server.NewClaudeReverseProxyServer,
	server.NewJob,
)

// build App
func newApp(conf *viper.Viper, httpServer *http.Server, job *server.Job, task *server.Task, migrate *server.Migrate, gptServer *chatgpt.Server, claudeServer *claude.Server) *app.App {
	servers := []serverType.Server{
		httpServer,
		job,
		task,
		migrate,
	}
	if conf.GetBool("http.proxy-pass.oaifree.enable") {
		servers = append(servers, gptServer)
	}
	if conf.GetBool("http.proxy-pass.fuclaude.enable") {
		servers = append(servers, claudeServer)
	}
	return app.NewApp(
		app.WithServer(servers...),
		app.WithName("demo-server"),
	)
}

func NewWire(*viper.Viper, *log.Logger) (*app.App, func(), error) {
	panic(wire.Build(
		repositorySet,
		serviceSet,
		handlerSet,
		serverSet,
		migrateSet,
		sid.NewSid,
		jwt.NewJwt,
		middleware.NewConversationLoggerMiddleware,
		newApp,
	))

}
