# Intelligent RCA Management System

## Overview
This is an intelligent Root Cause Analysis (RCA) management system designed to help users create, store, and explore RCAs. It features a "smart" suggestion engine that finds similar past incidents while you type.

## Tech Stack
- **Frontend**: React (Vite), Vanilla CSS (Premium Dark Theme), Lucide Icons.
- **Backend**: Node.js, Express.
- **Database**: MongoDB (Mongoose).
- **Intelligence**: Regex-based keyword matching and similarity engine.

## Prerequisites
- Node.js (v14+)
- MongoDB (Running locally on port 27017)

## Setup & Run

### 1. Backend (Server)
```bash
cd server
npm install
node index.js
```
Server runs on `http://localhost:5001`.

### 2. Frontend (Client)
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:3000`.

## Features
- **Dashboard**: View all RCAs with status and tags. Search functionality.
- **Create RCA**: Guided form with "5 Whys" root cause inputs and corrective actions.
- **Intelligence Engine**: Automatically suggests similar past RCAs in the sidebar while you type the problem statement.
- **Premium UI**: Modern dark theme with smooth animations.
