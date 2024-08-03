package model

type Account struct {
	ID           uint       `json:"id" gorm:"primaryKey" gorm:"column:id"`
	Email        string     `json:"email" gorm:"column:email"`
	Password     string     `json:"password" gorm:"column:password"`
	SessionToken string     `json:"sessionToken" gorm:"column:session_token"`
	AccessToken  string     `json:"accessToken" gorm:"column:access_token"`
	CreateTime   *LocalTime `json:"createTime" gorm:"autoCreateTime" gorm:"column:create_time"`
	UpdateTime   *LocalTime `json:"updateTime" gorm:"autoUpdateTime" gorm:"column:update_time"`
	Shared       int        `json:"shared" gorm:"column:shared"`
	RefreshToken string     `json:"refreshToken" gorm:"column:refresh_token"`
	AccountType  string     `json:"accountType" gorm:"column:account_type" gorm:"default:chatgpt"`
	SessionKey   string     `json:"sessionKey" gorm:"column:session_key"`
	Shares       []Share    `gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE"` // 外键关系
}

func (m *Account) TableName() string {
	return "account"
}
