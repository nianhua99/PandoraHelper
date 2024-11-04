package middleware

import (
	"PandoraHelper/internal/model"
	"PandoraHelper/internal/repository"
	"PandoraHelper/pkg/log"
	"bufio"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
	"io"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type ConversationLoggerMiddleware struct {
	logger     *log.Logger
	repository repository.ConversationRepository
}

func NewConversationLoggerMiddleware(logger *log.Logger, repo repository.ConversationRepository) *ConversationLoggerMiddleware {
	return &ConversationLoggerMiddleware{
		logger:     logger,
		repository: repo,
	}
}

func (m *ConversationLoggerMiddleware) ClaudeLogConversation() gin.HandlerFunc {
	return func(c *gin.Context) {
		re := regexp.MustCompile(`^/api/organizations/([^/]+)/chat_conversations/([^/]+)/completion$`)
		if re.MatchString(c.Request.URL.Path) {
			// Read the request body
			requestBody, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				m.logger.Error("Failed to read request body")
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

			var conversationRequest ClaudeConversationRequest
			if err := json.Unmarshal(requestBody, &conversationRequest); err != nil {
				m.logger.Error("Failed to unmarshal request body")
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			// Extract user messages
			userMessages := conversationRequest.Prompt

			// 创建一个响应记录器
			sseWriter := &sseClaudeResponseWriter{
				ResponseWriter: c.Writer,
				messages:       []string{},
			}
			c.Writer = sseWriter

			// 调用下一个处理器（这里是反向代理）
			c.Next()

			// 从记录的响应中提取助手消息
			assistantMessage := strings.Join(sseWriter.messages, "")

			conversationLog := &model.Conversation{
				UserMessage:      userMessages,
				AssistantMessage: assistantMessage,
				Product:          "claude",
				Model:            sseWriter.model,
				Timestamp:        time.Now(),
				ConversationID:   "",
				UserID:           extractUserID(c),
			}

			if err := m.repository.SaveConversation(c.Request.Context(), conversationLog); err != nil {
				m.logger.Error("Failed to save conversation log")
			}
		} else {
			c.Next()
		}
	}
}

func (m *ConversationLoggerMiddleware) ChatGptLogConversation() gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/backend-api/conversation" {
			// Read the request body
			requestBody, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				m.logger.Error("Failed to read request body")
				c.AbortWithStatus(http.StatusInternalServerError)
				return
			}
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(requestBody))

			var conversationRequest ChatGPTConversationRequest
			if err := json.Unmarshal(requestBody, &conversationRequest); err != nil {
				m.logger.Error("Failed to unmarshal request body")
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			// Extract user messages
			userMessages := extractChatGPTUserMessages(conversationRequest)

			// 创建一个响应记录器
			sseWriter := &sseResponseWriter{
				ResponseWriter: c.Writer,
				messages:       "",
			}
			c.Writer = sseWriter

			// 调用下一个处理器（这里是反向代理）
			c.Next()

			// 从记录的响应中提取助手消息
			assistantMessage := sseWriter.messages

			conversationLog := &model.Conversation{
				UserMessage:      userMessages,
				AssistantMessage: assistantMessage,
				Product:          "chatgpt",
				Model:            sseWriter.model,
				Timestamp:        time.Now(),
				ConversationID:   extractConversationID(conversationRequest),
				UserID:           extractUserID(c),
			}

			if err := m.repository.SaveConversation(c.Request.Context(), conversationLog); err != nil {
				m.logger.Error("Failed to save conversation log", zap.Error(err))
			}
		} else {
			c.Next()
		}
	}
}

func extractChatGPTUserMessages(request ChatGPTConversationRequest) string {
	var userMessages []string
	for _, msg := range request.Messages {
		if msg.Author.Role == "user" && msg.Content.ContentType == "text" {
			for _, part := range msg.Content.Parts {
				if textPart, ok := part.(string); ok {
					userMessages = append(userMessages, textPart)
				} else {
					// 如果遇到非字符串的情况，可以选择记录日志或其他处理
					fmt.Println("Unexpected non-string part in text message:", part)
				}
			}
		} else if msg.Author.Role == "user" && msg.Content.ContentType != "text" {
			// 遇到非文本信息
			for _, part := range msg.Content.Parts {
				if textPart, ok := part.(string); ok {
					userMessages = append(userMessages, textPart)
				} else {
					userMessages = append(userMessages, "[非文本信息]")
					// 如果遇到非字符串的情况，可以选择记录日志或其他处理
					fmt.Println("Unexpected non-string part in text message:", part)
				}
			}
		}
	}
	return strings.Join(userMessages, " ")
}

