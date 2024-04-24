package server

import (
	"PandoraHelper/pkg/log"
	"context"
	"github.com/go-co-op/gocron"
	"go.uber.org/zap"
	"time"
)

type Task struct {
	log       *log.Logger
	scheduler *gocron.Scheduler
}

func NewTask(log *log.Logger) *Task {
	return &Task{
		log: log,
	}
}
func (t *Task) Start(ctx context.Context) error {
	gocron.SetPanicHandler(func(jobName string, recoverData interface{}) {
		t.log.Error("Task Panic", zap.String("job", jobName), zap.Any("recover", recoverData))
	})

	// eg: crontab task
	t.scheduler = gocron.NewScheduler(time.UTC)
	// if you are in China, you will need to change the time zone as follows
	// t.scheduler = gocron.NewScheduler(time.FixedZone("PRC", 8*60*60))

	_, err := t.scheduler.CronWithSeconds("0/3 * * * * *").Do(func() {
		t.log.Info("I'm a Task1.")
	})
	if err != nil {
		t.log.Error("Task1 error", zap.Error(err))
	}

	_, err = t.scheduler.Every("3s").Do(func() {
		t.log.Info("I'm a Task2.")
	})
	if err != nil {
		t.log.Error("Task2 error", zap.Error(err))
	}

	t.scheduler.StartBlocking()
	return nil
}
func (t *Task) Stop(ctx context.Context) error {
	t.scheduler.Stop()
	t.log.Info("Task stop...")
	return nil
}
