package jwttoken

import (
	"errors"
	"fmt"
	"main/internal/models/user"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenAccessClaims struct {
	Email string `json:"email"`
	Role  int    `json:"role"`
	jwt.RegisteredClaims
}

type TokenRefreshClaims struct {
	ID string `json:"id"`
	TokenAccessClaims
}

type TokenLinkClaims struct {
	Type int `json:"type"`
	jwt.RegisteredClaims
}

type JWTManager struct {
	secretKey       []byte
	accessDuration  time.Duration
	refreshDuration time.Duration
}

func NewJWTManager(secretKey []byte, accessDuration time.Duration, refreshDuration time.Duration) *JWTManager {
	return &JWTManager{
		secretKey:       secretKey,
		accessDuration:  accessDuration,
		refreshDuration: refreshDuration,
	}
}

func (m *JWTManager) GetAccessDuration() time.Duration {
	return m.accessDuration
}

func (m *JWTManager) GetRefreshDuration() time.Duration {
	return m.refreshDuration
}

func (m *JWTManager) ParseRefreshTokenWithClaims(tokenStr string) (*TokenRefreshClaims, error) {
	const op = "jwtManager.ParseRefreshTokenWithClaims"

	token, err := jwt.ParseWithClaims(tokenStr, &TokenRefreshClaims{}, func(token *jwt.Token) (interface{}, error) {
		return m.secretKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	claims, ok := token.Claims.(*TokenRefreshClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (m *JWTManager) ParseAccessTokenWithClaims(tokenStr string) (*TokenAccessClaims, error) {
	const op = "jwtManager.ParseAccessTokenWithClaims"

	token, err := jwt.ParseWithClaims(tokenStr, &TokenAccessClaims{}, func(token *jwt.Token) (interface{}, error) {
		return m.secretKey, nil
	})
	if err != nil {
		return nil, fmt.Errorf("%s: %w", op, err)
	}

	claims, ok := token.Claims.(*TokenAccessClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	return claims, nil
}

func (m *JWTManager) CreateToken(user user.User) (string, error) {
	claims := TokenAccessClaims{
		Email: user.Email,
		Role:  int(user.Role),
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   user.ID.String(),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.accessDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenStr, err := token.SignedString(m.secretKey)
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}

func (m *JWTManager) CreateRefreshToken(user user.User, tokenId string) (string, error) {
	claims := TokenRefreshClaims{
		ID: tokenId,
		TokenAccessClaims: TokenAccessClaims{
			Email: user.Email,
			Role:  int(user.Role),
			RegisteredClaims: jwt.RegisteredClaims{
				Subject:   user.ID.String(),
				ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.refreshDuration)),
				IssuedAt:  jwt.NewNumericDate(time.Now()),
			},
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenStr, err := token.SignedString(m.secretKey)
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}

func (m *JWTManager) CreateLinkToken(id string, objectType int) (string, error) {

	claims := TokenLinkClaims{
		Type: objectType,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   id,
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(m.refreshDuration * 3)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, err := token.SignedString(m.secretKey)
	if err != nil {
		return "", err
	}

	return tokenStr, nil
}

func (m *JWTManager) VerifyToken(token string) (*jwt.Token, error) {
	tokenParsed, err := jwt.Parse(token, func(token *jwt.Token) (interface{}, error) {
		return m.secretKey, nil
	})

	if err != nil {
		return nil, err
	}

	if !tokenParsed.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	return tokenParsed, nil
}
