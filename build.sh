#!/bin/bash

IMAGE_NAME="ghcr.io/yuinakorn/next_hotspot_monitor"

echo "Building and pushing $IMAGE_NAME..."
if [ ! -z "$1" ]; then
  echo "Build comment: $1"
fi

# Build for linux/amd64 platform
docker buildx build --platform linux/amd64 -t $IMAGE_NAME:latest --push .

echo "Done!"
