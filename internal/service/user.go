package service

import (
	v1 "PandoraHelper/api/v1"
	"PandoraHelper/internal/model"
	"context"
	"github.com/spf13/viper"
	"time"
)

type UserService interface {
	Login(ctx context.Context, req *v1.LoginRequest) (string, map[string]interface{}, error)
}

func NewUserService(service *Service, viper *viper.Viper) UserService {
	return &userService{
		Service: service,
		viper:   *viper,
	}
}

type userService struct {
	*Service
	viper viper.Viper
}

func (s *userService) Login(ctx context.Context, req *v1.LoginRequest) (string, map[string]interface{}, error) {
	password := req.Password

	adminPassword := s.viper.GetString("security.admin_password")

	if password == adminPassword {
		token, err := s.jwt.GenToken("1", time.Now().Add(time.Hour*24*90))
		if err != nil {
			return "", nil, err
		}

		user := map[string]interface{}{
			"id":          1,
			"username":    "admin",
			"email":       "admin@uasm.com",
			"role":        model.ADMIN_ROLE,
			"status":      1,
			"permissions": model.PERMISSION_LIST,
		}

		return token, user, nil
	}
	return "", nil, v1.ErrBadRequest
}
