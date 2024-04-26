package service

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/repository"
	"context"
	"fmt"
	"github.com/go-resty/resty/v2"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type AccountService interface {
	RefreshAccount(ctx context.Context, id int64) error
	GetAccount(ctx context.Context, id int64) (*model.Account, error)
	Update(ctx context.Context, account *model.Account) error
	Create(ctx context.Context, account *model.Account) error
	SearchAccount(ctx context.Context, keyword string) ([]*model.Account, error)
	DeleteAccount(ctx context.Context, id int64) error
}

func NewAccountService(service *Service, accountRepository repository.AccountRepository, viper *viper.Viper, coordinator *Coordinator) AccountService {
	return &accountService{
		Service:           service,
		accountRepository: accountRepository,
		viper:             viper,
		shareService:      coordinator.ShareSvc,
	}
}

type accountService struct {
	*Service
	accountRepository repository.AccountRepository
	viper             *viper.Viper
	shareService      ShareService
}

func (s *accountService) GetAccessTokenByRefreshToken(refreshToken string) (string, error) {
	tokenDomain := fmt.Sprintf("%s/api/auth/refresh", s.viper.GetString("pandora.domain.token"))
	var resp struct {
		AccessToken string `json:"access_token"`
	}
	client := resty.New()
	_, err := client.R().
		SetHeader("Content-Type", "application/x-www-form-urlencoded").
		SetFormData(map[string]string{
			"refresh_token": refreshToken,
		}).
		SetResult(&resp).
		Post(tokenDomain)
	if err != nil {
		s.logger.Error("GetAccessTokenByRefreshToken error", zap.Any("err", err))
		return "", err
	}
	s.logger.Info("GetAccessTokenByRefreshToken resp", zap.Any("resp", resp))
	return resp.AccessToken, nil
}

func (s *accountService) RefreshAccount(ctx context.Context, id int64) error {
	account, err := s.accountRepository.GetAccount(ctx, id)
	if err != nil {
		return err
	}
	if account == nil || account.RefreshToken == "" {
		return v1.ErrCannotRefresh
	}
	accessToken, err := s.GetAccessTokenByRefreshToken(account.RefreshToken)
	if err != nil {
		s.logger.Error("GetAccessTokenByRefreshToken error", zap.Any("err", err))
		return err
	}
	account.AccessToken = accessToken
	err = s.accountRepository.Update(ctx, account)
	if err != nil {
		return err
	}
	// 刷新此Account的所有ShareToken
	shares, err := s.shareService.SearchShare(ctx, account.Email, "")
	if err != nil {
		return err
	}
	for _, share := range shares {
		_, err = s.shareService.RefreshShareToken(ctx, share, accessToken, false)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *accountService) Update(ctx context.Context, account *model.Account) error {
	err := s.accountRepository.Update(ctx, account)
	if err != nil {
		return err
	}
	return nil
}

func (s *accountService) Create(ctx context.Context, account *model.Account) error {
	err := s.accountRepository.Create(ctx, account)
	if err != nil {
		return err
	}
	return nil
}

func (s *accountService) SearchAccount(ctx context.Context, keyword string) ([]*model.Account, error) {
	return s.accountRepository.SearchAccount(ctx, keyword)
}

func (s *accountService) DeleteAccount(ctx context.Context, id int64) error {
	return s.accountRepository.DeleteAccount(ctx, id)
}

func (s *accountService) GetAccount(ctx context.Context, id int64) (*model.Account, error) {
	account, err := s.accountRepository.GetAccount(ctx, id)
	if err != nil {
		return nil, err
	}
	if account.AccessToken == "" {
		if account.RefreshToken == "" {
			return nil, v1.ErrNotFound
		}
		newAccessToken, err := s.GetAccessTokenByRefreshToken(account.RefreshToken)
		account.AccessToken = newAccessToken
		if err != nil {
			return nil, err
		}
		err = s.accountRepository.Update(ctx, account)
		if err != nil {
			return nil, err
		}
	}
	return account, nil
}
