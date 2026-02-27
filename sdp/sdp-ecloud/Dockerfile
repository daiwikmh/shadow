# Build context must be the sdp/ parent directory:
#   docker build -f sdp-ecloud/Dockerfile -t sdp-ecloud:latest .

FROM --platform=linux/amd64 rust:latest AS builder

WORKDIR /app

# Copy both workspace trees so path deps resolve correctly
COPY ecloud/     ./ecloud/
COPY sdp-ecloud/ ./sdp-ecloud/

WORKDIR /app/sdp-ecloud

RUN cargo build --release

# ── Runtime image ──────────────────────────────────────────────────────────────
FROM --platform=linux/amd64 debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /app/sdp-ecloud/target/release/sdp-ecloud .

EXPOSE 3000

CMD ["./sdp-ecloud"]