type sseResponseWriter struct {
	gin.ResponseWriter
	messages string
	model    string
}

type sseClaudeResponseWriter struct {
	gin.ResponseWriter
	messages []string
	model    string
}

func (w *sseResponseWriter) Write(data []byte) (int, error) {
	// 如果是 SSE 的请求
	if strings.Contains(w.Header().Get("Content-Type"), "text/event-stream") {
		reader := bufio.NewReader(bytes.NewReader(data))

		var totalBytesWritten int
		for {
			// 逐行读取数据
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					// 处理最后一次读取到的部分数据
					if len(line) > 0 {
						// 处理剩余的数据行
						bytesWritten, err := w.ResponseWriter.Write([]byte(line))
						if err != nil {
							return totalBytesWritten, err
						}
						totalBytesWritten += bytesWritten
					}
					break
				}
				return totalBytesWritten, err
			}

			// 如果是 SSE 格式的 "data: " 行，进行处理
			if strings.HasPrefix(line, "data: ") {
				jsonData := strings.TrimPrefix(line, "data: ")
				var event map[string]interface{}
				if err := json.Unmarshal([]byte(jsonData), &event); err == nil {
					// 提取并处理消息内容
					if message, ok := event["message"].(map[string]interface{}); ok {
						if content, ok := message["content"].(map[string]interface{}); ok {
							if parts, ok := content["parts"].([]interface{}); ok && len(parts) > 0 {
								if text, ok := parts[0].(string); ok {
									// 更新 messages 字段
									w.messages = text

									// 检查 model_slug 并更新 model 字段
									if metadata, ok := message["metadata"].(map[string]interface{}); ok {
										if model, ok := metadata["model_slug"].(string); ok {
											w.model = model
										}
									}
									if w.model == "" {
										w.model = "UNKNOWN"
									}
								}
							}
						}
					}
				}
			}

			// 将当前行写入到原始的 ResponseWriter 中，保持流式输出
			bytesWritten, err := w.ResponseWriter.Write([]byte(line))
			if err != nil {
				return totalBytesWritten, err
			}
			totalBytesWritten += bytesWritten

			// 刷新输出，确保数据立即发送到客户端
			w.ResponseWriter.Flush()
		}
		return totalBytesWritten, nil
	}

	// 对于非 SSE 请求，直接写入数据
	return w.ResponseWriter.Write(data)
}

func (w *sseClaudeResponseWriter) Write(data []byte) (int, error) {
	if strings.Contains(w.Header().Get("Content-Type"), "text/event-stream") {
		reader := bufio.NewReader(bytes.NewReader(data))
		for {
			line, err := reader.ReadString('\n')
			if err != nil {
				if err == io.EOF {
					break
				}
				return 0, err
			}
			if strings.HasPrefix(line, "data: ") {
				jsonData := strings.TrimPrefix(line, "data: ")
				var event map[string]interface{}
				if err := json.Unmarshal([]byte(jsonData), &event); err == nil {
					if completion, ok := event["completion"].(string); ok {
						w.messages = append(w.messages, completion)
						w.model = event["model"].(string)
					}
				}
			}
		}
	}
	return w.ResponseWriter.Write(data)
}

func (w *sseResponseWriter) WriteString(s string) (int, error) {
	return w.Write([]byte(s))
}

func extractConversationID(request ChatGPTConversationRequest) string {
	// Extract conversation ID from the request if available
	// This might depend on how your application structures the conversation request
	return ""
}

func extractUserID(c *gin.Context) string {
	// Extract user ID from the context
	// This might depend on how your application handles user authentication
	return ""
}

// responseRecorder 是一个自定义的 ResponseWriter，用于记录响应内容
type responseRecorder struct {
	gin.ResponseWriter
	Body *bytes.Buffer
}

func (r *responseRecorder) Write(b []byte) (int, error) {
	r.Body.Write(b)
	return r.ResponseWriter.Write(b)
}

func (r *responseRecorder) WriteString(s string) (int, error) {
	r.Body.WriteString(s)
	return r.ResponseWriter.WriteString(s)
}
