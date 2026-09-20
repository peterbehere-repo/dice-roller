#!/bin/bash
# Dice Roller recovery script - run after a VM wipe.
# Toolchain: node/pnpm preinstalled on the Rool VM; nothing to apt/pip install.
# Project checkout: /rool-drive/projects/dice-roller (durable, this folder).
# Working copy for quick iteration: cp -r to /scratch if convenient, or work here directly.
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || pnpm install --offline 2>/dev/null || pnpm install
# Physics regression test (no browser needed):
node phys-test.mjs
echo "Recovery complete. Deploy: git push origin main (token embedded in remote URL)."
