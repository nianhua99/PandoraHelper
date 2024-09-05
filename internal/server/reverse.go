package server

import (
	"PandoraHelper/internal/middleware"
	"PandoraHelper/pkg/log"
	"PandoraHelper/pkg/server/reverse/chatgpt"
	"PandoraHelper/pkg/server/reverse/claude"
	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func NewChatGPTReverseProxyServer(
	logger *log.Logger,
	conf *viper.Viper,
	conversationLoggerMiddleware *middleware.ConversationLoggerMiddleware,
) *chatgpt.Server {
	r := gin.Default()

	target := conf.GetString("http.proxy-pass.oaifree.host") // 反向代理的目标网站

	// 创建反向代理处理函数
	proxyHandler := reverseProxy(target)

	if conf.GetString("moderation.apiKey") != "" && conf.GetString("moderation.apiUrl") != "" {
		r.POST("/backend-api/conversation",
			middleware.ContentModerationMiddleware(conf, logger),
			conversationLoggerMiddleware.ChatGptLogConversation(),
			proxyHandler,
		)
	} else {
		r.POST("/backend-api/conversation",
			conversationLoggerMiddleware.ChatGptLogConversation(),
			proxyHandler,
		)
	}

	// 处理所有请求
	r.Use(func(c *gin.Context) {
		path := c.Request.URL.Path
		if path == "/backend-api/conversation" && c.Request.Method == "POST" {
			// 已经在上面处理过了，直接返回
			return
		}
		// 对于其他所有请求，使用反向代理
		proxyHandler(c)
	})

	s := chatgpt.NewServer(
		r,
		logger,
		chatgpt.WithServerHost(conf.GetString("http.host")),
		chatgpt.WithServerPort(conf.GetInt("http.proxy-pass.oaifree.port")),
	)

	return s
}

func NewClaudeReverseProxyServer(
	logger *log.Logger,
	conf *viper.Viper,
	conversationLoggerMiddleware *middleware.ConversationLoggerMiddleware,
) *claude.Server {
	r := gin.Default()

	target := conf.GetString("http.proxy-pass.fuclaude.host") // 反向代理的目标网站

	// 创建反向代理处理函数
	proxyHandler := reverseProxy(target)

	if conf.GetString("moderation.apiKey") != "" && conf.GetString("moderation.apiUrl") != "" {
		r.POST("/api/organizations/:id1/chat_conversations/:id2/completion",
			middleware.ContentModerationMiddleware(conf, logger),
			conversationLoggerMiddleware.ClaudeLogConversation(),
			proxyHandler,
		)
	} else {
		r.POST("/api/organizations/:id1/chat_conversations/:id2/completion",
			conversationLoggerMiddleware.ClaudeLogConversation(),
			proxyHandler,
		)
	}

	// 处理所有请求
	r.Use(proxyHandler)

	s := claude.NewServer(
		r,
		logger,
		claude.WithServerHost(conf.GetString("http.host")),
		claude.WithServerPort(conf.GetInt("http.proxy-pass.fuclaude.port")),
	)

	return s
}

func reverseProxy(target string) gin.HandlerFunc {
	url, _ := url.Parse(target)
	proxy := httputil.NewSingleHostReverseProxy(url)

	// 修改默认的Director函数
	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		//保持原始的Host头
		req.Host = url.Host

	}

	return func(c *gin.Context) {
		proxy.ServeHTTP(c.Writer, c.Request)
	}
}
