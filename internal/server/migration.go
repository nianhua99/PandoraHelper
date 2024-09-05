package server

import (
	"PandoraHelper/internal/model"
	"PandoraHelper/pkg/log"
	"context"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type Migrate struct {
	db  *gorm.DB
	log *log.Logger
}

func NewMigrate(db *gorm.DB, log *log.Logger) *Migrate {
	return &Migrate{
		db:  db,
		log: log,
	}
}
func (m *Migrate) Start(ctx context.Context) error {
	if err := m.db.AutoMigrate(
		model.Share{},
		model.Account{},
		model.Conversation{},
	); err != nil {
		m.log.Error("user migrate error", zap.Error(err))
		return err
	}
	m.db.Exec("UPDATE account set account_type = 'chatgpt' where account_type = '' or account_type is null")
	m.db.Exec("UPDATE share set share_type = 'chatgpt' where share_type = '' or share_type is null")
	m.log.Info("AutoMigrate success")
	return nil
}
func (m *Migrate) Stop(ctx context.Context) error {
	m.log.Info("AutoMigrate stop")
	return nil
}
