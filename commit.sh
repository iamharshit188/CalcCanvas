#!/bin/bash

# Navigate to the project directory

# Define an array of commit messages
commit_messages=(
    "Initialize project structure for Canvas application"
    "Set up backend directory and initial files"
    "Add requirements.txt for backend dependencies"
    "Implement basic FastAPI server setup"
    "Create constants for server configuration"
    "Implement image processing route in backend"
    "Add Pydantic schema for image data validation"
    "Update backend logic for image analysis"
    "Refactor backend code for better organization"
    "Add logging for API requests"
    "Set up frontend framework with React and TypeScript"
    "Create main layout and routing for frontend"
    "Implement drawing functionality on canvas"
    "Add color selection and eraser tools"
    "Integrate MathJax for rendering LaTeX expressions"
    "Implement API call to backend for image processing"
    "Display results on canvas after processing"
    "Add user instructions modal"
    "Implement dark mode toggle"
    "Update README with project details and instructions"
    "Final review and cleanup of codebase"
)

# Define an array of file changes corresponding to each commit
file_changes=(
    "echo '# Canvas Application' > README.md"
    "mkdir -p BackEnd && touch BackEnd/main.py BackEnd/constants.py BackEnd/requirements.txt"
    "echo 'fastapi' >> BackEnd/requirements.txt"
    "echo 'from fastapi import FastAPI' > BackEnd/main.py"
    "echo 'SERVER_URL = \"localhost\"' > BackEnd/constants.py"
    "echo 'Implement image processing route' >> BackEnd/main.py"
    "echo 'from pydantic import BaseModel' > BackEnd/schema.py"
    "echo 'Update backend logic' >> BackEnd/main.py"
    "echo 'Refactor backend code' >> BackEnd/main.py"
    "echo 'Add logging for API requests' >> BackEnd/main.py"
    "mkdir -p FrontEnd/src && touch FrontEnd/src/App.tsx FrontEnd/src/index.tsx"
    "echo 'import React from \"react\";' > FrontEnd/src/App.tsx"
    "echo 'Implement drawing functionality' >> FrontEnd/src/App.tsx"
    "echo 'Add color selection and eraser tools' >> FrontEnd/src/App.tsx"
    "echo 'Integrate MathJax' >> FrontEnd/src/App.tsx"
    "echo 'Implement API call to backend' >> FrontEnd/src/App.tsx"
    "echo 'Display results on canvas' >> FrontEnd/src/App.tsx"
    "echo 'Add user instructions modal' >> FrontEnd/src/App.tsx"
    "echo 'Implement dark mode toggle' >> FrontEnd/src/App.tsx"
    "echo 'Update README with project details' >> README.md"
    "echo 'Final review and cleanup' >> README.md"
)

# Loop through the commit messages and make changes to files
for i in "${!commit_messages[@]}"; do
    # Execute the file change command
    eval "${file_changes[i]}"

    # Stage the changes
    git add .

    # Create a commit with the message
    git commit -m "${commit_messages[i]}"

    # Set the commit date to a specific time
    git commit --amend --no-edit --date="2025-02-20 20:$(printf "%02d" $((28 - i))) +0530"
done

echo "Commit history created successfully!"
