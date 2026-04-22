# Aura Dining – Restaurant Table Booking System

A restaurant table booking and management website: React + Vite frontend, Node.js/Express + MongoDB backend, with Vietnamese user interface.

## 1. Key Features
- Online table booking (select date/time, seating preferences, CSV export).
- Detailed table selection process, automatic/manual table assignment in Admin panel.
- Protected admin area with JWT + MongoDB authentication, auto-expires after 8 hours.
- Menu management, table management, table assignments, analytics, restaurant settings.
- Separate backend with MongoDB, supports email confirmation (optional SMTP).

## 2. Architecture
```
Restaurant-Table-Booking/
├─ src/               # Frontend React (Vite)
├─ server/            # Backend Express + MongoDB
└─ public/            # Static assets
```

## 3. Installation & Setup

### System Requirements
- Node.js (version 18 or higher)
- MongoDB (running locally or connection string)
- npm or yarn

### Step 1: Clone and Install Dependencies

```bash
# Clone repository (if not already cloned)
cd Restaurant-Table-Booking

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 2: Create .env File at Project Root

Create a `.env` file at the **project root** (same level as `package.json`), containing all environment variables:

```bash
# Create .env file at root
touch .env
```

Contents of `.env` file:

```env
# Server Configuration
PORT=5000
# For production, use comma-separated origins: http://localhost:3000,https://your-frontend.vercel.app
CORS_ORIGIN=http://localhost:3000

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=restaurant_db

# JWT Secret (for authentication)
JWT_SECRET=your-secret-key-change-this-in-production

# SMTP Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend Vite Environment Variables (optional)
VITE_API_BASE_URL=http://localhost:5000
VITE_API_PREFIX=/api
```

**Important Notes:**
- The `.env` file must be at the **project root** (not in the `server/` directory)
- Change `JWT_SECRET` to a random secret string in production environment
- If SMTP is not configured, the system will still work but won't send confirmation emails

### Step 3: Start MongoDB

Ensure MongoDB is running:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB Atlas, just provide the connection string in MONGODB_URI
```

### Step 4: Seed Sample Data (First Time Only)

```bash
cd server
npm run seed
npm run indexes
cd ..
```

This will create:
- Sample data: tables, menu items, restaurant settings
- Default admin account (see login section below)
- MongoDB indexes for performance optimization

### Step 5: Run Backend

Open first terminal:

```bash
cd server
npm run dev
```

Backend will run at `http://localhost:5000`

### Step 6: Run Frontend

Open second terminal:

```bash
# At project root
npm run dev
```

Frontend will run at `http://localhost:3000` (Vite automatically changes port if busy)

### Verify Setup

1. **Backend health check:** Open browser to `http://localhost:5000/health`
2. **Frontend:** Open browser to `http://localhost:3000`
3. **Admin panel:** `http://localhost:3000/admin/login`

## 4. Admin Login

After running `npm run seed`, the system creates a default admin account:

- **Email:** `admin@auradining.vn`
- **Password:** `123456`

**How to login:**
1. Navigate to `http://localhost:3000/admin/login`
2. Enter the email and password above
3. After successful login, you will be redirected to the dashboard
4. Token is stored in LocalStorage (expires after 8 hours or on logout)

**⚠️ Security Note:**
- Change the password immediately when deploying to production
- You can update the password by modifying the document in the `admin_users` collection in MongoDB

## 5. Main Scripts
| Location | Command | Description |
|----------|---------|-------------|
| `/` | `npm run dev` | Vite dev server |
| `/` | `npm run build` | Build frontend |
| `/` | `npm run preview` | Preview build |
| `/server` | `npm run dev` | Node --watch backend |
| `/server` | `npm run seed` | Seed sample MongoDB data (tables, menu, settings & admin account) |
| `/server` | `npm run indexes` | Create MongoDB indexes |

## 6. Email Confirmation
The backend uses `nodemailer`. If SMTP is not configured, the system will still work but won't send emails. When all environment variables are properly configured (see backend section), each successful booking will send an "Aura Dining" confirmation email to the customer.

## 7. Suggested Roadmap
- Upload official logo to `src/assets` and replace temporary icon.
- Add blog/events page.
- Deploy with Docker Compose (MongoDB + backend + frontend).

## 8. Production Deployment

### Frontend (Vercel)
1. **Set Environment Variables in Vercel:**
   - Go to Project Settings → Environment Variables
   - Add `VITE_API_BASE_URL` = your backend URL (e.g., `https://your-backend.railway.app`)
   - Add `VITE_API_PREFIX` = `/api`
   - Redeploy after adding variables

### Backend Deployment Options
You need to deploy the backend to a service that supports Node.js:
- **Render** (recommended): Free tier available
- **Railway**: Easy deployment
- **Heroku**: Requires credit card
- **DigitalOcean App Platform**: Paid service

### Backend Environment Variables
When deploying backend, set these environment variables:
- `PORT` - Server port (usually auto-assigned)
- `CORS_ORIGIN` - Comma-separated list: `http://localhost:3000,https://your-frontend.vercel.app`
- `MONGODB_URI` - MongoDB connection string (use MongoDB Atlas for production)
- `DATABASE_NAME` - Database name
- `JWT_SECRET` - Strong secret key for production
- SMTP variables (if using email)

### CORS Configuration
The backend now supports multiple origins. Set `CORS_ORIGIN` as comma-separated values:
```env
CORS_ORIGIN=http://localhost:3000,https://restaurant-table-booking-seven.vercel.app
```

## 9. Support
If you encounter errors:
1. Check terminal logs (frontend/backend).
2. Verify MongoDB is running.
3. Check `.env` file (correct port, URL).
4. Verify CORS_ORIGIN includes your frontend domain.
5. Check environment variables in Vercel (for frontend).
6. Delete `node_modules` and run `npm install` again if dependencies are missing (`nodemailer`, etc.).

Good luck running Aura Dining! 🍽️🔥
