package handler

import (
	"PandoraHelper/api/v1"
	"PandoraHelper/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
)

type UserHandler struct {
	*Handler
	userService service.UserService
	viper       *viper.Viper
}

func NewUserHandler(handler *Handler, userService service.UserService, viper *viper.Viper) *UserHandler {
	return &UserHandler{
		Handler:     handler,
		userService: userService,
		viper:       viper,
	}
}

func (h *UserHandler) ChatLoginIndex(ctx *gin.Context) {
	//从fs中读取文件
	ctx.HTML(http.StatusOK, "login_auth0.html", &gin.H{
		"IndexDomain": h.viper.GetString("pandora.domain.index"),
		"Title":       h.viper.GetString("http.title"),
	})
}

// Login godoc
// @Summary 后台账号登录
// @Schemes
// @Description
// @Tags 用户模块
// @Accept json
// @Produce json
// @Param request body v1.LoginRequest true "params"
// @Success 200 {object} v1.LoginResponse
// @Router /login [post]
func (h *UserHandler) Login(ctx *gin.Context) {
	var req v1.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		v1.HandleError(ctx, http.StatusBadRequest, v1.ErrBadRequest, nil)
		return
	}

	token, rules, err := h.userService.Login(ctx, &req)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, v1.LoginResponseData{
		AccessToken: token,
		User:        rules,
	})
}

func (h *UserHandler) Get2FASecret(ctx *gin.Context) {
	url, secret, err := h.userService.Get2FASecret(ctx)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, map[string]string{
		"url":    url,
		"secret": secret,
	})
}

func (h *UserHandler) Verify2FA(ctx *gin.Context) {
	code := ctx.Query("code")
	secret := ctx.Query("secret")
	valid, err := h.userService.Verify2FA(ctx, code, secret)
	if err != nil {
		v1.HandleError(ctx, http.StatusInternalServerError, err, nil)
		return
	}
	v1.HandleSuccess(ctx, valid)
}
