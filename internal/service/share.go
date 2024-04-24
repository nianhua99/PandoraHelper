package service

import (
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/repository"
	"context"
)

type ShareService interface {
	GetShare(ctx context.Context, id int64) (*model.Share, error)
	Update(ctx context.Context, share *model.Share) error
	Create(ctx context.Context, share *model.Share) error
	SearchShare(ctx context.Context, email string, uniqueName string) ([]*model.Share, error)
	DeleteShare(ctx context.Context, id int64) error
}

func NewShareService(service *Service, shareRepository repository.ShareRepository) ShareService {
	return &shareService{
		Service:         service,
		shareRepository: shareRepository,
	}
}

type shareService struct {
	*Service
	shareRepository repository.ShareRepository
}

func (s *shareService) Update(ctx context.Context, share *model.Share) error {
	err := s.shareRepository.Update(ctx, share)
	if err != nil {
		return err
	}
	return nil
}

func (s *shareService) Create(ctx context.Context, share *model.Share) error {
	err := s.shareRepository.Create(ctx, share)
	if err != nil {
		return err
	}
	return nil
}

func (s *shareService) SearchShare(ctx context.Context, email string, uniqueName string) ([]*model.Share, error) {
	return s.shareRepository.SearchShare(ctx, email, uniqueName)
}

func (s *shareService) DeleteShare(ctx context.Context, id int64) error {
	return s.shareRepository.DeleteShare(ctx, id)
}

func (s *shareService) GetShare(ctx context.Context, id int64) (*model.Share, error) {
	return s.shareRepository.GetShare(ctx, id)
}
