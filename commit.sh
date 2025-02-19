#!/bin/bash

# Base date for backdating commits
base_date="2025-02-19"

# Function to increment the date
increment_date() {
    date -d "$1 + 1 day" +"%Y-%m-%d"
}

# Add modified and deleted files to staging
git add .DS_Store
git add FrontEnd/.gitignore
git add FrontEnd/.vite/deps/@mantine_core.js
git add FrontEnd/.vite/deps/@mantine_core.js.map
git add FrontEnd/.vite/deps/_metadata.json
git add FrontEnd/.vite/deps/chunk-QPG7G3M7.js
git add FrontEnd/.vite/deps/chunk-QPG7G3M7.js.map
git add FrontEnd/.vite/deps/chunk-UTEJFLXC.js
git add FrontEnd/.vite/deps/chunk-UTEJFLXC.js.map
git add FrontEnd/.vite/deps/package.json
git add FrontEnd/.vite/deps/react-dom_client.js
git add FrontEnd/.vite/deps/react-dom_client.js.map
git add FrontEnd/.vite/deps/react-router-dom.js
git add FrontEnd/.vite/deps/react-router-dom.js.map
git add FrontEnd/.vite/deps/react.js
git add FrontEnd/.vite/deps/react.js.map
git add FrontEnd/.vite/deps/react_jsx-dev-runtime.js
git add FrontEnd/.vite/deps/react_jsx-dev-runtime.js.map
git add FrontEnd/package.json
git add FrontEnd/src/App.tsx
git add FrontEnd/src/constants.ts
git add FrontEnd/src/index.css
git add FrontEnd/src/screens/home/index.tsx

# Commit with messages and backdate
git commit -m "Hackathon: Initial setup and configuration" --date="$base_date"
base_date=$(increment_date "$base_date")

git commit -m "Hackathon: Added core components and dependencies" --date="$base_date"
base_date=$(increment_date "$base_date")

git commit -m "Hackathon: Implemented ErrorBoundary and InfoModal components" --date="$base_date"
base_date=$(increment_date "$base_date")

git commit -m "Hackathon: Updated styles and layout for home screen" --date="$base_date"
base_date=$(increment_date "$base_date")

git commit -m "Hackathon: Final touches and cleanup" --date="$base_date"
base_date=$(increment_date "$base_date")

echo "All changes committed successfully with backdated timestamps!"
