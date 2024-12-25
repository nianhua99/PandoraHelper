package v1

import "PandoraHelper/internal/model"

type SearchShareRequest struct {
	Email       string `json:"email" example:"1234@gmail.com"`
	AccountType string `json:"accountType" example:"chatgpt"`
	UniqueName  string `json:"uniqueName" example:"uniqueName"`
}

type LoginShareRequest struct {
	Username string `json:"username" form:"username" binding:"required"`
	Password string `json:"password" form:"password" binding:"required"`
}

type ShareResetPasswordRequest struct {
	UniqueName  string `json:"uniqueName" binding:"required"`
	Password    string `json:"password" binding:"required"`
	NewPassword string `json:"newPassword" binding:"required"`
}

type AddShareRequest struct {
	Share model.Share `json:"share" binding:"required"`
}

type UpdateShareRequest struct {
	Share model.Share `json:"share" binding:"required"`
}

type DeleteShareRequest struct {
	Id int64 `json:"id" binding:"required"`
}

type SearchShareResponse struct {
	Response
	Data []*model.Share `json:"data"`
}

type ShareResponse struct {
	Response
}

type Usage map[string]string

type StatisticResult struct {
	Usage Usage `json:"usage"`
}
