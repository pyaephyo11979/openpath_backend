# Open Path

Open Path is a full-stack monorepo application consisting of a Next.js frontend console and an Express/Prisma backend.

## Project Structure

This repository is organized as a monorepo containing the following workspaces:

- **`open-path-console/`**: The frontend console application, built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and TypeScript.
- **`backend/`**: The backend API server, built with Express 5, Prisma ORM, and integrated with AWS S3 for file uploads.

## Prerequisites

Ensure you have the following installed on your machine:
- Node.js (or Bun)
- npm, yarn, or pnpm
- PostgreSQL / MySQL (as per your Prisma configuration)

## Getting Started

### 1. Install Dependencies

You will need to install dependencies in both the root directory and the individual workspace directories.

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install console dependencies
cd ../open-path-console
npm install
```

### 2. Environment Configuration

Set up the environment variables for the backend.
```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and AWS S3 configuration
```

### 3. Database Setup (Prisma)

Initialize the database using Prisma from the backend directory:
```bash
cd backend
npx prisma generate
npx prisma db push # or prisma migrate dev
```

### 4. Running the Application

You can start the development servers from the root of the project using the provided npm scripts:

**Start the Backend Server:**
```bash
npm run dev:server
```
This runs the backend server in development mode using `nodemon`.

**Start the Frontend Console:**
```bash
npm run dev:console
```
This starts the Next.js development server for the console application.

## Available Scripts

Run these commands from the **root directory**:

- `npm run dev:server` - Starts the backend development server.
- `npm run dev:console` - Starts the frontend Next.js development server.
- `npm run format:server` - Runs Prettier to format the backend codebase.
- `npm run format:console` - Runs Prettier to format the frontend codebase.

## Tech Stack

### Frontend (`open-path-console/`)
- Next.js 16.2.10 (App Router)
- React 19
- Tailwind CSS v4
- TypeScript

### Backend (`backend/`)
- Express.js (v5)
- Prisma ORM (v7)
- AWS SDK (S3 integration for uploads)
- Firebase Cloud Messaging (FCM) (for push notifications)
- JWT & bcrypt (Authentication)
- PostgreSQL / MySQL support
- [Backend README](./backend/README.md)
