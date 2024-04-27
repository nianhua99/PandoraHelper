package jwt

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"regexp"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/spf13/viper"
)

type JWT struct {
	key []byte
}

type MyCustomClaims struct {
	UserId string
	jwt.RegisteredClaims
}

func generateRandomJwtSecret(length int) (string, error) {
	// 创建一个用于存储随机字节的切片
	randomBytes := make([]byte, length)
	// 使用crypto/rand库生成随机字节
	_, err := rand.Read(randomBytes)
	if err != nil {
		return "", fmt.Errorf("生成随机JWT密钥时出错: %v", err)
	}

	// 将随机字节转换为十六进制字符串
	randomHex := hex.EncodeToString(randomBytes)

	return randomHex, nil
}

func NewJwt(conf *viper.Viper) *JWT {
	//随机生成一个Jwt密钥
	jwtSecret, err := generateRandomJwtSecret(32)
	if err != nil {
		panic(err)
	}
	return &JWT{
		key: []byte(jwtSecret),
	}
}

func (j *JWT) GenToken(userId string, expiresAt time.Time) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, MyCustomClaims{
		UserId: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expiresAt),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
			Issuer:    "",
			Subject:   "",
			ID:        "",
			Audience:  []string{},
		},
	})

	// Sign and get the complete encoded token as a string using the key
	tokenString, err := token.SignedString(j.key)
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

func (j *JWT) ParseToken(tokenString string) (*MyCustomClaims, error) {
	re := regexp.MustCompile(`(?i)Bearer `)
	tokenString = re.ReplaceAllString(tokenString, "")
	if tokenString == "" {
		return nil, errors.New("token is empty")
	}
	token, err := jwt.ParseWithClaims(tokenString, &MyCustomClaims{}, func(token *jwt.Token) (interface{}, error) {
		return j.key, nil
	})
	if claims, ok := token.Claims.(*MyCustomClaims); ok && token.Valid {
		return claims, nil
	} else {
		return nil, err
	}
}
