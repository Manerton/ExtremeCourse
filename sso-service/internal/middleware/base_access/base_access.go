package base_access

import (
	"log"
	"main/internal/lib/jwttoken"
	"net/http"
	"strings"
)

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

			// cookie, err := r.Cookie("token")
			// if err != nil {
			// 	log.Println("token missing in cookie")
			// 	render.Status(r, http.StatusUnauthorized)
			// 	render.JSON(w, r, response.ErrorResponse("missing token in cookie"))
			// 	return
			// }

			_, err := jwtManager.VerifyToken(tokenString)
			if err != nil {
				log.Printf("token verification failed: %v\n", err)
				http.Error(w, "token verification failed", http.StatusUnauthorized)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}
