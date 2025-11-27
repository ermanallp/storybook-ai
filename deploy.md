# Deploying Storybook AI to Google Cloud Run

This guide will help you deploy your Next.js application to Google Cloud Run.

## Prerequisites

1.  **Google Cloud Project**: You need an active Google Cloud project.
2.  **gcloud CLI**: Installed and authenticated on your machine.
3.  **Docker**: (Optional) If you want to build locally.

## Steps

### 1. Configure Project and Enable APIs

First, make sure you are working with the correct project. Replace `YOUR_PROJECT_ID` with your actual Google Cloud Project ID (not the name).

```bash
gcloud config set project YOUR_PROJECT_ID
```

**Verify your project ID is correct:**
```bash
gcloud config list project
```
*Make sure the output shows your exact Project ID without any extra characters like `]`.*

Then, enable the necessary Google Cloud APIs:

```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
```

### 2. Configure Environment Variables

You need to set your `GEMINI_API_KEY` in Cloud Run. You can do this during deployment.

### 3. Deploy using Cloud Build

Run the following command in your project root.
**Note:** The `--source .` flag tells Google Cloud to look for the `Dockerfile` in the current directory and build it.

```bash
gcloud run deploy storybook-ai \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=YOUR_API_KEY_HERE
```

*Replace `YOUR_API_KEY_HERE` with your actual Gemini API key.*

### 4. Access Your App

Once the deployment is complete, `gcloud` will output a Service URL.

## Troubleshooting Project ID

If you keep getting an error about invalid characters in the project ID:

1.  Unset the current project:
    ```bash
    gcloud config unset project
    ```
2.  Set it again carefully (type it manually, don't paste if possible):
    ```bash
    gcloud config set project YOUR_PROJECT_ID
    ```
3.  Verify:
    ```bash
    gcloud config list
    ```

## Troubleshooting Permission Errors

If you see an error like `Error 403: ... does not have storage.objects.get access`:

This means the Google Cloud build service account doesn't have permission to read the uploaded source code.

**Fix:** Grant the "Storage Object Viewer" role to the service account shown in the error (usually ends in `@developer.gserviceaccount.com`).

Run this command (replace `[SERVICE_ACCOUNT_EMAIL]` with the email from your error message, e.g., `146022484536-compute@developer.gserviceaccount.com`):

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
    --role="roles/storage.objectViewer"
```

If you see an error about **Cloud Logging** permissions (`roles/logging.logWriter`), run this command:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:[SERVICE_ACCOUNT_EMAIL]" \
    --role="roles/logging.logWriter"
```

Alternatively, try re-authenticating:
```bash
gcloud auth login
```

## Troubleshooting Build Links

**Important:** If you click a link in your terminal and get a "Project ID contains invalid characters" error (often ending in `]`), **the link is broken**.

1.  **Do not click the link.**
2.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
3.  Search for **"Cloud Build"** -> **"History"** to see your builds.
4.  Or search for **"Cloud Run"** to see your services.
