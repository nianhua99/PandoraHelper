package model

type OneApiChannel struct {
	Id                 int     `json:"id"`
	Type               int     `json:"type" gorm:"default:0"`
	Key                string  `json:"key" gorm:"not null"`
	OpenAIOrganization string  `json:"openai_organization"`
	TestModel          string  `json:"test_model"`
	Status             int     `json:"status" gorm:"default:1"`
	Name               string  `json:"name" gorm:"index"`
	Weight             uint    `json:"weight" gorm:"default:0"`
	CreatedTime        int64   `json:"created_time" gorm:"bigint"`
	TestTime           int64   `json:"test_time" gorm:"bigint"`
	ResponseTime       int     `json:"response_time"` // in milliseconds
	BaseURL            string  `json:"base_url" gorm:"column:base_url;default:''"`
	Other              string  `json:"other"`
	Balance            float64 `json:"balance"` // in USD
	BalanceUpdatedTime int64   `json:"balance_updated_time" gorm:"bigint"`
	Models             string  `json:"models"`
	Group              string  `json:"group" gorm:"type:varchar(64);default:'default'"`
	UsedQuota          int64   `json:"used_quota" gorm:"bigint;default:0"`
	ModelMapping       string  `json:"model_mapping" gorm:"type:varchar(1024);default:''"`
	StatusCodeMapping  string  `json:"status_code_mapping" gorm:"type:varchar(1024);default:''"`
	Priority           int64   `json:"priority" gorm:"bigint;default:0"`
	AutoBan            int     `json:"auto_ban" gorm:"default:1"`
	OtherInfo          string  `json:"other_info"`
}
