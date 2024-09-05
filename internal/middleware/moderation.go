package middleware

import (
	"PandoraHelper/pkg/log"
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/go-resty/resty/v2"
	"go.uber.org/zap"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/spf13/viper"
)

type Message struct {
	Author struct {
		Role string `json:"role"`
	} `json:"author"`
	Content struct {
		ContentType string   `json:"content_type"`
		Parts       []string `json:"parts"`
	} `json:"content"`
}

type ChatGPTConversationRequest struct {
	Messages []Message `json:"messages"`
}

type ClaudeConversationRequest struct {
	Prompt string
}

func ContentModerationMiddleware(conf *viper.Viper, logger *log.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		if c.Request.URL.Path == "/backend-api/conversation" {
			body, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

			var requestBody ChatGPTConversationRequest
			if err := json.Unmarshal(body, &requestBody); err != nil {
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			userMessages := []string{}
			for _, msg := range requestBody.Messages {
				if msg.Author.Role == "user" && msg.Content.ContentType == "text" {
					userMessages = append(userMessages, msg.Content.Parts...)
				}
			}

			if len(userMessages) > 0 {
				shouldBlock, err := checkContentForModeration(userMessages, conf.GetString("moderation.apiKey"), conf.GetString("moderation.apiUrl"), logger)
				if err != nil {
					c.AbortWithError(http.StatusInternalServerError, err)
					return
				}
				if shouldBlock {
					c.JSON(http.StatusTooEarly, gin.H{"detail": conf.GetString("moderation.message")})
					c.Abort()
					return
				}
			}
		}

		re := regexp.MustCompile(`^/api/organizations/([^/]+)/chat_conversations/([^/]+)/completion$`)
		// Claude道德检查
		if re.MatchString(c.Request.URL.Path) {
			body, err := ioutil.ReadAll(c.Request.Body)
			if err != nil {
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}
			c.Request.Body = ioutil.NopCloser(bytes.NewBuffer(body))

			var requestBody ClaudeConversationRequest
			if err := json.Unmarshal(body, &requestBody); err != nil {
				c.AbortWithStatus(http.StatusBadRequest)
				return
			}

			userMessages := []string{}
			userMessages = append(userMessages, requestBody.Prompt)

			if len(userMessages) > 0 {
				shouldBlock, err := checkContentForModeration(userMessages, conf.GetString("moderation.apiKey"), conf.GetString("moderation.apiUrl"), logger)
				if err != nil {
					c.AbortWithError(http.StatusInternalServerError, err)
					return
				}
				if shouldBlock {
					c.JSON(http.StatusTooEarly, gin.H{"detail": conf.GetString("moderation.message")})
					c.Abort()
					return
				}
			}
		}
		c.Next()
	}
}

func checkContentForModeration(messages []string, apiKey string, apiHost string, logger *log.Logger) (bool, error) {
	client := resty.New()
	client.SetTimeout(time.Second * 10)

	userMessage := strings.Join(messages, " ")

	resp, err := client.R().
		SetHeader("Content-Type", "application/json").
		SetHeader("Authorization", fmt.Sprintf("Bearer %s", apiKey)).
		SetBody(map[string]interface{}{
			"input": userMessage,
		}).
		Post(apiHost)

	if err != nil {
		return false, err
	}

	if resp.StatusCode() != http.StatusOK {
		logger.Error("Moderation API returned an error: {}", zap.Any("body", resp.Body()))
		return false, fmt.Errorf("Moderation API returned an error: %d", resp.StatusCode())
	}

	var result map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &result); err != nil {
		return false, err
	}

	results, ok := result["results"].([]interface{})
	if !ok {
		return false, fmt.Errorf("Unexpected response format")
	}

	for _, r := range results {
		if flagged, ok := r.(map[string]interface{})["flagged"].(bool); ok && flagged {
			return true, nil
		}
	}

	return false, nil
}
