package config

import (
	"fmt"
	"github.com/spf13/viper"
	"os"
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
	return conf
}
