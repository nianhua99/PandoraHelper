package repository

import (
	"PandoraHelper/internal/model"
	"context"
)

type ConversationRepository interface {
	SaveConversation(ctx context.Context, conversation *model.Conversation) error
}

type conversationRepository struct {
	*Repository
}

func NewConversationRepository(repository *Repository) ConversationRepository {
	return &conversationRepository{
		Repository: repository,
	}
}

func (r *conversationRepository) SaveConversation(ctx context.Context, conversation *model.Conversation) error {
	return r.DB(ctx).Create(conversation).Error
}
