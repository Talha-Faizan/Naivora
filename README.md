# Naivora

Naivora is an e-commerce platform consisting of a customer-facing frontend, an admin dashboard, and a Node.js backend.

## Architecture

- **/client**: Next.js frontend application for customers.
- **/admin**: Next.js application for admin management (products, orders, etc.).
- **/server**: Node.js/Express backend handling API requests, authentication, and database connectivity (MongoDB).

## Getting Started

### Prerequisites
- Node.js
- MongoDB

### Installation

1. Install dependencies for all parts of the application:
   ```bash
   cd client && npm install
   cd ../admin && npm install
   cd ../server && npm install
   ```

2. Set up your environment variables. Create a `.env` file in the `server` directory and `.env.local` files in the `client` and `admin` directories.

3. Run the development servers:
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client (runs on localhost:3000)
   cd client && npm run dev

   # Terminal 3 - Admin (runs on localhost:3001)
   cd admin && npm run dev
   ```
