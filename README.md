# Sou+ Backend

A RESTful API backend for a real-time chat application built with Node.js, Express, and MySQL.

## Features

- 🔐 JWT Authentication
- 📝 User registration & profile management
- 💬 Private messaging
- 🚦 Rate limiting
- 🛡️ Security headers (Helmet.js)
- 📊 MySQL database with connection pooling
- 🚀 Ready for Cloudflare deployment

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT + bcryptjs
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: express-validator

## Prerequisites

- Node.js >= 18.0.0
- MySQL >= 8.0
- npm or yarn

## Installation

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd chat-backend