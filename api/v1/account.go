package v1

import "PandoraHelper/internal/model"

type SearchAccountRequest struct {
	Email       string `json:"email" example:"1234@gmail.com"`
	AccountType string `json:"accountType" example:"1234@gmail.com"`
}

type AddAccountRequest struct {
	//Account的所有属性
	model.Account `json:"account" binding:"required"`
}

type UpdateAccountRequest struct {
	Account model.Account `json:"account" binding:"required"`
}

type DeleteAccountRequest struct {
	Id int64 `json:"id" binding:"required"`
}

type RefreshAccountRequest struct {
	Id int64 `json:"id" binding:"required"`
}

type LoginShareAccountRequest struct {
	Id         int64  `json:"id"`
	UniqueName string `json:"uniqueName"`
	SelectType string `json:"selectType"`
}

type SearchAccountResponseData struct {
	Response
	Data []*model.Account `json:"data"`
}

type AccountResponseData struct {
	Response
}

type ShareAccountResponseData struct {
	Response
	Accounts []*model.Account `json:"accounts"`
	Custom   bool             `json:"custom"`
	Random   bool             `json:"random"`
}
