# T Web Chat

A production-quality real-time chat application built with React, Node.js, and Socket.IO — inspired by WhatsApp Web and Telegram.

## Features

- **Real-time messaging** — instant one-on-one chat via Socket.IO
- **Online/offline presence** — live user status with last-seen timestamps
- **Typing indicators** — "User is typing…" with debounced emit
- **Media sharing** — upload and display images and files via Cloudinary
- **Message status** — sent → delivered → seen indicators
- **JWT authentication** — secure register/login with protected routes
- **Persistent conversations** — all messages stored in MongoDB
- **Responsive UI** — clean WhatsApp-inspired design with Tailwind CSS

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Zustand, Axios, React Router v7 |
| Backend | Node.js, Express, Socket.IO |
| Database | MongoDB with Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Storage | Cloudinary (images & files) |
| Validation | express-validator |

## Project Structure

```
t_web_chat/
├── server/
│   ├── config/          # DB + Cloudinary setup
│   ├── controllers/     # Route handlers (auth, users, messages)
│   ├── middleware/       # Auth guard, upload, error handler, validator
│   ├── models/          # Mongoose schemas (User, Conversation, Message)
│   ├── routes/          # Express routers
│   ├── sockets/         # Socket.IO event handlers
│   └── server.js        # App entry point
└── client/
    └── src/
        ├── components/   # Auth, chat, sidebar, common UI
        ├── hooks/        # useSocket, useTyping
        ├── pages/        # AuthPage, ChatPage
        ├── services/     # Axios API client + Socket.IO init
        ├── store/        # Zustand stores (auth, chat)
        └── utils/        # Date/time formatters
```

## Setup & Installation

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### Backend

```bash
cd server
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### Frontend

```bash
cd client
npm install
cp .env.example .env
# Set VITE_SERVER_URL if not using localhost:5000
npm run dev
```

## Environment Variables

### Server (`server/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

### Client (`client/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_SERVER_URL` | Backend URL (default: `http://localhost:5000`) |

## API Endpoints

### Auth
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PATCH | `/api/auth/profile` | Update profile (multipart) |

### Users
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/search?q=` | Search users |
| GET | `/api/users/contacts` | Get user contacts |
| GET | `/api/users/:id` | Get user by ID |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages/conversations` | List all conversations |
| GET | `/api/messages/conversations/:id/start` | Get or create conversation |
| GET | `/api/messages/:conversationId` | Paginated messages |
| POST | `/api/messages/:conversationId` | Send message (supports file upload) |
| PATCH | `/api/messages/:conversationId/seen` | Mark messages as seen |

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `message:send` | `{ conversationId, content, type }` | Send a message |
| `message:seen` | `{ conversationId }` | Mark messages as seen |
| `typing:start` | `{ conversationId }` | Start typing |
| `typing:stop` | `{ conversationId }` | Stop typing |
| `conversation:join` | `{ conversationId }` | Join a conversation room |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `message:new` | `{ message }` | New incoming message |
| `message:seen` | `{ conversationId, seenBy }` | Messages marked as seen |
| `typing:start` | `{ conversationId, userId, username }` | User started typing |
| `typing:stop` | `{ conversationId, userId }` | User stopped typing |
| `user:online` | `{ userId }` | User came online |
| `user:offline` | `{ userId, lastSeen }` | User went offline |

## Deployment

### Render (Backend)
1. Create a new Web Service on [Render](https://render.com)
2. Set root directory to `server`
3. Build command: `npm install`
4. Start command: `npm start`
5. Add all environment variables from `server/.env.example`

### Vercel (Frontend)
1. Import repo on [Vercel](https://vercel.com)
2. Set root directory to `client`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Set `VITE_SERVER_URL` to your Render backend URL

## License

MIT
