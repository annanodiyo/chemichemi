# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o chemichemi .

# Runtime stage — minimal image
FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /root/

COPY --from=builder /app/chemichemi .
# Templates and static are embedded; no COPY needed

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["./chemichemi"]