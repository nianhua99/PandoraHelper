package handler

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

type ShareHandler struct {
	*Handler
	shareService service.ShareService
}

func NewShareHandler(
	handler *Handler,
	shareService service.ShareService,
) *ShareHandler {
	return &ShareHandler{
		Handler:      handler,
		shareService: shareService,
	}
}

func (h *ShareHandler) GetShare(ctx *gin.Context) {

}

func (h *ShareHandler) CreateShare(ctx *gin.Context) {
	req := new(model.Share)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.shareService.Create(ctx, req); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *ShareHandler) UpdateShare(ctx *gin.Context) {
	req := new(model.Share)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.shareService.Update(ctx, req); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *ShareHandler) DeleteShare(ctx *gin.Context) {
	req := new(v1.DeleteShareRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.shareService.DeleteShare(ctx, req.Id); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *ShareHandler) SearchShare(ctx *gin.Context) {

	req := new(v1.SearchShareRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		print(err)
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}
	shareList, err := h.shareService.SearchShare(ctx, req.Email, req.UniqueName)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, shareList)
}
