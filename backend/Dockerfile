#FROM rust:slim as builder
#WORKDIR /app
#COPY . .
#RUN cargo build --release

FROM debian:sid-slim

RUN apt-get update \
    && apt-get install -y \
    # Video preview thumbnailer
    # totem \
    # ffmpegthumbnailer \
    # Font preview thumbnailer
    gnome-font-viewer \
    # Image thumbnailer
    libgdk-pixbuf2.0-bin \
    # More image format supports
    libavif-bin libavif-gdk-pixbuf heif-thumbnailer \
    # PDF thumbnailer
    evince \
    # Office thumbnailer
    libgsf-bin \
    # Video formatter
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Copy built files
WORKDIR /app
#COPY --from=builder /app/target/release/meow_index .
COPY ./target/release/meow_index .
COPY ./res/thumb/* /usr/share/thumbnailers/

CMD ["./meow_index"]
