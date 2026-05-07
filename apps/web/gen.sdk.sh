#!/bin/bash

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print error message and exit
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Function to print usage information
print_usage() {
    echo "Usage: $0 -e <environment>"
    echo "Environments: development, qa, stage, prod"
    echo "Example: $0 -e development"
    exit 1
}

# Function to get base URL for environmentW
get_base_url() {
    local env=$1
    case $env in
        "development")
            echo "http://localhost:5000"
            ;;
        "qa")
            echo "QA url here"
            ;;
        "stage")
            echo "stage url here"
            ;;
        "prod")
            echo "prod url here"
            ;;
        *)
            error_exit "Invalid environment: $env"
            ;;
    esac
}

# Fixed API path
API_PATH="api-docs.json"

# Valid environments
declare -a VALID_ENVS=("development" "qa" "stage" "prod")

# Initialize variables
ENVIRONMENT=""

# Parse command line arguments
while getopts "e:h" opt; do
    case $opt in
        e)
            ENVIRONMENT="$OPTARG"
            ;;
        h)
            print_usage
            ;;
        \?)
            print_usage
            ;;
    esac
done

# Validate environment
if [ -z "$ENVIRONMENT" ]; then
    error_exit "Environment not specified. Use -e option."
fi

# Check if environment is valid
VALID_ENV=0
for env in "${VALID_ENVS[@]}"; do
    if [ "$env" = "$ENVIRONMENT" ]; then
        VALID_ENV=1
        break
    fi
done

if [ $VALID_ENV -eq 0 ]; then
    error_exit "Invalid environment. Valid environments are: ${VALID_ENVS[*]}"
fi

# Get base URL for the environment
BASE_URL=$(get_base_url "$ENVIRONMENT")
FULL_URL="${BASE_URL}/${API_PATH}"

# Output file name with environment
OUTPUT_FILE="api.yaml"

# Check if output file already exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "Warning: $OUTPUT_FILE already exists. It will be overwritten."
fi

# Print environment and URL information
echo "Environment: $ENVIRONMENT"
echo "Base URL: $BASE_URL"
echo "API Path: $API_PATH"
echo "Full URL: $FULL_URL"

# Try wget first, then curl if wget is not available
if command_exists wget; then
    echo "Using wget to download file..."
    wget -q --show-progress -O "$OUTPUT_FILE" "$FULL_URL" || error_exit "Failed to download using wget"
elif command_exists curl; then
    echo "Using curl to download file..."
    curl -# -L -o "$OUTPUT_FILE" "$FULL_URL" || error_exit "Failed to download using curl"
else
    error_exit "Neither wget nor curl is installed. Please install one of them and try again."
fi

# Verify the file was downloaded and is not empty
if [ ! -s "$OUTPUT_FILE" ]; then
    error_exit "Download failed or file is empty"
fi

echo "Successfully downloaded file to $OUTPUT_FILE"

yarn generate