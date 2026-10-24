FROM rust:1.90-alpine AS builder
WORKDIR /app
RUN apk add --no-cache musl-dev
COPY Cargo.toml ./
COPY src ./src
RUN cargo build --release

FROM alpine:3.18
RUN adduser -D -u 1000 appuser
USER appuser
COPY --from=builder /app/target/release/rust_crypto_engine /usr/local/bin/rust_crypto_engine
EXPOSE 8083
ENTRYPOINT ["rust_crypto_engine"]
