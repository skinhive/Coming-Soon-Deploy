#!/bin/bash

# Simple deployment script for AWS Amplify

echo "Starting SkinHive Coming Soon page deployment"
echo "=============================================="

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null
then
    echo "AWS CLI is not installed. Please install it first."
    exit 1
fi

# Check if Amplify CLI is installed
if ! command -v amplify &> /dev/null
then
    echo "AWS Amplify CLI is not installed. Installing now..."
    npm install -g @aws-amplify/cli
fi

# Initialize Amplify if not already done
if [ ! -d "amplify/.config" ]; then
    echo "Initializing Amplify project..."
    amplify init
fi

# Add API if not already added
if [ ! -d "amplify/backend/api/skinhiveapi" ]; then
    echo "Adding API Gateway..."
    amplify add api
fi

# Add function if not already added
if [ ! -d "amplify/backend/function/subscribe" ]; then
    echo "Adding Lambda function..."
    amplify add function
fi

# Configure function environment variables
echo "Configuring environment variables for Lambda function..."
echo "Please enter your Mailchimp API key:"
read -s MAILCHIMP_API_KEY
echo "Please enter your Mailchimp List ID:"
read MAILCHIMP_LIST_ID

# Update the function environment variables
amplify update function
# (You'll need to manually select the subscribe function and set environment variables)

# Push to AWS
echo "Pushing to AWS..."
amplify push

# Get the API endpoint URL
API_URL=$(amplify status | grep -A 1 "REST API endpoint" | grep -o "https://.*")

if [ -n "$API_URL" ]; then
    echo "Updating index.html with API endpoint URL..."
    # Replace the placeholder with the actual URL
    sed -i '' "s|https://YOUR_API_ID.execute-api.YOUR_REGION.amazonaws.com/YOUR_STAGE/subscribe|${API_URL}/subscribe|g" index.html
    
    echo "API URL set to: ${API_URL}/subscribe"
else
    echo "Could not find API URL. Please manually update index.html with the correct endpoint."
fi

echo "Deployment preparation complete!"
echo "=============================================="
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to AWS Amplify Console"
echo "3. Configure environment variables in Amplify Console:"
echo "   - MAILCHIMP_API_KEY"
echo "   - MAILCHIMP_LIST_ID"
echo "4. Deploy your site in Amplify Console"
echo "==============================================" 