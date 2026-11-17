#!/usr/bin/env bash
set -euo pipefail

url="https://repo.acovia.net/packages/docs-go"

curl -fsSL "$url" -o ./docs-go
chmod +x ./docs-go

./docs-go build .