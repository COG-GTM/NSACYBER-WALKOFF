#!/bin/bash
# usage: run-api.sh <container-name> <repo-checkout> <api-port>
# Serves <repo-checkout>/api/client/dist/walkoff through the WALKOFF API on <api-port>.
set -e
NAME=$1; SRC=$2; PORT=$3
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --network host \
  -v "$SRC":/app -w /app \
  -e CONFIG_PATH=/app/data/local_config.yml \
  -e REDIS_URI="${REDIS_URI:-redis://localhost:6379}" \
  walkoff_core_api:local \
  uvicorn api.server.app:app --host 127.0.0.1 --port "$PORT" --lifespan on
