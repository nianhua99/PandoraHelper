//go:build wireinject
// +build wireinject

package wire

import (
	"PandoraHelper/internal/handler"
	"PandoraHelper/internal/repository"
	"PandoraHelper/internal/server"
	"PandoraHelper/internal/service"
	"PandoraHelper/pkg/app"
	"PandoraHelper/pkg/jwt"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/http"
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
)

var serverSet = wire.NewSet(
	server.NewHTTPServer,
	server.NewJob,
)

// build App
func newApp(httpServer *http.Server, job *server.Job, task *server.Task, migrate *server.Migrate) *app.App {
	return app.NewApp(
		app.WithServer(httpServer, job, task, migrate),
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
		newApp,
	))

}
