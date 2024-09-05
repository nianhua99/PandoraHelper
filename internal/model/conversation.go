package model

import (
	"time"
)

type Conversation struct {
	ID               uint   `gorm:"primaryKey"`
	UserMessage      string `gorm:"type:text"`
	AssistantMessage string `gorm:"type:text"`
	Product          string `gorm:"type:text"`
	Model            string `gorm:"type:text"`
	Timestamp        time.Time
	ConversationID   string
	UserID           string
}

func (m *Conversation) TableName() string {
	return "conversations"
}
