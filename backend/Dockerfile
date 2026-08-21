# Multi-stage Dockerfile for the chemichemi Go backend

FROM golang:1.22-alpine AS build
RUN apk add --no-cache git
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
WORKDIR /src/backend/cmd
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags='-s -w' -o /app/chemichemi

FROM alpine:3.18
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/chemichemi /usr/local/bin/chemichemi
EXPOSE 8080
ENV PORT=8080
USER app
ENTRYPOINT ["/usr/local/bin/chemichemi"]
