# Google OAuth Setup Guide

## 🔧 **Step 1: Create Google OAuth Credentials**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/github`

## 🔧 **Step 2: Add Environment Variables**

Create a `.env.local` file in the `fronted` directory with these variables:

```env
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-make-it-long-and-random

# Google OAuth (Replace with your actual credentials)
GOOGLE_CLIENT_ID=your-google-client-id-here
GOOGLE_CLIENT_SECRET=your-google-client-secret-here

# GitHub OAuth (Optional - if you want GitHub login too)
GITHUB_ID=your-github-client-id-here
GITHUB_SECRET=your-github-client-secret-here
```

## 🔧 **Step 3: Get Your Credentials**

1. **Copy Client ID and Secret** from Google Cloud Console
2. **Replace the placeholder values** in `.env.local`
3. **Restart your development server**

## 🔧 **Step 4: Test the Setup**

1. **Start your frontend**: `npm run dev`
2. **Start your backend**: `npm run dev` (in Backend directory)
3. **Go to signup page** and try "Continue with Google"

## 🚨 **Common Issues**

- **"client_id is required"**: Make sure `GOOGLE_CLIENT_ID` is set correctly
- **"redirect_uri_mismatch"**: Check that redirect URIs match exactly
- **"invalid_client"**: Verify your client secret is correct

## 📝 **Example .env.local**

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=my-super-secret-key-1234567890abcdef
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

## ✅ **After Setup**

Once configured correctly, users will be able to:
- Sign up with Google (creates account automatically)
- Sign in with Google (if account exists)
- Get welcome emails for new Google signups
- Have their profile picture from Google 