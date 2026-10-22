# 🚀 Feed Fusion - Unified Real-Time Social Media Aggregator

Feed Fusion is an enterprise-grade full-stack web application that unifies posts from **X (formerly Twitter)**, **Instagram**, and **Facebook** into a single, cohesive, real-time dashboard. 

The platform is designed with a **dual-engine architecture**:
1. **Mock Mode (Default)**: Out-of-the-box instant experience featuring realistic high-resolution posts, engagement metrics, and simulated live WebSocket streams without waiting for external API approvals.
2. **Real API Mode**: Full production integration with official **X API v2 (OAuth 2.0 with PKCE)**, **Instagram Graph API**, and **Facebook Graph API** once credentials are provided.

---

## 📸 Key Features

- **Unified Real-Time Feed**: Aggregates tweets, photo carousels, reels, and status updates sorted chronologically, by popularity, or trending velocity.
- **Official OAuth 2.0 & Graph API Integration**: Connect accounts via official authorization flows. **Zero user passwords asked or stored**.
- **AES-256-GCM Token Encryption**: All social access tokens and refresh tokens are encrypted at rest with hardware-grade AES-256 encryption.
- **WebSocket Live Stream (Socket.io)**: Live incoming posts appear automatically with an animated notification banner ("2 new posts arrived — Click to load").
- **Interactive Feed Controls**:
  - Filter chips for All, X (Twitter), Instagram, and Facebook.
  - Search by keyword, author handle, or `#hashtag`.
  - Sort by *Latest*, *Popular*, or *Trending*.
  - Save posts to persistent **Bookmarks**.
  - Interactive likes with optimistic counters.
- **Analytics & Engagement Dashboard**: Cross-platform engagement charts, post distribution metrics, and audience interaction rates.
- **Pre-seeded Demo Account**: Instant 1-click test login (`demo@feedfusion.io` / `demo1234`).

---

## 🛠️ Tech Stack

| Component | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios, Socket.io-client |
| **Backend** | Node.js, Express, TypeScript, Mongoose (MongoDB 9.0), Socket.io, JWT, bcryptjs |
| **Security** | AES-256-GCM token encryption, Helmet, CORS, Express-Rate-Limit, PKCE OAuth 2.0 |
| **Database** | MongoDB Server (running locally on port 27017 or MongoDB Atlas) |

---

## 📂 Project Structure

```
Feed-fusion/
├── package.json              # Monorepo scripts (dev, build, install:all)
├── README.md                 # Project documentation & credentials setup guide
├── server/                   # Node.js + Express + TypeScript + Socket.io
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Working configuration
│   ├── src/
│   │   ├── config/           # Database & environment configuration
│   │   ├── controllers/      # Auth, Feed, Account, OAuth, Analytics
│   │   ├── middleware/       # JWT protection & centralized error handling
│   │   ├── models/           # User, SocialAccount, Bookmark, PostLike
│   │   ├── routes/           # REST endpoints
│   │   ├── services/
│   │   │   ├── adapters/     # Modular platform adapters: X, Instagram, Facebook, Mock
│   │   │   ├── mockData.ts   # Rich realistic post items & generator
│   │   │   └── socketService.ts # Socket.io WebSocket broadcaster
│   │   ├── utils/            # AES-256 crypto, demo database seeder
│   │   ├── types/            # TypeScript interfaces
│   │   └── server.ts         # Main server entry point
└── client/                   # React + TypeScript + Vite + Tailwind CSS
    ├── index.html
    ├── vite.config.ts        # Vite proxy for /api and /socket.io
    ├── tailwind.config.js    # Glassmorphism & custom colors
    └── src/
        ├── components/       # FeedCard, Navbar, Sidebar, PlatformFilter, etc.
        ├── context/          # AuthContext, SocketContext
        ├── pages/            # Dashboard, AccountsPage, BookmarksPage, Analytics, Auth
        ├── services/         # Axios API clients
        └── types/            # Shared types
```

---

## ⚡ Quick Start

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v26)
- **MongoDB** running locally on port 27017 (or MongoDB Atlas connection string)

### 2. Install Dependencies
Run the install command from the root directory:
```bash
npm run install:all
```

### 3. Start Development Server
Run both Backend and Frontend concurrently with a single command:
```bash
npm run dev
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`

### 4. Instant Demo Login
On the login screen (`http://localhost:5173/login`), click the **"Quick Autofill Demo Credentials"** button or enter:
- **Email**: `demo@feedfusion.io`
- **Password**: `demo1234`

The demo profile comes pre-populated with:
- Connected mock accounts for **X (Twitter)**, **Instagram**, and **Facebook**.
- Rich unified posts with images, metrics, and hashtags.
- Pre-saved bookmarks in the **Saved Bookmarks** view.
- Real-time simulation engine ready to broadcast live posts.

---

## 🎭 Mock Mode vs. Real API Mode

