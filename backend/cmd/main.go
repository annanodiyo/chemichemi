package main

import (
	"chemichemi/backend/internal/sms"
	"chemichemi/backend/internal/store"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"
)

type Application struct {
	userStore *store.UserStore
	smsClient *sms.Client
}

func main() {
	// 1. Initialize user store (reads users.json from project root)
	userStore, err := store.NewUserStore("users.json")
	if err != nil {
		log.Fatalf("Failed to initialize user store: %v", err)
	}

	// 2. Initialize Africa's Talking client
	smsClient := sms.NewClient()

	app := &Application{
		userStore: userStore,
		smsClient: smsClient,
	}

	// 3. Register HTTP handlers
	http.HandleFunc("/webhook/sms", app.handleIncomingSMS)
	http.HandleFunc("/api/trigger-alert", app.handleTriggerAlert)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s...", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
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

	w.WriteHeader(http.StatusAccepted)
	w.Write([]byte(`{"status":"alert broadcast initiated"}`))
}
