#!/usr/bin/env bash
set -euo pipefail
pkg="docs-go_linux_amd64"
url="https://repo.acovia.net/packages/docs-go/${pkg}.tar.gz"

wget "${url}"
tar -xzvf ${pkg}.tar.gz

chmod +x ./${pkg}/docs-go

./${pkg}/docs-go build .