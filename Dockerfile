# Root Dockerfile: builds frontend and Go backend and produces single minimal image

# Frontend build stage (uses Node)
FROM node:20-alpine AS frontend-build
WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
# Clean install dependencies first for better caching
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Go build stage
FROM golang:1.22-alpine AS build
RUN apk add --no-cache git
WORKDIR /src

# FIX 1: Copy go.mod AND go.sum (using wildcard ? makes go.sum optional if it doesn't exist)
COPY go.mod go.sum? ./

# FIX 2: Tidy the modules to generate/verify go.sum before downloading
RUN go mod tidy && go mod download

# Copy entire repo; frontend build output will be copied from the previous stage
COPY . .
COPY --from=frontend-build /src/frontend/dist ./frontend/dist

# FIX 3: Run the build from the directory containing your main package
WORKDIR /src/backend/cmd
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-s -w" -o /app/chemichemi

# Final runtime image
FROM alpine:3.18
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/chemichemi /usr/local/bin/chemichemi
EXPOSE 8080
ENV PORT=8080
USER app
ENTRYPOINT ["/usr/local/bin/chemichemi"]
