package server

import (
	"PandoraHelper/internal/service"
	"PandoraHelper/pkg/log"
	"context"
	"github.com/go-co-op/gocron"
	"github.com/spf13/viper"
	"go.uber.org/zap"
	"time"
)

type Task struct {
	conf           *viper.Viper
	log            *log.Logger
	scheduler      *gocron.Scheduler
	accountService service.AccountService
	shareService   service.ShareService
}

func NewTask(conf *viper.Viper, log *log.Logger, accountService service.AccountService, shareService service.ShareService) *Task {
	return &Task{
		conf:           conf,
		log:            log,
		accountService: accountService,
		shareService:   shareService,
	}
}

func (t *Task) RefreshAllAccountEveryday(ctx context.Context) error {
	accounts, err := t.accountService.SearchAccount(context.Background(), "chatgpt", "")
	if err != nil {
		return err
	}
	for _, account := range accounts {
		if account.RefreshToken == "" {
			t.log.Warn("Account RefreshToken is empty, skipped", zap.Int64("id", int64(account.ID)))
			continue
		}
		err = t.accountService.RefreshAccount(context.Background(), int64(account.ID))
		if err != nil {
			t.log.Error(account.Email+"Refresh Account Error", zap.Error(err))
		}
	}
	t.log.Info("Refresh Account Finish")
	return nil
}

func (t *Task) RefreshShareLimitEveryday(ctx context.Context) error {
	shares, err := t.shareService.SearchShare(ctx, "chatgpt", "", "")
	if err != nil {
		return err
	}
	for _, share := range shares {
		if !share.RefreshEveryday {
			continue
		}
		_, err = t.shareService.RefreshShareToken(ctx, share, "", true)
		if err != nil {
			t.log.Error(share.UniqueName+" Refresh Share Limit Error", zap.Error(err))
		}
	}
	t.log.Info("Refresh Share Limit Finish")
	return nil
}

func (t *Task) Start(ctx context.Context) error {
	gocron.SetPanicHandler(func(jobName string, recoverData interface{}) {
		t.log.Error("Task Panic", zap.String("job", jobName), zap.Any("recover", recoverData))
	})

	t.scheduler = gocron.NewScheduler(time.UTC)

	var refreshCron = t.conf.GetString("pandora.account_refresh_cron")
	t.log.Info("refresh cron with second is:" + refreshCron)
	var err error
	if refreshCron != "" {
		_, err = t.scheduler.CronWithSeconds(refreshCron).Do(t.RefreshAllAccountEveryday, ctx)
	} else {
		_, err = t.scheduler.Every(1).Day().At("00:00").Do(t.RefreshAllAccountEveryday, ctx)
	}
	if err != nil {
		return err
	}
	_, err = t.scheduler.Every(1).Day().At("00:05").Do(t.RefreshShareLimitEveryday, ctx)
	if err != nil {
		return err
	}

	t.scheduler.StartBlocking()
	return nil
}
func (t *Task) Stop(ctx context.Context) error {
	t.scheduler.Stop()
	t.log.Info("Task stop...")
	return nil
}
