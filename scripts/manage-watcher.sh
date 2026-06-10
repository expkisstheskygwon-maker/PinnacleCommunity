#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLIST_NAME="com.user.gitwatcher.plist"
PLIST_SOURCE="$SCRIPT_DIR/$PLIST_NAME"
PLIST_DEST="$HOME/Library/LaunchAgents/$PLIST_NAME"
LOG_DIR="$SCRIPT_DIR/../scratch"
LOG_FILE="$LOG_DIR/git-watcher.log"
ERROR_LOG_FILE="$LOG_DIR/git-watcher-error.log"

case "$1" in
    start)
        echo "Installing LaunchAgent..."
        mkdir -p "$HOME/Library/LaunchAgents"
        cp "$PLIST_SOURCE" "$PLIST_DEST"
        chmod 644 "$PLIST_DEST"
        
        echo "Loading LaunchAgent service..."
        # Unload if already loaded
        launchctl unload "$PLIST_DEST" 2>/dev/null
        launchctl load "$PLIST_DEST"
        
        echo "Service started."
        echo "To view logs, run: $0 status"
        ;;
    stop)
        echo "Stopping LaunchAgent service..."
        launchctl unload "$PLIST_DEST" 2>/dev/null
        if [ -f "$PLIST_DEST" ]; then
            rm "$PLIST_DEST"
            echo "LaunchAgent plist removed."
        fi
        echo "Service stopped."
        ;;
    status)
        echo "--- LaunchAgent Process Status ---"
        launchctl list | grep com.user.gitwatcher || echo "com.user.gitwatcher is not running."
        
        echo ""
        echo "--- Output Log (Last 15 lines) ---"
        if [ -f "$LOG_FILE" ]; then
            tail -n 15 "$LOG_FILE"
        else
            echo "Log file not found at: $LOG_FILE"
        fi
        
        echo ""
        echo "--- Error Log (Last 15 lines) ---"
        if [ -f "$ERROR_LOG_FILE" ]; then
            tail -n 15 "$ERROR_LOG_FILE"
        else
            echo "Error log file not found at: $ERROR_LOG_FILE"
        fi
        ;;
    *)
        echo "Usage: $0 {start|stop|status}"
        exit 1
        ;;
esac

exit 0
