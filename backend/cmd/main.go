package main

import (
	"chemichemi/backend/internal/sms"
	"chemichemi/backend/internal/store"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type Application struct {
	userStore *store.UserStore
	smsClient *sms.Client
}

func main() {
	userStore, err := store.NewUserStore(usersFilePath())
	if err != nil {
		log.Fatalf("Failed to initialize user store: %v", err)
	}

	// 2. Initialize Africa's Talking client
	smsClient := sms.NewClient()

	app := &Application{
		userStore: userStore,
		smsClient: smsClient,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/healthz", app.handleHealth)
	mux.HandleFunc("/webhook/sms", app.handleIncomingSMS)
	mux.HandleFunc("/api/trigger-alert", app.handleTriggerAlert)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:              ":" + port,
		Handler:           withCORS(mux),
		ReadHeaderTimeout: 5 * time.Second,
	}
	log.Printf("Server running on port %s...", port)
	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}

func usersFilePath() string {
	if configuredPath := os.Getenv("USERS_FILE"); configuredPath != "" {
		return configuredPath
	}
	for _, candidate := range []string{"backend/users.json", "users.json"} {
		if _, err := os.Stat(candidate); err == nil {
			return candidate
		}
	}
	return filepath.Join("backend", "users.json")
}

func withCORS(next http.Handler) http.Handler {
	origin := os.Getenv("CORS_ORIGIN")
	if origin == "" {
		origin = "http://127.0.0.1:5173"
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (app *Application) handleHealth(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(`{"status":"ok"}`))
}

func (app *Application) handleIncomingSMS(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := r.ParseForm(); err != nil {
		http.Error(w, "Bad request", http.StatusBadRequest)
		return
	}

	from := r.FormValue("from")
	text := strings.TrimSpace(r.FormValue("text"))

	parts := strings.SplitN(text, " ", 2)
	command := strings.ToUpper(parts[0])

	var reply string

	switch command {
	case "REGISTER", "JOIN":
		name := "Subscriber"
		if len(parts) > 1 {
			name = parts[1]
		}
		if err := app.userStore.RegisterOrUpdate(from, name); err != nil {
			log.Printf("Registration error: %v", err)
			reply = "Registration failed. Please try again."
		} else {
			reply = "Welcome " + name + "! You are registered for system alerts. Reply STOP anytime to unsubscribe."
		}

	case "STOP", "UNSUBSCRIBE":
		if err := app.userStore.Deactivate(from); err != nil {
			log.Printf("Deactivation error: %v", err)
		}
		reply = "You have been unsubscribed from alerts."

	default:
		user, exists := app.userStore.GetUser(from)
		if !exists || !user.Active {
			reply = "You are not registered. Reply 'REGISTER <Your Name>' to receive alerts."
		} else {
			reply = "Hello " + user.Name + ", your registration is active."
		}
	}

	if reply != "" {
		if err := app.smsClient.SendSMS(from, reply); err != nil {
			log.Printf("Failed to send reply SMS: %v", err)
		}
	}

	w.WriteHeader(http.StatusOK)
}

func (app *Application) handleTriggerAlert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 8<<10)
	var req struct {
		Message string `json:"message"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || req.Message == "" {
		http.Error(w, "Invalid payload. Field 'message' is required.", http.StatusBadRequest)
		return
	}

	// Broadcast alert asynchronously to active users
	go func(alertText string) {
		activeUsers := app.userStore.GetActiveUsers()
		log.Printf("Broadcasting alert to %d active users...", len(activeUsers))

		for _, user := range activeUsers {
			if err := app.smsClient.SendSMS(user.Phone, alertText); err != nil {
				log.Printf("Alert dispatch failed for %s (%s): %v", user.Name, user.Phone, err)
			} else {
				log.Printf("Alert dispatched to %s (%s)", user.Name, user.Phone)
			}
		}
	}(req.Message)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_, _ = w.Write([]byte(`{"status":"alert broadcast initiated"}`))
}
