package midlogger

import (
	"log/slog"
	"net/http"

	"github.com/go-chi/chi/v5/middleware"
)

func NewMidLogger(log *slog.Logger) func(next http.Handler) http.Handler {
	const op = "middleware/midlogger"

	return func(next http.Handler) http.Handler {
		log = log.With(
			slog.String("component", op),
		)

		log.Info("middleware logger enable")

		fn := func(w http.ResponseWriter, r *http.Request) {
			entry := log.With(
				slog.String("method", r.Method),
				slog.String("path", r.URL.Path),
			)

			wrapw := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			defer func() {
				entry.Info("request competed",
					slog.Int("status", wrapw.Status()),
				)
			}()
			next.ServeHTTP(wrapw, r)
		}

		return http.HandlerFunc(fn)
	}
}
