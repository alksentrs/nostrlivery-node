docker run -d -p 7000:8080 \
  --mount src=$(pwd)/config.toml,target=/usr/src/app/config.toml,type=bind \
  -v nostr-data:/usr/src/app/db \
  scsibug/nostr-rs-relay