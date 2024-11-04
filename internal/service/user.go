package service

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"context"
	"github.com/patrickmn/go-cache"
	"github.com/pquerna/otp/totp"
	"github.com/spf13/viper"
	"time"
)

type UserService interface {
	Login(ctx context.Context, req *v1.LoginRequest) (string, map[string]interface{}, error)
	Get2FASecret(ctx context.Context) (string, string, error)
	Verify2FA(ctx context.Context, code string, secret string) (bool, error)
}

func NewUserService(service *Service, viper *viper.Viper) UserService {
	return &userService{
		Service: service,
		viper:   *viper,
		cache:   cache.New(time.Minute*5, time.Minute*10),
	}
}

type userService struct {
	*Service
	viper viper.Viper
	cache *cache.Cache
}

func (s *userService) Verify2FA(ctx context.Context, code string, secret string) (bool, error) {
	if secret == "" {
		return false, nil
	}

	valid := totp.Validate(code, secret)

	if valid {
		s.viper.Set("security.2fa_secret", secret)
		err := s.viper.WriteConfig()
		if err != nil {
			return false, err
		}
	}

	return valid, nil
}

func (s *userService) Get2FASecret(ctx context.Context) (string, string, error) {
	// 生成一个唯一的密钥，通常为每个用户生成一个唯一的秘钥
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "PandoraHelper",
		AccountName: "Admin",
	})
	if err != nil {
		return "", "", err
	}

	return key.URL(), key.Secret(), nil // URL可以生成二维码给用户扫描
}

func (s *userService) Login(ctx context.Context, req *v1.LoginRequest) (string, map[string]interface{}, error) {

	if s.viper.GetString("security.2fa_secret") != "" && req.ValidateCode == "" {
		return "", nil, v1.Err2FARequired
	}

	password := req.Password

	adminPassword := s.viper.GetString("security.admin_password")

	if password == adminPassword {

		if s.viper.GetString("security.2fa_secret") != "" && req.ValidateCode != "" {
			secret := s.viper.GetString("security.2fa_secret")
			valid, err := s.Verify2FA(ctx, req.ValidateCode, secret)
			if err != nil {
				return "", nil, err
			}
			if !valid {
				return "", nil, v1.Err2FACode
			}
		}

		token, err := s.jwt.GenToken("1", time.Now().Add(time.Hour*24*90))
		if err != nil {
			return "", nil, err
		}

		user := map[string]interface{}{
			"id":          1,
			"username":    "admin",
			"email":       "admin@linux.do",
			"role":        model.ADMIN_ROLE,
			"status":      1,
			"permissions": model.PERMISSION_LIST,
		}

		return token, user, nil
	}
	return "", nil, v1.ErrBadRequest
}
