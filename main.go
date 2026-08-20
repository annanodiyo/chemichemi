package main

import (
	"embed"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"
)

//go:embed templates/*
var templatesFS embed.FS

//go:embed static/*
var staticFS embed.FS

var tmpl *template.Template

func main() {
	var err error
	tmpl, err = template.New("").ParseFS(templatesFS, "templates/*.html")
	if err != nil {
		log.Fatal("template parse failed:", err)
	}

	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "chemichemi.db"
	}
	if err := initDB(dbPath); err != nil {
		log.Fatal("database init failed:", err)
	}
	defer db.Close()

	mux := http.NewServeMux()

	staticHandler := http.FileServer(http.FS(staticFS))
	mux.Handle("/static/", staticHandler)

	mux.HandleFunc("/", indexHandler)
	mux.HandleFunc("/dashboard", dashboardHandler)
	mux.HandleFunc("/reports", reportsPageHandler)
	mux.HandleFunc("/reports-feed", reportsFeedHandler)

	mux.HandleFunc("/api/weather", apiWeatherHandler)
	mux.HandleFunc("/api/forecast", apiForecastHandler)
	mux.HandleFunc("/api/risk", apiRiskHandler)
	mux.HandleFunc("/api/reports", apiReportsHandler)
	mux.HandleFunc("/api/ledger", apiLedgerHandler)
	mux.HandleFunc("/api/ledger/verify", apiVerifyHandler)
	mux.HandleFunc("/health", healthHandler)

	handler := apply(mux,
		recoverer,
		securityHeaders,
		cors,
		rateLimiter,
		logger,
	)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	server := &http.Server{
		Addr:         ":" + port,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	go func() {
		sigChan := make(chan os.Signal, 1)
		signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
		<-sigChan
		log.Println("Shutting down Chemichemi gracefully...")
		server.Close()
	}()

	log.Printf("╔════════════════════════════════════════════════════════════╗")
	log.Printf("║  Chemichemi — Lake Victoria Fish Farmer Protector          ║")
	log.Printf("║  Vanilla Go | SQLite | HTMX | Tailwind | Blockchain        ║")
	log.Printf("║  Serving %d Kenyan fishing beaches                          ║", len(kenyanBeaches))
	log.Printf("║  http://localhost:%s                                       ║", port)
	log.Printf("╚════════════════════════════════════════════════════════════╝")

	if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatal(err)
	}
}