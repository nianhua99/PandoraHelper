package v1

import "PandoraHelper/internal/model"

type SearchShareRequest struct {
	Email      string `json:"email" example:"1234@gmail.com"`
	UniqueName string `json:"uniqueName" example:"uniqueName"`
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
