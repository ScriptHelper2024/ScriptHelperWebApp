#!/usr/bin/env bash

# Get the absolute path to the directory where the script is located
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

# Change the current working directory to the script's directory
cd "$SCRIPT_DIR" || exit

export MOCK_WEBSOCKETS=1
export MOCK_QUEUE=1
export EMAIL_DRIVER="mock"
export CACHE_DISABLED="1"
export LOG_DRIVER="null"
export OPENTELEMETRY_ENABLED="False"

# Check if an argument is provided
if [ $# -eq 1 ]; then
    # Run the unit tests for the specified test file
    python3 -m unittest "tests/$1.py"
else
    # Run all unit tests
    python3 -m unittest discover -s tests -p 'test_*.py'
fi

# Capture the exit code of the previous command
TEST_EXIT_CODE=$?

# Change back to the original directory
cd -

# Exit with the captured exit code
exit $TEST_EXIT_CODE

unset MOCK_WEBSOCKETS
unset MOCK_QUEUE
unset EMAIL_DRIVER
unset CACHE_DISABLED
unset LOG_DRIVER
unset OPENTELEMETRY_ENABLED
