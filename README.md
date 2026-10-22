# 🚀 Feed Fusion - Unified Real-Time Social Media Aggregator

Feed Fusion is an enterprise-grade full-stack web application that unifies posts from **X (formerly Twitter)**, **Instagram**, and **Facebook** into a single, cohesive, real-time dashboard.

The project is cleanly divided into two parts:
1. **`backend/`**: Node.js, Express, TypeScript, MongoDB, Socket.io real-time streaming, and AES-256 encrypted OAuth adapters.
2. **`frontend/`**: React 18, TypeScript, Vite, Tailwind CSS, Lucide icons, responsive glassmorphic UI, filter chips, bookmarks, and engagement analytics.

---

## 📂 Project Structure

```
Feed-fusion/
├── package.json              # Root workspace scripts (run both or individually)
├── README.md                 # Complete documentation & divided setup guide
│
├── backend/                  # PART 1: Backend API & Real-time WebSocket Server
│   ├── .env.example          # Environment variables template
│   ├── .env                  # Working configuration
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── config/           # Database & environment configuration
│       ├── controllers/      # Auth, Feed, Account, OAuth, Analytics
│       ├── middleware/       # JWT guard & centralized error handling
│       ├── models/           # User, SocialAccount, Bookmark, PostLike
│       ├── routes/           # REST endpoints
│       ├── services/
│       │   ├── adapters/     # Modular platform adapters: X, Instagram, Facebook, Mock
│       │   ├── mockData.ts   # Rich realistic post items & generator
│       │   └── socketService.ts # Socket.io WebSocket broadcaster
│       ├── utils/            # AES-256 crypto, demo database seeder
│       ├── types/            # TypeScript interfaces
│       └── server.ts         # Main server entry point
│
└── frontend/                 # PART 2: Frontend Single Page Application
    ├── index.html
    ├── vite.config.ts        # Vite proxy for /api and /socket.io
    ├── tailwind.config.js    # Glassmorphism & custom colors
    ├── postcss.config.js
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── components/       # FeedCard, Navbar, Sidebar, PlatformFilter, etc.
        ├── context/          # AuthContext, SocketContext
        ├── pages/            # Dashboard, AccountsPage, BookmarksPage, Analytics, Auth
        ├── services/         # Axios API clients
        └── types/            # Shared types
```

---

## ⚡ How to Run the Project

### Option A: Run Both Together (Recommended)

From the root directory (`Feed-fusion/`):
```bash
npm run dev
```
> Uses `concurrently` to boot both `backend` (port `5000`) and `frontend` (port `5173`) in one terminal.

---

### Option B: Run in Two Separate Terminals

#### 🔹 Terminal 1: Backend
```bash
cd backend
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Health Check**: `http://localhost:5000/api/health`
- **WebSocket**: `ws://localhost:5000`

#### 🔹 Terminal 2: Frontend
```bash
cd frontend
npm run dev
```
- **Frontend App**: `http://localhost:5173`

---

## 👤 Instant Demo Login

On the login page (`http://localhost:5173/login`), click the **"Quick Autofill Demo Credentials"** button or enter:
- **Email**: `demo@feedfusion.io`
- **Password**: `demo1234`

Pre-configured with:
- Connected mock accounts for **X (Twitter)**, **Instagram**, and **Facebook**.
- 7 rich aggregated posts with media and hashtags.
- Pre-saved bookmarks in the **Saved Bookmarks** view.
- Real-time simulation stream broadcasting live incoming posts.

---

## 🎭 Dual-Engine: Mock Mode vs. Real API Mode

1. **Mock Mode (Default)**: Test all UI flows, simulated OAuth, and live streams without waiting for external API approvals.
2. **Real API Mode**: Connect official OAuth 2.0 PKCE for X and Meta Graph APIs for Instagram/Facebook.

To toggle between modes:
- Use the **Mock Mode ON / Live API Mode** pill button in the top navigation bar.
- Or change `MOCK_MODE=true` / `MOCK_MODE=false` in `backend/.env`.

---

## 🔑 Official OAuth Credentials Configuration

To enable real social feeds, enter your credentials in `backend/.env`:

| Platform | Developer Portal | Redirect URI |
|---|---|---|
| **X (Twitter)** | [developer.x.com](https://developer.x.com) (OAuth 2.0 PKCE) | `http://localhost:5000/api/oauth/twitter/callback` |
| **Instagram** | [developers.facebook.com](https://developers.facebook.com) (Instagram Graph API) | `http://localhost:5000/api/oauth/instagram/callback` |
| **Facebook** | [developers.facebook.com](https://developers.facebook.com) (Facebook Login) | `http://localhost:5000/api/oauth/facebook/callback` |

---

## 🔒 Security Architecture

- **No Passwords Requested**: Social platform connections rely solely on official OAuth 2.0 and Graph API redirects.
- **AES-256-GCM Token Encryption**: Stored tokens are encrypted at rest with AES-256-GCM and unique initialization vectors.
- **Helmet & CORS**: Strict HTTP security headers and CORS protection.
- **Rate Limiting**: Protects auth endpoints against brute force attempts.
- **Protected Routes**: Stateless JWT verification with automatic expiration.

---

## 📄 License
This project is licensed under the MIT License.
