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

# 1. Copy backend source code first
COPY . .

# 2. Explicitly remove any stale target directory from the host copy
RUN rm -rf /src/backend/cmd/frontend/dist

# 3. Copy dist using absolute paths to avoid relative WORKDIR ambiguity
COPY --from=frontend-build /src/frontend/dist /src/backend/cmd/frontend/dist

# 4. Build directly from /src without changing WORKDIR to /src/backend/cmd
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" \
    -o /app/chemichemi ./backend/cmd


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
