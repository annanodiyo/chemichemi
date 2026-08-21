FROM node:22-alpine AS frontend-build

WORKDIR /src/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build


FROM golang:1.25-alpine AS build

RUN apk add --no-cache git

WORKDIR /src

COPY go.mod go.sum? ./
RUN go mod download

COPY . .

COPY --from=frontend-build /src/frontend/dist ./backend/cmd/frontend/dist

WORKDIR /src/backend/cmd

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/chemichemi


FROM alpine:3.18

RUN addgroup -S app && adduser -S app -G app

WORKDIR /app

COPY --from=build /app/chemichemi /usr/local/bin/chemichemi

ENV PORT=8080

EXPOSE 8080

USER app

ENTRYPOINT ["/usr/local/bin/chemichemi"]
