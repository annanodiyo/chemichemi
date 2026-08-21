# =========================
# Frontend build
# =========================
FROM node:22-alpine AS frontend-build

WORKDIR /src/frontend

COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


# =========================
# Backend build
# =========================
FROM golang:1.22-alpine AS build

RUN apk add --no-cache git

WORKDIR /src

COPY go.mod ./
COPY go.sum* ./
RUN go mod download

COPY . .

# Copy frontend build output directly into backend/cmd/frontend/dist
COPY --from=frontend-build /src/frontend/dist ./backend/cmd/frontend/dist

WORKDIR /src/backend/cmd

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" \
    -o /app/chemichemi main.go


# =========================
# Production image
# =========================
FROM alpine:3.21

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=build /app/chemichemi ./chemichemi

RUN chown -R app:app /app

USER app

ENV PORT=8080

EXPOSE 8080

CMD ["./chemichemi"]
