# Super Coach Pro

A modern, AI-powered fitness application built as a full-stack example using React, TypeScript, Cloudflare Workers, and Supabase. This app demonstrates best practices for building scalable web applications with authentication, real-time data, and AI integration.

## 🏋️ Features

- **Workout Planner**: Create and manage custom workout routines with exercise selection, sets, reps, and rest periods
- **Diet Planner**: Design meal plans with nutritional tracking and food selection
- **Calendar Integration**: Schedule workouts and meal plans with recurring events
- **AI Chat Assistant**: Get personalized fitness and nutrition recommendations powered by OpenAI
- **Live Workout Mode**: Track workouts in real-time with progress indicators and timers
- **Progress Tracking**: View workout history and nutritional data
- **User Authentication**: Secure sign-up/sign-in with Supabase Auth

## 🛠️ Technology Stack

### Frontend (UI)
- **React 19** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful UI components
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Supabase** for authentication

### Backend (Server)
- **Cloudflare Workers** for serverless API
- **TypeScript** for type safety
- **Supabase** for database and authentication
- **OpenAI API** for AI chat functionality
- **Vitest** for testing

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18.18.0 or higher)
- **npm** or **yarn**
- A **Supabase** account and project
- An **OpenAI** API key (for AI features)
- **Cloudflare** account (for deployment)

## 📦 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/super-coach-pro.git
cd super-coach-pro
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install UI dependencies
cd ui
npm install
cd ..

# Install server dependencies
cd server
npm install
cd ..
```

### 3. Set Up Supabase Database

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Run the following SQL to create the required tables:

```sql
-- Create workouts table
CREATE TABLE workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    exercises JSONB NOT NULL,
    estimated_duration INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plans table
CREATE TABLE meal_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    meals JSONB NOT NULL,
    total_nutrition JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workout_schedules table
CREATE TABLE workout_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    recurrence TEXT CHECK (recurrence IN ('once', 'weekly')),
    days_of_week TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can only see their own workouts" ON workouts
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own meal plans" ON meal_plans
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only see their own workout schedules" ON workout_schedules
    FOR ALL USING (auth.uid() = user_id);
```

### 4. Configure Environment Variables

#### Frontend Configuration
Update `ui/src/lib/supabase.ts` with your Supabase credentials:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

#### Backend Configuration
Update `server/.dev.vars` with your credentials:

```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

Also update `server/wrangler.toml`:

```toml
[vars]
SUPABASE_URL = "your_supabase_url"
SUPABASE_ANON_KEY = "your_supabase_anon_key"
SUPABASE_SERVICE_ROLE_KEY = "your_supabase_service_role_key"
```

### 5. Configure API Endpoint

Update the API endpoint in `ui/src/lib/serverComm.ts`:

```typescript
// For local development
const API_BASE_URL = 'http://localhost:8787';

// For production (update with your deployed Worker URL)
// const API_BASE_URL = 'https://your-worker.your-subdomain.workers.dev';
```

## 🏃‍♂️ Running the Application

### Development Mode

1. **Start the backend server:**
```bash
cd server
npm run dev
```
The API will be available at `http://localhost:8787`

2. **Start the frontend development server:**
```bash
cd ui
npm run dev
```
The UI will be available at `http://localhost:5173`

### Building for Production

1. **Build the frontend:**
```bash
cd ui
npm run build
```

2. **Deploy the backend to Cloudflare Workers:**
```bash
cd server
npm run deploy
```

## 📱 Usage

1. **Sign Up/Sign In**: Create an account or sign in with your credentials
2. **Create Workouts**: Use the Workout Planner to design custom routines
3. **Plan Meals**: Use the Diet Planner to create meal plans with nutritional tracking
4. **Schedule Activities**: Use the Calendar to schedule workouts and meals
5. **Get AI Recommendations**: Chat with the AI assistant for personalized advice
6. **Track Progress**: Monitor your fitness journey with built-in analytics

## 🏗️ Project Structure

```
super-coach-pro/
├── ui/                          # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/             # Route components
│   │   ├── contexts/          # React contexts (Auth, etc.)
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and API client
│   │   ├── store/             # Redux store and slices
│   │   ├── types/             # TypeScript type definitions
│   │   └── data/              # Mock data for development
│   ├── public/                # Static assets
│   └── package.json
├── server/                     # Backend Cloudflare Worker
│   ├── src/
│   │   ├── handlers/          # API route handlers
│   │   ├── db.ts             # Database interface and Supabase client
│   │   ├── routes.ts         # API route definitions
│   │   ├── middleware.ts     # Request handling middleware
│   │   └── index.ts          # Worker entry point
│   ├── wrangler.toml         # Cloudflare Worker configuration
│   └── package.json
└── README.md
```

## 🧪 Testing

Run tests for the backend:
```bash
cd server
npm test
```

## 🚀 Deployment

### Frontend Deployment
The frontend can be deployed to any static hosting service like Vercel, Netlify, or Cloudflare Pages:

```bash
cd ui
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
Deploy to Cloudflare Workers:

```bash
cd server
npm run deploy
```

## 🔧 API Endpoints

- `GET /api/exercises` - Get available exercises
- `GET /api/workouts` - Get user's workouts
- `POST /api/workouts` - Create a new workout
- `PUT /api/workouts/{id}` - Update a workout
- `DELETE /api/workouts` - Delete a workout
- `GET /api/meal-plans` - Get user's meal plans
- `POST /api/meal-plans` - Create a new meal plan
- `PUT /api/meal-plans/{id}` - Update a meal plan
- `DELETE /api/meal-plans/{id}` - Delete a meal plan
- `GET /api/workout-schedules` - Get scheduled workouts
- `POST /api/workout-schedules` - Schedule a workout
- `DELETE /api/workout-schedules/{id}` - Delete a scheduled workout
- `POST /api/chat` - Send message to AI assistant

## 🔐 Authentication

The application uses Supabase Auth for user management:
- Email/password authentication
- JWT tokens for API authentication
- Row-level security (RLS) for data protection

## 🤝 Contributing

This is an example application, but contributions are welcome:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Errors**: Ensure your Supabase credentials are correct and the database tables are created
2. **CORS Issues**: Make sure your API endpoints include proper CORS headers
3. **Authentication Errors**: Verify your Supabase keys and that RLS policies are properly configured
4. **AI Chat Not Working**: Check that your OpenAI API key is valid and has sufficient credits

### Getting Help

- Check the [Supabase Documentation](https://supabase.com/docs)
- Review [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- Consult [React Documentation](https://react.dev/)

## 🌟 What You'll Learn

This example application demonstrates:
- Modern React development with TypeScript and functional components
- State management with Redux Toolkit
- Serverless API development with Cloudflare Workers
- Database design and Row-Level Security with Supabase
- Real-time authentication and user management
- AI integration with OpenAI API
- Responsive design with Tailwind CSS
- Component architecture with shadcn/ui
- Testing strategies for full-stack applications
- Deployment to modern cloud platforms 