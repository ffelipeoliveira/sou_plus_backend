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
```
set up an .env file
and a MySQL database

CREATE DATABASE chat_app;
USE chat_app;

CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT 'https://via.placeholder.com/150',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_conversation (sender_id, receiver_id)
);