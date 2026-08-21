# Makefile for building and running the chemichemi Go backend

APP := chemichemi
CMD_DIR := ./backend/cmd
BINARY := bin/$(APP)

.PHONY: help build run fmt vet test clean docker

help:
	@echo "Usage: make [target]"
	@echo "Targets: build run fmt vet test clean docker help"

build:
	@echo "Building $(APP)..."
	bash -lc 'go build -o $(BINARY) $(CMD_DIR)'

run: build
	@echo "Loading .env (if present) and running $(APP)..."
	# Use bash to source .env and export variables. If the user set AFRICASTALKING_API_KEY
	# we map it to AT_APIKEY which the code expects. Then run the built binary.
	bash -lc 'set -a && [ -f .env ] && . .env && set +a; : ${AT_APIKEY:=${AFRICASTALKING_API_KEY}}; export AT_APIKEY; exec $(BINARY)'

# Run backend only (development, no build)
.PHONY: backend
backend:
	@echo "Loading .env and running backend (go run)..."
	bash -lc 'set -a && [ -f .env ] && . .env && set +a; : ${AT_APIKEY:=${AFRICASTALKING_API_KEY}}; export AT_APIKEY; exec go run $(CMD_DIR)'

# Run frontend only (development)
.PHONY: frontend
frontend:
	@echo "Starting frontend dev server..."
	bash -lc 'cd frontend && npm run dev'

# Start frontend and backend concurrently for local development
.PHONY: dev
dev:
	@echo "Starting frontend and backend concurrently (dev)..."
	# Source .env, export AT_APIKEY, then start frontend in background and run backend in foreground
	bash -lc 'set -a && [ -f .env ] && . .env && set +a; : ${AT_APIKEY:=${AFRICASTALKING_API_KEY}}; export AT_APIKEY; (cd frontend && npm run dev) & exec go run $(CMD_DIR)'

fmt:
	go fmt ./...

vet:
	go vet ./...

test:
	go test ./...

clean:
	@echo "Cleaning..."
	rm -rf $(BINARY)

docker: ## Build a Docker image (requires Dockerfile at repo root)
	docker build -t $(APP):latest .
