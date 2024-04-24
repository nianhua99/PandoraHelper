package repository

import (
	"PandoraHelper/internal/model"
	"context"
)

type ShareRepository interface {
	GetShare(ctx context.Context, id int64) (*model.Share, error)
	Update(ctx context.Context, share *model.Share) error
	Create(ctx context.Context, share *model.Share) error
	SearchShare(ctx context.Context, email string, uniqueName string) ([]*model.Share, error)
	DeleteShare(ctx context.Context, id int64) error
}

func NewShareRepository(
	repository *Repository,
) ShareRepository {
	return &shareRepository{
		Repository: repository,
	}
}

type shareRepository struct {
	*Repository
}

func (r *shareRepository) Update(ctx context.Context, share *model.Share) error {
	if err := r.DB(ctx).Save(share).Error; err != nil {
		return err
	}
	return nil
}

func (r *shareRepository) Create(ctx context.Context, share *model.Share) error {
	if err := r.DB(ctx).Create(share).Error; err != nil {
		return err
	}
	return nil
}

func (r *shareRepository) SearchShare(ctx context.Context, email string, uniqueName string) ([]*model.Share, error) {
	// 关联Account like 模糊查询
	var shares []*model.Share
	if err := r.DB(ctx).Joins(
		"Account",
	).Select(
		"share.*, account.email",
	).Where("account.email like ?", "%"+email+"%").Where("unique_name like ?", "%"+uniqueName+"%").Find(&shares).Error; err != nil {
		return nil, err
	}
	return shares, nil
}

func (r *shareRepository) DeleteShare(ctx context.Context, id int64) error {
	r.DB(ctx).Delete(&model.Share{}, id)
	return nil
}

func (r *shareRepository) GetShare(ctx context.Context, id int64) (*model.Share, error) {
	var share model.Share
	if err := r.DB(ctx).Where("id = ?", id).First(&share).Error; err != nil {
		return nil, err
	}
	return &share, nil
}
