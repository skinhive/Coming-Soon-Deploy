# SkinHive Coming Soon Page

This repository contains the SkinHive coming soon page that is ready to be deployed on AWS Amplify.

## Quick Start

1. Clone or download this repository
2. Run the preparation script:
   ```bash
   ./prepare-for-github.sh
   ```
3. Push to your GitHub repository
4. Deploy using AWS Amplify (instructions below)

## AWS Amplify Deployment Instructions

### Prerequisites
- AWS Account
- AWS CLI installed and configured
- AWS Amplify CLI installed (`npm install -g @aws-amplify/cli`)
- Git

### Method 1: Using the AWS Amplify Console (Recommended)

1. **Push to GitHub**:
   - Create a new repository on GitHub
   - Push this code to your repository

2. **Connect to AWS Amplify**:
   - Go to the [AWS Amplify Console](https://console.aws.amazon.com/amplify)
   - Click "Connect app" or "New app" → "Host web app"
   - Select GitHub (or your preferred Git provider)
   - Authorize AWS Amplify to access your repositories
   - Select the repository with your coming soon page
   - Select the branch to deploy (usually `main` or `master`)

3. **Configure Build Settings**:
   - Keep the default build settings (they are already configured in amplify.yml)
   - Add the following environment variables:
     - Key: `MAILCHIMP_API_KEY`, Value: [Your Mailchimp API Key]
     - Key: `MAILCHIMP_LIST_ID`, Value: [Your Mailchimp List ID]

4. **Deploy**:
   - Click "Save and deploy"
   - AWS Amplify will build and deploy your app

5. **Set up Custom Domain** (optional):
   - In the Amplify Console, go to "Domain management"
   - Click "Add domain"
   - Follow the instructions to connect your domain

### Method 2: Using the AWS Amplify CLI

For more control over the deployment process, you can use the included deployment script:

1. **Run the deployment script**:
   ```bash
   ./deploy.sh
   ```
   Follow the prompts to configure your Amplify environment.

2. **Update API Endpoint**:
   After deployment, update the API endpoint in `index.html` with the URL from Amplify.

3. **Push to GitHub and connect to Amplify Console**:
   - Push your updated code to GitHub
   - Follow steps 2-5 from Method 1 to connect to the Amplify Console

## Local Development

You can run the site locally for development:

```bash
npm install
npm start
```

This will start a local server at http://localhost:3000

## Directory Structure

- `/` - Root directory with HTML, CSS, and config files
- `/images` - Logo and other image assets
- `/images/social` - Social media icons
- `/MarketingMaterials` - Marketing imagery used on the page
- `/amplify` - AWS Amplify configuration
- `/amplify/backend/function/subscribe` - Lambda function for email subscriptions

## Important Notes

- Make sure to update the API endpoint URL in index.html after deployment
- Never commit sensitive information like API keys to GitHub
- Test the form submission functionality after deployment
- This site uses a serverless function to handle form submissions to Mailchimp

## Troubleshooting

- **API not working**: Check that your environment variables are correctly set in the Amplify Console
- **Form submission errors**: Verify your Mailchimp API key and List ID
- **Styling issues**: The site is fully self-contained with inline CSS for simplicity 