### How to Toggle Modes
1. **From the UI**: Click the **"Mock Mode ON / Live API Mode"** toggle button in the top navigation bar.
2. **From the Environment**: In `server/.env`, set:
   ```env
   MOCK_MODE=true    # for demo simulation
   # or
   MOCK_MODE=false   # for real live APIs
   ```

---

## 🔑 Official OAuth Credentials Setup Guide

To swap from Mock Mode to Live Social APIs, register your developer applications and populate `server/.env`:

### 1. X (Twitter) Developer Portal
1. Navigate to the [X Developer Portal](https://developer.x.com).
2. Create a project and an App.
3. In your App Settings, enable **User authentication settings**:
   - **App Type**: Web App (Confidential Client)
   - **App Permissions**: Read (`tweet.read`, `users.read`, `like.read`, `offline.access`)
   - **Type of App**: OAuth 2.0 with PKCE
   - **Callback / Redirect URL**:
     ```
     http://localhost:5000/api/oauth/twitter/callback
     ```
   - **Website URL**: `http://localhost:5173`
4. Copy the generated **Client ID** and **Client Secret** into `server/.env`:
   ```env
   TWITTER_CLIENT_ID=your_client_id_here
   TWITTER_CLIENT_SECRET=your_client_secret_here
   TWITTER_REDIRECT_URI=http://localhost:5000/api/oauth/twitter/callback
   ```

---

### 2. Meta for Developers (Facebook & Instagram Graph API)
1. Go to [Meta for Developers](https://developers.facebook.com) and click **Create App**.
2. Select **Business** or **Consumer** as your app type.

#### For Facebook:
1. Add the **Facebook Login** product to your app.
2. Under **Facebook Login Settings**, set **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/oauth/facebook/callback
   ```
3. Copy your **App ID** and **App Secret** (from Settings > Basic) into `server/.env`:
   ```env
   FACEBOOK_APP_ID=your_facebook_app_id
   FACEBOOK_APP_SECRET=your_facebook_app_secret
   FACEBOOK_REDIRECT_URI=http://localhost:5000/api/oauth/facebook/callback
   ```

#### For Instagram:
1. In your Meta App Dashboard, add the **Instagram Basic Display** or **Instagram Graph API** product.
2. Under **Client OAuth Settings**, set **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/oauth/instagram/callback
   ```
3. Set your credentials in `server/.env`:
   ```env
   INSTAGRAM_CLIENT_ID=your_instagram_app_id
   INSTAGRAM_CLIENT_SECRET=your_instagram_app_secret
   INSTAGRAM_REDIRECT_URI=http://localhost:5000/api/oauth/instagram/callback
   ```

---

## 🔒 Security Architecture

- **Official OAuth 2.0 PKCE**: Protects authorization code exchanges against authorization code injection and interception attacks.
- **Zero Plain-Text Token Storage**: Tokens are encrypted using **AES-256-GCM** with a dynamic 16-byte initialization vector (IV) and authentication tag.
- **Stateless JWT**: Secure authentication with encrypted user IDs and automated expiration.
- **Password Protection**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Helmet & CORS**: Strict HTTP headers preventing cross-site scripting (XSS), clickjacking, and unauthorized cross-origin requests.
- **Rate Limiting**: Defends authentication endpoints against brute-force attacks.

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Authenticate and receive JWT
- `GET /api/auth/me` - Get current user profile & preferences
- `PUT /api/auth/preferences` - Update user preferences (mock mode, default filter)

### Feeds
- `GET /api/feed` - Fetch unified aggregated feed (supports `?platform=`, `?query=`, `?sort=`, `?mock=`)
- `POST /api/feed/like` - Toggle like on a post
- `POST /api/feed/bookmark` - Save or unsave post to bookmarks
- `GET /api/feed/bookmarks` - Fetch all saved bookmarks
- `POST /api/feed/simulate` - Broadcast a simulated post via WebSocket

### Connected Accounts
- `GET /api/accounts` - List all connected social accounts
- `POST /api/accounts/connect-mock` - Connect simulated demo profile for testing
- `DELETE /api/accounts/:platform` - Disconnect social account

### OAuth
- `GET /api/oauth/:platform/url` - Generate official OAuth authorization URL
- `GET /api/oauth/:platform/callback` - OAuth redirect handler (exchanges code & encrypts tokens)

### Analytics
- `GET /api/analytics` - Cross-platform aggregated metrics and engagement distribution

---

## 🧪 Testing & Verification

1. **Backend Verification**:
   ```bash
   cd server
   npm run build
   node dist/server.js
   ```
2. **Frontend Verification**:
   ```bash
   cd client
   npm run build
   ```
3. **Real-time Live Event Test**:
   - In the sidebar, click **"Simulate New Post"**.
   - Notice the live notification banner pop down atop the feed: *"1 new post arrived via live stream"*.
   - Click the banner to instantly load the new post into the feed with zero page refresh!

---

## 📄 License
This project is licensed under the MIT License.
