package v1

import "PandoraHelper/internal/model"

type SearchAccountRequest struct {
	Email string `json:"email" example:"1234@gmail.com"`
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

type SearchAccountResponseData struct {
	Response
	Data []*model.Account `json:"data"`
}

type AccountResponseData struct {
	Response
}
