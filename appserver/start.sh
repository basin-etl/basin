#!/bin/bash

# Start the jupyter server
jupyter server &
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start jupyter server: $status"
  exit $status
fi

# Start the node app
forever server.js
status=$?
if [ $status -ne 0 ]; then
  echo "Failed to start app: $status"
  exit $status
fi

