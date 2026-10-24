FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod ./
RUN go mod download
COPY main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o go_sync_broker main.go

FROM alpine:3.18
RUN adduser -D -u 1000 appuser
USER appuser
COPY --from=builder /app/go_sync_broker /usr/local/bin/go_sync_broker
EXPOSE 8081
ENTRYPOINT ["/usr/local/bin/go_sync_broker"]
