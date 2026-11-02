#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$APP_ROOT"

MEDIA_ONLY=false
NO_PUSH=false
PRUNE=false

for arg in "$@"; do
  case "$arg" in
    --media-only) MEDIA_ONLY=true ;;
    --no-push) NO_PUSH=true ;;
    --prune) PRUNE=true ;;
    *)
      echo "Unbekanntes Argument: $arg" >&2
      exit 1
      ;;
  esac
done

if [ -z "${DEPLOY_SSH:-}" ]; then
  echo "DEPLOY_SSH ist nicht gesetzt." >&2
  exit 1
fi

DEPLOY_REMOTE_BASE="${DEPLOY_REMOTE_BASE:-/data/schulnavigator}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-kunde/39-gs}"

SSH_BASE=(ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10)
if [ -n "${DEPLOY_SSH_IDENTITY_FILE:-}" ]; then
  IDENTITY_FILE="${DEPLOY_SSH_IDENTITY_FILE/#\~/$HOME}"
  SSH_BASE+=(-i "$IDENTITY_FILE")
fi

if ! "${SSH_BASE[@]}" "$DEPLOY_SSH" sudo -n true; then
  echo "sudo auf Remote nicht NOPASSWD — sudoers prüfen" >&2
  exit 1
fi

RSYNC_SSH="ssh -o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
if [ -n "${DEPLOY_SSH_IDENTITY_FILE:-}" ]; then
  IDENTITY_FILE="${DEPLOY_SSH_IDENTITY_FILE/#\~/$HOME}"
  RSYNC_SSH="$RSYNC_SSH -i $IDENTITY_FILE"
fi

npm run validate:stations
npm run validate:coach

DO_PUSH=true
if $MEDIA_ONLY || $NO_PUSH; then
  DO_PUSH=false
fi

if $DO_PUSH; then
  CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
  if [ "$CURRENT_BRANCH" != "$DEPLOY_BRANCH" ]; then
    echo "Deploy via Webhook nur von Branch $DEPLOY_BRANCH möglich. Nutze --media-only für Tests auf anderen Branches." >&2
    exit 1
  fi
  git push origin HEAD
fi

RSYNC_DELETE=()
if $PRUNE; then
  RSYNC_DELETE=(--delete)
fi

RSYNC_CHOWN=()
CHOWN_AFTER=false
if rsync --help 2>&1 | grep -q -- '--chown'; then
  RSYNC_CHOWN=(--chown=1001:1001)
else
  CHOWN_AFTER=true
fi

rsync_tree() {
  local src="$1"
  local dest="$2"
  local extra=()
  if ((${#RSYNC_DELETE[@]} > 0)); then
    extra+=("${RSYNC_DELETE[@]}")
  fi
  if ((${#RSYNC_CHOWN[@]} > 0)); then
    extra+=("${RSYNC_CHOWN[@]}")
  fi
  if ((${#extra[@]} > 0)); then
    rsync -avz --no-o --no-g --rsync-path="sudo rsync" \
      "${extra[@]}" \
      -e "$RSYNC_SSH" \
      "$src" \
      "${DEPLOY_SSH}:${dest}"
  else
    rsync -avz --no-o --no-g --rsync-path="sudo rsync" \
      -e "$RSYNC_SSH" \
      "$src" \
      "${DEPLOY_SSH}:${dest}"
  fi
}

rsync_tree "public/media/" "${DEPLOY_REMOTE_BASE}/media/"
rsync_tree "content/dialog-audio/" "${DEPLOY_REMOTE_BASE}/dialog-audio/"
rsync_tree "content/coach-audio/" "${DEPLOY_REMOTE_BASE}/coach-audio/"

if $CHOWN_AFTER; then
  "${SSH_BASE[@]}" "$DEPLOY_SSH" sudo chown -R 1001:1001 "$DEPLOY_REMOTE_BASE"
fi

if ! $MEDIA_ONLY && [ -n "${COOLIFY_DEPLOY_WEBHOOK_URL:-}" ]; then
  curl -fsS "$COOLIFY_DEPLOY_WEBHOOK_URL"
  echo ""
fi

echo "deploy-content: fertig."
