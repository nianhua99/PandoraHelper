package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
)

type HealthCheckHandler struct {
}

func NewHealthCheckHandler() *HealthCheckHandler {
	return &HealthCheckHandler{}
}

// GetHealthCheck is the handler function for the /health endpoint
func (h *HealthCheckHandler) GetHealthCheck(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"status": "healthy"})
}

// ReadinessHandler is the handler function for the /readiness endpoint
func (h *HealthCheckHandler) ReadinessHandler(ctx *gin.Context) {
	ctx.JSON(http.StatusOK, gin.H{"status": "ready"})
}
