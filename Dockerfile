# Build the UI bundle
FROM node:20-alpine AS ui

WORKDIR /app
COPY ui/package.json ui/package-lock.json ./
RUN npm install
COPY ui/ ./
RUN npm run build

# API
FROM golang:1.24-alpine AS api
WORKDIR /app
COPY api/ ./
RUN go build -o sermon-analysis-api cmd/main.go

# Final image
FROM alpine:latest
WORKDIR /app
COPY --from=ui /app/dist/ ./pb_public/
COPY --from=api /app/sermon-analysis-api ./

CMD ["./sermon-analysis-api", "serve", "sermon-analyzer.fly.dev"]
# CMD ["./sermon-analysis-api", "serve", "sermon.corydio.com"]
# CMD ["./sermon-analysis-api", "serve", "--http=0.0.0.0:80"]
