package service

import (
	"PandoraHelper/internal/repository"
	"github.com/spf13/viper"
)

type Coordinator struct {
	AccountSvc AccountService
	ShareSvc   ShareService
}

func NewServiceCoordinator(service *Service, accountRepo repository.AccountRepository, shareRepo repository.ShareRepository, viper *viper.Viper) *Coordinator {
	coordinator := &Coordinator{}

	accountSvc := NewAccountService(service, accountRepo, viper, coordinator)
	shareSvc := NewShareService(service, shareRepo, viper, coordinator)

	coordinator.AccountSvc = accountSvc
	coordinator.ShareSvc = shareSvc

	return coordinator
}
