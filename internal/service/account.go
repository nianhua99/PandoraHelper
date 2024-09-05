package service

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/repository"
	"context"
	"errors"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/go-resty/resty/v2"
	"github.com/spf13/viper"
	"go.uber.org/zap"
)

type AccountService interface {
	RefreshAccount(ctx context.Context, id int64) error
	GetAccount(ctx context.Context, id int64) (*model.Account, error)
	Update(ctx context.Context, account *model.Account) error
	Create(ctx context.Context, account *model.Account) error
	SearchAccount(ctx context.Context, accountType string, keyword string) ([]*model.Account, error)
	DeleteAccount(ctx context.Context, id int64) error
	GetShareAccountList(ctx *gin.Context) ([]*model.Account, bool, bool, error)
	LoginShareAccount(ctx *gin.Context, req *v1.LoginShareAccountRequest) (string, error)
}

func NewAccountService(service *Service, accountRepository repository.AccountRepository, viper *viper.Viper, coordinator *Coordinator) AccountService {
	return &accountService{
		Service:           service,
		accountRepository: accountRepository,
		viper:             viper,
		coordinator:       coordinator,
	}
}

type accountService struct {
	*Service
	accountRepository repository.AccountRepository
	viper             *viper.Viper
	coordinator       *Coordinator
}

func (s *accountService) LoginShareAccount(ctx *gin.Context, req *v1.LoginShareAccountRequest) (string, error) {
	account, err := s.accountRepository.GetAccount(ctx, req.Id)
	if err != nil {
		return "", err
	}
	if account.Shared == 0 {
		return "", errors.New("账户未开启共享")
	}
	if account.AccountType == "chatgpt" || account.AccountType == "" {
		share := &model.Share{
			AccountID:         account.ID,
			UniqueName:        req.UniqueName,
			TemporaryChat:     req.SelectType == "random",
			ExpiresIn:         60 * 60 * 24,
			Gpt35Limit:        -1,
			Gpt4Limit:         -1,
			ShareType:         account.AccountType,
			ShowConversations: true,
		}
		token, err := s.coordinator.ShareSvc.GetShareTokenByAccessToken(ctx, account.AccessToken, share, true)
		if err != nil {
			return "", err
		}
		share.ShareToken = token
		url, err := s.coordinator.ShareSvc.GetOauthLoginUrl(ctx, share)
		return url, err
	} else if account.AccountType == "claude" {
		url, err := s.coordinator.ShareSvc.GetOauthLoginUrl(ctx, &model.Share{
			AccountID:  account.ID,
			UniqueName: req.UniqueName,
			ExpiresIn:  60 * 60 * 24,
			ShareType:  account.AccountType,
		})
		if err != nil {
			return "", err
		}
		return url, nil
	} else {
		return "", errors.New("不支持的账户类型")
	}
}

func (s *accountService) GetShareAccountList(ctx *gin.Context) ([]*model.Account, bool, bool, error) {
	accounts, err := s.accountRepository.GetShareAccountList(ctx)
	if err != nil {
		return nil, false, false, err
	}
	custom := s.viper.GetBool("share.custom")
	random := s.viper.GetBool("share.random")
	if len(accounts) == 0 {
		return accounts, false, false, nil
	}
	if !custom && !random {
		// 如果都为false，则返回空数组
		return []*model.Account{}, false, false, nil
	}
	return accounts, custom, random, nil
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
	accessToken := account.AccessToken
	if account.RefreshToken != "" {
		accessToken, err = s.GetAccessTokenByRefreshToken(account.RefreshToken)
		if err != nil {
			s.logger.Error("GetAccessTokenByRefreshToken error", zap.Any("err", err))
			return err
		}
	}
	account.AccessToken = accessToken
	err = s.accountRepository.Update(ctx, account)
	if err != nil {
		return err
	}
	// 刷新此Account的所有ShareToken
	shares, err := s.coordinator.ShareSvc.GetSharesByAccountId(ctx, int(account.ID))
	if err != nil {
		return err
	}
	for _, share := range shares {
		err := s.coordinator.ShareSvc.Update(ctx, share)
		if err != nil {
			return err
		}
	}
	return nil
}

func (s *accountService) Update(ctx context.Context, account *model.Account) error {
	// 刷新所有share
	err := s.accountRepository.Update(ctx, account)
	if err != nil {
		return err
	}
	if account.AccountType == "chatgpt" || account.AccountType == "" {
		err = s.RefreshAccount(ctx, int64(account.ID))
		if err != nil {
			return errors.New("更新成功，但存在问题：" + err.Error())
		}
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

func (s *accountService) SearchAccount(ctx context.Context, accountType string, keyword string) ([]*model.Account, error) {
	return s.accountRepository.SearchAccount(ctx, accountType, keyword)
}

func (s *accountService) DeleteAccount(ctx context.Context, id int64) error {
	return s.accountRepository.DeleteAccount(ctx, id)
}

func (s *accountService) GetAccount(ctx context.Context, id int64) (*model.Account, error) {
	account, err := s.accountRepository.GetAccount(ctx, id)
	if err != nil {
		return nil, err
	}
	if (account.AccountType == "" || account.AccountType == "chatgpt") && account.AccessToken == "" {
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
