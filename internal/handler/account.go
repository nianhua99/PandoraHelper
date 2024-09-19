package handler

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/service"
	"errors"
	"github.com/gin-gonic/gin"
	"net/http"
)

type AccountHandler struct {
	*Handler
	accountService service.AccountService
}

func NewAccountHandler(
	handler *Handler,
	accountService service.AccountService,
) *AccountHandler {
	return &AccountHandler{
		Handler:        handler,
		accountService: accountService,
	}
}

func (h *AccountHandler) RefreshAccount(ctx *gin.Context) {
	req := new(v1.RefreshAccountRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	err := h.accountService.RefreshAccount(ctx, req.Id)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AccountHandler) SearchAccount(ctx *gin.Context) {
	req := new(v1.SearchAccountRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	accounts, err := h.accountService.SearchAccount(ctx, req.AccountType, req.Email)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, accounts)
}

func (h *AccountHandler) CreateAccount(ctx *gin.Context) {
	req := new(model.Account)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.accountService.Create(ctx, req); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AccountHandler) UpdateAccount(ctx *gin.Context) {
	req := new(model.Account)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.accountService.Update(ctx, req); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

func (h *AccountHandler) DeleteAccount(ctx *gin.Context) {
	req := new(v1.DeleteAccountRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	if err := h.accountService.DeleteAccount(ctx, req.Id); err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, nil)
}

// 获取分享用户
func (h *AccountHandler) GetShareAccountList(ctx *gin.Context) {
	accounts, custom, random, err := h.accountService.GetShareAccountList(ctx)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}

	v1.HandleSuccess(ctx, &v1.ShareAccountResponseData{
		Accounts: accounts,
		Custom:   custom,
		Random:   random,
	})
}

func (h *AccountHandler) LoginShareAccount(ctx *gin.Context) {
	req := new(v1.LoginShareAccountRequest)

	if err := ctx.ShouldBindJSON(req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	url, err := h.accountService.LoginShareAccount(ctx, req)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	if url == "" {
		v1.HandleError(ctx, http.StatusBadRequest, errors.New("账号无效，请联系管理员"), nil)
		return
	}
	v1.HandleSuccess(ctx, url)
}

func (h *AccountHandler) GetOneApiChannelList(ctx *gin.Context) {
	channels, err := h.accountService.GetOneApiChannelList(ctx)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, channels)
}
