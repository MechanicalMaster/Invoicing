#!/bin/zsh

# Source the user's zsh configuration
if [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc"
fi

# Ensure NVM is loaded
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Print environment info for debugging
echo "Shell environment loaded:"
echo "Node version: $(node -v 2>/dev/null || echo 'Not available')"
echo "NPM version: $(npm -v 2>/dev/null || echo 'Not available')"
echo "PNPM version: $(pnpm -v 2>/dev/null || echo 'Not available')" 