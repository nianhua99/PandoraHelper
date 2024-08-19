package config

import (
	"fmt"
	"github.com/spf13/viper"
	"os"
	"strings"
)

func doesPathExist(path string) bool {
	// 使用os.Stat来获取文件/目录状态
	_, err := os.Stat(path)

	// 如果没有错误，说明路径存在
	if err == nil {
		return true
	}

	// 如果错误是因为路径不存在，返回false
	if os.IsNotExist(err) {
		return false
	}

	// 对于其他错误，打印错误消息并返回false
	fmt.Println("检查路径时发生错误:", err)
	return false
}

func NewConfig(p string) *viper.Viper {
	envConf := os.Getenv("APP_CONF")
	if envConf == "" {
		envConf = p
	}
	fmt.Println("load conf file:", envConf)
	return getConfig(envConf, ".")
}

// setDefaults 设置默认值
func setDefaults(conf *viper.Viper) {

	// HTTP settings
	conf.SetDefault("http.host", "0.0.0.0")
	conf.SetDefault("http.port", 9000)
	conf.SetDefault("http.title", "Pandora")
	conf.SetDefault("http.rate", 100)

	// Database settings
	conf.SetDefault("database.driver", "sqlite")
	conf.SetDefault("database.dsn", "./data/data.db")

	// Pandora domain settings
	conf.SetDefault("pandora.domain.chat", "https://chat.oaifree.com")
	conf.SetDefault("pandora.domain.token", "https://token.oaifree.com")
	conf.SetDefault("pandora.domain.index", "https://new.oaifree.com")
	conf.SetDefault("pandora.domain.claude", "https://demo.fuclaude.com")

	// Share settings
	conf.SetDefault("share.random", true)
	conf.SetDefault("share.custom", true)

	// Log settings
	conf.SetDefault("log.level", "info")
	conf.SetDefault("log.encoding", "console")
	conf.SetDefault("log.output", "console")
	conf.SetDefault("log.log_file_name", "./logs/server.log")
	conf.SetDefault("log.max_backups", 30)
	conf.SetDefault("log.max_age", 7)
	conf.SetDefault("log.max_size", 1024)
	conf.SetDefault("log.compress", true)
}

func getConfig(path ...string) *viper.Viper {
	conf := viper.New()
	conf.SetConfigName("config")
	for _, p := range path {
		// 路径不存在则跳过
		if !doesPathExist(p) {
			continue
		}
		conf.AddConfigPath(p)
	}
	err := conf.ReadInConfig()
	if err != nil {
		panic(err)
	}
	setDefaults(conf)
	err = conf.BindEnv("security.admin_password", "ADMIN_PASSWORD")
	if err != nil {
		return nil
	}
	conf.SetEnvKeyReplacer(strings.NewReplacer(".", "_"))
	// 绑定环境变量
	conf.AutomaticEnv()
	return conf
}
