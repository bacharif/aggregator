#!/bin/bash

# Check if tmux is installed
if ! command -v tmux &> /dev/null
then
    echo "tmux could not be found"
    echo "Installing tmux..."
    
    # Detect the OS
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update
        sudo apt-get install tmux
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install tmux
    else
        echo "Your OS is not supported by this script. Please install tmux manually."
        exit 1
    fi
fi

# Create a new detached tmux session
tmux new-session -d -s my_session

# Send commands to tmux session to clone the repository and build the project
tmux send-keys -t my_session 'git clone git@github.com:matter-labs/era-test-node.git' C-m
tmux send-keys -t my_session 'cd era-test-node' C-m
tmux send-keys -t my_session 'cargo build' C-m
tmux send-keys -t my_session 'cd target/debug' C-m

# Start era_test_node in tmux session
tmux send-keys -t my_session './era_test_node --show-calls=all fork testnet' C-m

# Give it some time to start
sleep 10

# Split tmux into two horizontal panes
tmux split-window -h

# Change directory back to project root in the second pane and run yarn test
tmux send-keys -t my_session.1 'cd ../../../' C-m
tmux send-keys -t my_session.1 'yarn install' C-m
tmux send-keys -t my_session.1 'yarn test' C-m

# Attach to the tmux session
tmux attach-session -t my_session
