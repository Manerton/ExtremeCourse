package base_access

import (
	"context"
	"log"
	"main/internal/lib/jwttoken"
	"net/http"
	"strings"

	"github.com/google/uuid"
)

type UserInfoKey struct{}

type UserInfo struct {
	id   uuid.UUID
	role int
}

func BaseAccess(jwtManager *jwttoken.JWTManager) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

			authHeader := r.Header.Get("Authorization")
			if authHeader == "" {
				http.Error(w, "Missing Authorization header", http.StatusUnauthorized)
				return
			}

			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				http.Error(w, "Invalid Authorization header format", http.StatusUnauthorized)
				return
			}

			tokenString := parts[1]

			_, err := jwtManager.VerifyToken(tokenString)
			if err != nil {
				log.Printf("token verification failed: %v\n", err)
				http.Error(w, "token verification failed", http.StatusUnauthorized)
				return
			}

			claims, err := jwtManager.ParseAccessTokenWithClaims(tokenString)
			if err != nil {
				log.Printf("token parsed failed: %v\n", err)
				http.Error(w, "token parsed failed", http.StatusUnauthorized)
				return
			}
			id, err := uuid.Parse(claims.Subject)
			if err != nil {
				log.Printf("token error: %v", err)
				http.Error(w, "Invalid claims", http.StatusUnauthorized)
				return
			}
			role := claims.Role
			ctx := context.WithValue(r.Context(), UserInfoKey{}, UserInfo{id: id, role: role})
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func RoleBasedAccess(requiredRoles []int) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := r.Context().Value(UserInfoKey{}).(UserInfo)

			access := false

			for i := 0; i < len(requiredRoles) && !access; i++ {
				if user.role == requiredRoles[i] {
					access = true
				}
			}

			if !access {
				http.Error(w, "Access denied", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
