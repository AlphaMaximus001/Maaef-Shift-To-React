#!/bin/bash
# SessionStart hook — prepares a Claude Code on the web container for this repo.
#
# The container is ephemeral: it is rebuilt from a base image each session and
# reclaimed after inactivity, so anything installed by hand does not persist.
# This script restores the two things the repo needs but the base image lacks.
set -euo pipefail

# Local machines already have their own toolchain; only do this on the web.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# --- Node dependencies -------------------------------------------------------
# `install` rather than `ci` so a cached container layer can be reused; it is
# idempotent and returns quickly when node_modules is already up to date.
# --no-save keeps npm from rewriting package-lock.json: resolving peers locally
# rewrites "peer"/"optional" bookkeeping and adds optional platform entries,
# which left the working tree dirty after every session start without any
# declared dependency actually changing.
echo "session-start: installing npm dependencies"
npm install --no-audit --no-fund --no-save

# --- ffmpeg ------------------------------------------------------------------
# Not present in the base image. The only ffmpeg on disk belongs to Playwright
# and is built with --disable-everything (no H.264 decoder, no mp4 demuxer), so
# it cannot touch the H.264 clips in public/videos. Best-effort: a transient apt
# failure should not stop the session from starting.
if command -v ffmpeg >/dev/null 2>&1; then
  echo "session-start: ffmpeg already present"
else
  echo "session-start: installing ffmpeg"
  if ! (
    export DEBIAN_FRONTEND=noninteractive
    # Refresh only the Ubuntu archive. The image also carries third-party PPAs
    # that the network policy blocks, and fetching them just adds latency and
    # scary-looking warnings to every session start.
    UBUNTU_SOURCES=/etc/apt/sources.list.d/ubuntu.sources
    if [ -f "$UBUNTU_SOURCES" ]; then
      apt-get update -qq \
        -o Dir::Etc::sourcelist="$UBUNTU_SOURCES" \
        -o Dir::Etc::sourceparts=-
    else
      apt-get update -qq
    fi
    apt-get install -y -qq ffmpeg
  ); then
    echo "session-start: WARNING ffmpeg install failed; video tooling unavailable" >&2
  fi
fi

echo "session-start: ready"
