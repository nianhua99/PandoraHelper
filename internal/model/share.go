package model

type Share struct {
	ID                uint     `json:"id" gorm:"primaryKey" gorm:"column:id"`
	AccountID         uint     `json:"accountId" gorm:"column:account_id"` // 外键
	UniqueName        string   `json:"uniqueName" gorm:"column:unique_name"`
	Password          string   `json:"password" gorm:"column:password"`
	ShareToken        string   `json:"shareToken" gorm:"column:share_token"`
	Comment           string   `json:"comment" gorm:"column:comment"`
	ExpiresIn         int      `json:"expiresIn" gorm:"column:expires_in"`
	SiteLimit         string   `json:"siteLimit" gorm:"column:site_limit"`
	Gpt4Limit         int      `json:"gpt4Limit" gorm:"column:gpt4_limit"`
	Gpt35Limit        int      `json:"gpt35Limit" gorm:"column:gpt35_limit"`
	ShowUserinfo      bool     `json:"showUserinfo" gorm:"column:show_userinfo"`
	ShowConversations bool     `json:"showConversations" gorm:"column:show_conversations"`
	RefreshEveryday   bool     `json:"refreshEveryday" gorm:"column:refresh_everyday"`
	Account           *Account `json:"account" gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE"`
}

func (m *Share) TableName() string {
	return "share"
}
