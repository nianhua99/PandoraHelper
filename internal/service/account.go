package service

import (
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/repository"
	"context"
)

type AccountService interface {
	GetAccount(ctx context.Context, id int64) (*model.Account, error)
	Update(ctx context.Context, account *model.Account) error
	Create(ctx context.Context, account *model.Account) error
	SearchAccount(ctx context.Context, keyword string) ([]*model.Account, error)
	DeleteAccount(ctx context.Context, id int64) error
}

func NewAccountService(service *Service, accountRepository repository.AccountRepository) AccountService {
	return &accountService{
		Service:           service,
		accountRepository: accountRepository,
	}
}

type accountService struct {
	*Service
	accountRepository repository.AccountRepository
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
	return s.accountRepository.GetAccount(ctx, id)
}
