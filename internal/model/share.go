package model

type Share struct {
	ID                uint     `json:"id" gorm:"primaryKey" gorm:"column:id"`
	AccountID         uint     `json:"accountId" gorm:"column:account_id"` // 外键
	UniqueName        string   `json:"uniqueName" gorm:"column:unique_name"`
	Password          string   `json:"password" gorm:"column:password"`
	ShareToken        string   `json:"shareToken" gorm:"column:share_token"`
	Comment           string   `json:"comment" gorm:"column:comment"`
	ExpiresIn         int      `json:"expiresIn" gorm:"column:expires_in"`
	ExpiresAt         string   `json:"expiresAt" gorm:"column:expires_at"`
	SiteLimit         string   `json:"siteLimit" gorm:"column:site_limit"`
	Gpt4Limit         int      `json:"gpt4Limit" gorm:"column:gpt4_limit"`
	Gpt4oLimit        int      `json:"gpt4oLimit" gorm:"column:gpt4o_limit"`
	Gpt4oMiniLimit    int      `json:"gpt4oMiniLimit" gorm:"column:gpt4o_mini_limit"`
	O1Limit           int      `json:"o1Limit" gorm:"column:o1_limit"`
	O1MiniLimit       int      `json:"o1MiniLimit" gorm:"column:o1_mini_limit"`
	Gpt35Limit        int      `json:"gpt35Limit" gorm:"column:gpt35_limit"`
	ShowUserinfo      bool     `json:"showUserinfo" gorm:"column:show_userinfo"`
	ShowConversations bool     `json:"showConversations" gorm:"column:show_conversations"`
	RefreshEveryday   bool     `json:"refreshEveryday" gorm:"column:refresh_everyday"`
	TemporaryChat     bool     `json:"temporaryChat" gorm:"column:temporary_chat"`
	Account           *Account `json:"account" gorm:"foreignKey:AccountID;constraint:OnDelete:CASCADE"`
	ShareType         string   `json:"shareType" gorm:"column:share_type"`
}

func (m *Share) TableName() string {
	return "share"
}
