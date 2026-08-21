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
RUN go mod tidy && go mod download
COPY . .
COPY --from=frontend-build /src/frontend/dist ./backend/cmd/frontend/dist
WORKDIR /src/backend/cmd
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/chemichemi .

FROM alpine:3.18
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app

# Copy the compiled binary
COPY --from=build /app/chemichemi /usr/local/bin/chemichemi

# FIX 1: Recreate the directory structure your Go code expects
RUN mkdir -p backend

# FIX 2: Copy the users.json file (or an empty JSON template) from the build stage
COPY --from=build /src/backend/users.json ./backend/users.json

# FIX 3: Ensure the app user has permission to write to this file at runtime
RUN chown -R app:app /app

ENV PORT=8080
EXPOSE 8080
USER app
ENTRYPOINT ["/usr/local/bin/chemichemi"]
