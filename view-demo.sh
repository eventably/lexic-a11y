#!/bin/bash

# Get the directory where the script is located
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Determine the operating system and open the demo accordingly
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open "$DIR/demo.html"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows with Git Bash or similar
    start "$DIR/demo.html"
else
    # Linux or others
    xdg-open "$DIR/demo.html" 2>/dev/null || \
    gnome-open "$DIR/demo.html" 2>/dev/null || \
    kde-open "$DIR/demo.html" 2>/dev/null || \
    firefox "$DIR/demo.html" 2>/dev/null || \
    google-chrome "$DIR/demo.html" 2>/dev/null
fi

echo "Demo opened in your default browser. If it didn't open automatically, please open the file directly:"
echo "$DIR/demo.html"