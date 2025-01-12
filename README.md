# YouTube Playlist Fetcher

A web application built with **Next.js** (TypeScript) that allows users to fetch and manage their YouTube playlists. The application uses **Prisma** with a **PostgreSQL** database hosted on **Supabase** for data storage and **NextAuth** for authentication.

## Features

- Fetch and display YouTube playlists for authenticated users.
- Public playlists are accessible to unauthenticated users.
- Secure user authentication using **NextAuth** with Google or other OAuth providers.
- Store playlists and their associated videos in a PostgreSQL database.

## Tech Stack

- **Frontend**: Next.js (React, TypeScript)
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (hosted on Supabase)
- **Authentication**: NextAuth.js
- **ORM**: Prisma
- **Deployment**: Vercel

## Deployed Application

You can view the live application here:  
👉 [YouTube Playlist Fetcher (Deployed URL)](https://youtubeplaylist-zeta.vercel.app/)

---

## Demo Video

Watch the demo video to see the app in action:  
[![YouTube Playlist Fetcher Demo](https://img.youtube.com/vi/your-video-id/hqdefault.jpg)](https://youtu.be/uRhmjmb1WsU)

Click the image above or [here](https://youtu.be/uRhmjmb1WsU) to watch the video.

---

## Prerequisites

- Node.js >= 16.x
- PostgreSQL database (Supabase for cloud hosting)
- Google Developer Console project for OAuth (or any other provider for NextAuth)

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/youtube-playlist-fetcher.git
cd youtube-playlist-fetcher
```

### 2. Install Dependencies

Install the necessary dependencies using npm or yarn:

```bash
npm install
# or
yarn install
```

### 3. Configure Environment Variables

Create a `.env` file in the root of the project and configure the following variables:

```bash
# Database URL (get this from Supabase)
DATABASE_URL=postgresql://username:password@host:port/database_name?schema=public

# NextAuth configuration
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# Secret used for NextAuth.js encryption
NEXTAUTH_SECRET=your-nextauth-secret
```

- Replace `DATABASE_URL` with your PostgreSQL connection URL from **Supabase**.
- Replace `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` with your OAuth credentials from the **Google Developer Console**.
- Replace `NEXTAUTH_SECRET` with a secret for encrypting NextAuth.js tokens (can be generated online).

### 4. Migrate the Database

Run Prisma's migration commands to set up your database schema:

```bash
npx prisma migrate dev
```

This will generate the necessary database tables and schema.

### 5. Run the Development Server

Start the development server:

```bash
npm run dev
# or
yarn dev
```

Your app should now be running on [http://localhost:3000](http://localhost:3000).

---

## How it Works

### 1. Authentication with NextAuth

The app uses **NextAuth.js** to handle authentication. When a user signs in using Google (or another provider), their session is managed and stored in the database. The authentication flow is handled automatically.

### 2. Fetching Playlists

Authenticated users can fetch their YouTube playlists using the YouTube Data API. For unauthenticated users, only public playlists are displayed.

### 3. Storing Playlists in PostgreSQL

Prisma is used to interact with the PostgreSQL database on Supabase. The playlists and videos are stored in tables created via Prisma migrations. The data is retrieved and displayed dynamically on the frontend.

### 4. Displaying Playlists

The UI uses React components to display the playlists and their videos. Each playlist can be clicked to show more details.

---

## Contributing

If you'd like to contribute to the project:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Create a pull request.

---