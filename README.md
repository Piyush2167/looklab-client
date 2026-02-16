# LookLab Client

Frontend for LookLab - AI-Powered Hair Salon Booking System

## Features

- 🤖 AI-powered hair style recommendations
- 📅 Online booking system
- 💳 Integrated payment processing
- 👤 User authentication and profiles
- 📱 Responsive design
- 🎨 Modern UI with Tailwind CSS & DaisyUI

## Tech Stack

- React 18
- React Router v6
- Axios for API calls
- Tailwind CSS & DaisyUI
- Framer Motion for animations
- React Calendar

## Environment Variables

Create a `.env` file:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SHOW_GEMINI_TEST=true
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
```

For production (`.env.production`):

```
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_SHOW_GEMINI_TEST=false
REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key
```

## Local Development

```bash
npm install
npm start
```

Runs on http://localhost:3000

## Build

```bash
npm run build
```

## Deployment

Deployed on Vercel. Push to main branch for auto-deployment.

## Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── context/       # React context (Auth)
├── services/      # API service layer
└── App.js         # Main app component
```

## Available Scripts

- `npm start` - Development server
- `npm run build` - Production build
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## License

Private - All rights reserved
