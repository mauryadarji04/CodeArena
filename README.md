# Authentication App - MVC Architecture

A modern authentication system built with React, TypeScript, Tailwind CSS, and Express.js featuring login, signup, forgot password with OTP verification, and clean MVC architecture.

## Project Structure

```
├── backend/                 # Express.js backend with MVC architecture
│   ├── config/             # Database and email configuration
│   ├── controllers/        # Business logic
│   ├── middleware/         # Authentication middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── views/             # Response formatting
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/ui/ # shadcn/ui components
│   │   ├── pages/        # Authentication pages
│   │   ├── lib/          # Utility functions
│   │   └── App.tsx       # Main app component
│   └── package.json      # Frontend dependencies
└── README.md
```

## Features

- 🔐 **Login/Signup** - Email and password authentication
- 📧 **Forgot Password** - Email OTP verification and password reset
- 🌙 **Dark Theme** - Beautiful dark UI design
- 📱 **Responsive** - Mobile-friendly design
- ⚡ **MVC Architecture** - Clean separation of concerns
- 🔒 **JWT Authentication** - Secure token-based auth

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Update `.env` file with your credentials:
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/auth-app
JWT_SECRET=your-super-secret-jwt-key-here
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

### 3. Email Configuration

For Gmail:
1. Enable 2-factor authentication
2. Generate an App Password: Google Account → Security → App passwords
3. Use the generated password in `EMAIL_PASS`

## API Endpoints

- `POST /api/signup` - User registration
- `POST /api/login` - User login
- `GET /api/profile` - Get user profile (protected)
- `POST /api/send-otp` - Send OTP for password reset
- `POST /api/verify-otp` - Verify OTP
- `POST /api/reset-password` - Reset password

## MVC Architecture

### Models
- `User.js` - User schema with password hashing

### Views
- `response.js` - Standardized API responses

### Controllers
- `authController.js` - Authentication business logic

### Routes
- `auth.js` - Authentication routes

### Middleware
- `auth.js` - JWT token verification

### Config
- `database.js` - MongoDB connection
- `email.js` - Email configuration

## Technologies Used

- **Backend**: Express.js, MongoDB, JWT, Nodemailer, bcryptjs
- **Frontend**: React 18, TypeScript, Tailwind CSS, shadcn/ui
- **Routing**: React Router
- **Styling**: Tailwind CSS with dark theme
- **Icons**: Lucide React

## Running the Application

1. Start MongoDB service
2. Start backend: `cd backend && npm run dev`
3. Start frontend: `cd frontend && npm run dev`

The app will be available at:
- Frontend: http://localhost:5173
- Backend: http://localhost:3001

## Notes

- OTPs expire after 5 minutes
- JWT tokens expire after 7 days
- Passwords are hashed using bcryptjs
- Clean MVC architecture for maintainability
- Responsive design for all devices