# 🍎 Calorie Tracker Web

A modern web-based calorie tracking application with AI-powered food analysis, built with Next.js 14.

## Features

- 📸 **AI Food Analysis**: Take a photo of your meal and get instant calorie and nutrition information
- 📊 **Daily Tracking**: Monitor your calorie intake with beautiful progress visualization
- 🎯 **Personalized Goals**: Custom calorie targets based on your profile and activity level
- 💾 **Local Storage**: All data stored locally in your browser (privacy-first)
- 📱 **Mobile-First Design**: Responsive design that works on all devices
- ⚡ **Fast & Modern**: Built with Next.js 14, React 19, and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ 
- Google AI API key (for Gemini AI food analysis)

### Installation

1. Clone the repository or navigate to the project folder

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```
NEXT_PUBLIC_GOOGLE_AI_API_KEY=your_google_ai_api_key_here
```

To get a Google AI API key:
- Visit https://makersuite.google.com/app/apikey
- Sign in with your Google account
- Click "Create API Key"
- Copy the key to your `.env.local` file

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### First Time Setup

1. Click "Get Started" on the welcome screen
2. Complete the 3-step onboarding:
   - Enter your name, age, and gender
   - Provide your height and weight
   - Select your activity level
3. Your personalized daily calorie goal will be calculated automatically

### Adding Meals

1. Click "+ Add Meal" from the dashboard
2. Select a food image from your device
3. Click "Analyze Food" to get AI-powered nutrition analysis
4. Review the results and click "Save Meal"

### Viewing Progress

- The dashboard shows your daily calorie progress with a visual circle
- View all meals logged today with their nutrition information
- Track remaining calories to meet your goal

## Project Structure

```
calorie-tracker-web/
├── app/                      # Next.js app directory
│   ├── page.tsx             # Main dashboard
│   ├── add-meal/            # Meal entry page
│   ├── onboarding/          # User onboarding flow
│   └── profile/             # User profile & settings
├── lib/                     # Core library code
│   ├── services/            # Business logic
│   │   ├── food-analyzer.ts     # AI food analysis
│   │   ├── storage.ts           # LocalStorage wrapper
│   │   └── calorie-calculator.ts # Calorie calculations
│   └── types/               # TypeScript type definitions
│       └── models.ts
├── components/              # React components (future)
├── public/                  # Static assets
└── .env.local              # Environment variables (not in git)
```

## Technologies

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **AI**: Google Gemini AI (gemini-1.5-flash)
- **Storage**: Browser LocalStorage

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub

2. Import the project in Vercel:
   - Visit [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

3. Add environment variables in Vercel:
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_GOOGLE_AI_API_KEY` with your API key

4. Deploy!

Your app will be live at `https://your-project.vercel.app`

### Build for Production

```bash
npm run build
npm start
```

## Privacy & Data

- All user data is stored locally in the browser's LocalStorage
- No data is sent to external servers (except food images to Google AI for analysis)
- You can clear all data anytime from the Profile page

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Troubleshooting

### "No API key found" error
- Make sure you created `.env.local` file
- Verify the key is named `NEXT_PUBLIC_GOOGLE_AI_API_KEY`
- Restart the development server after adding environment variables

### Food analysis not working
- Check your Google AI API key is valid
- Ensure the image is a clear photo of food
- Check browser console for detailed error messages

### Data not persisting
- LocalStorage only works in browsers (not in SSR)
- Check browser privacy settings allow LocalStorage
- Clear browser cache if experiencing issues

## License

MIT License - feel free to use this project for personal or commercial purposes!

## Credits

Adapted from the Expo-based Calorie Tracker app, rebuilt for universal web access.
