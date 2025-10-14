# Executive Assistant Backend API

An AI-powered executive assistant automation system built with NestJS. This backend handles scheduling, email automation, task management, and natural language processing using free-tier APIs.

## Features

- 📅 **Calendar Management**: Google Calendar API integration for scheduling meetings and finding available slots
- 📧 **Email Automation**: SendGrid integration for automated follow-ups, meeting invites, and reminders
- ✅ **Task Management**: Create, track, and manage tasks with automated reminders
- 🤖 **Natural Language Processing**: Gemini AI integration for processing commands in natural language
- ⏰ **Automated Scheduling**: Cron jobs for daily task reminders and digests
- 📊 **Analytics**: Task statistics and reporting
- 🔄 **RESTful API**: Well-documented API endpoints with Swagger

## Tech Stack

- **Framework**: NestJS
- **Language**: TypeScript
- **APIs**: 
  - Google Calendar API (Free Tier)
  - SendGrid API (Free Tier)
  - Google Gemini API (Free Tier)
- **Scheduling**: NestJS Schedule Module
- **Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google Cloud Platform account (free)
- SendGrid account (free)
- Google AI Studio account (free)

## Setup Instructions

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd executive-assistant-backend

# Install dependencies
npm install
```

### 2. Configure Google Calendar API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials:
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: Web application
   - Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
5. Download the credentials and note:
   - Client ID
   - Client Secret

6. Get Refresh Token:
```bash
# Run this helper script to get your refresh token
node scripts/get-google-refresh-token.js
```

### 3. Configure SendGrid API

1. Go to [SendGrid](https://app.sendgrid.com/)
2. Sign up for free account (100 emails/day)
3. Create API Key:
   - Settings → API Keys → Create API Key
   - Give it "Full Access" or "Mail Send" permission
4. Verify sender email:
   - Settings → Sender Authentication → Verify Single Sender

### 4. Configure Gemini API

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key (free tier: 60 requests/minute)

### 5. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your credentials:

```env
NODE_ENV=development
PORT=3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token

SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_verified_email@domain.com

GEMINI_API_KEY=your_gemini_api_key
```

## Running the Application

### Development Mode

```bash
npm run start:dev
```

### Production Mode

```bash
npm run build
npm run start:prod
```

### Watch Mode

```bash
npm run start:debug
```

The API will be available at: `http://localhost:3000`

API Documentation (Swagger): `http://localhost:3000/api/docs`

## API Endpoints

### Health Check

- `GET /api/v1/health` - Basic health check
- `GET /api/v1/health/readiness` - Readiness probe
- `GET /api/v1/health/liveness` - Liveness probe

### Calendar

- `GET /api/v1/calendar/events` - List calendar events
- `POST /api/v1/calendar/events` - Create new event
- `GET /api/v1/calendar/availability` - Find available time slots
- `PATCH /api/v1/calendar/events/:id` - Update event
- `DELETE /api/v1/calendar/events/:id` - Delete event

### Email

- `POST /api/v1/email/send` - Send custom email
- `POST /api/v1/email/follow-up` - Send follow-up email
- `POST /api/v1/email/meeting-invite` - Send meeting invitation
- `POST /api/v1/email/task-reminder` - Send task reminder

### Tasks

- `GET /api/v1/tasks` - List all tasks (with filters)
- `POST /api/v1/tasks` - Create new task
- `GET /api/v1/tasks/stats` - Get task statistics
- `GET /api/v1/tasks/upcoming` - Get upcoming tasks
- `GET /api/v1/tasks/overdue` - Get overdue tasks
- `GET /api/v1/tasks/:id` - Get task by ID
- `PATCH /api/v1/tasks/:id` - Update task
- `DELETE /api/v1/tasks/:id` - Delete task

### NLP (Natural Language Processing)

- `POST /api/v1/nlp/process` - Process natural language command
- `POST /api/v1/nlp/summarize` - Generate text summary
- `POST /api/v1/nlp/suggest-response` - Suggest email response

## Usage Examples

### Schedule a Meeting (Natural Language)

```bash
curl -X POST http://localhost:3000/api/v1/nlp/process \
  -H "Content-Type: application/json" \
  -d '{
    "command": "Schedule a meeting with John next Tuesday at 2pm for 1 hour",
    "userEmail": "user@example.com"
  }'
```

### Create a Task

```bash
curl -X POST http://localhost:3000/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Review Q4 Budget",
    "description": "Review and approve Q4 budget proposal",
    "dueDate": "2024-10-20T17:00:00Z",
    "priority": "high",
    "status": "pending",
    "assignedTo": "user@example.com"
  }'
```

### Send Follow-up Email

```bash
curl -X POST http://localhost:3000/api/v1/email/follow-up \
  -H "Content-Type: application/json" \
  -d '{
    "to": "attendee@example.com",
    "meetingDetails": {
      "title": "Q4 Planning Meeting",
      "date": "2024-10-14T14:00:00Z",
      "attendees": ["john@example.com", "jane@example.com"],
      "notes": "Discussed budget allocation and timeline"
    }
  }'
```

### Find Available Time Slots

```bash
curl "http://localhost:3000/api/v1/calendar/availability?date=2024-10-15&duration=60"
```

## Automated Tasks

The system runs automated tasks using cron jobs:

- **Hourly**: Check for upcoming tasks and send reminders
- **Daily (9 AM)**: Send daily task digest with overdue and today's tasks

## Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── calendar/                  # Calendar management
│   ├── calendar.module.ts
│   ├── calendar.service.ts
│   ├── calendar.controller.ts
│   └── dto/
├── email/                     # Email automation
│   ├── email.module.ts
│   ├── email.service.ts
│   ├── email.controller.ts
│   └── dto/
├── task/                      # Task management
│   ├── task.module.ts
│   ├── task.service.ts
│   ├── task.controller.ts
│   ├── task-scheduler.service.ts
│   └── dto/
├── nlp/                       # Natural language processing
│   ├── nlp.module.ts
│   ├── nlp.service.ts
│   ├── nlp.controller.ts
│   └── dto/
└── health/                    # Health checks
    ├── health.module.ts
    └── health.controller.ts
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## Deployment

### Deploy to Google Cloud Run (Free Tier)

1. Build the Docker image:

```dockerfile
# Create Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
CMD ["npm", "run", "start:prod"]
```

2. Deploy:

```bash
gcloud run deploy executive-assistant \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Environment Variables in Cloud Run

Set all environment variables in Cloud Run:

```bash
gcloud run services update executive-assistant \
  --set-env-vars GOOGLE_CLIENT_ID=xxx,SENDGRID_API_KEY=xxx,...
```

## Free Tier Limits

- **Google Calendar API**: 1,000,000 queries/day
- **SendGrid**: 100 emails/day
- **Gemini API**: 60 requests/minute
- **Google Cloud Run**: 2 million requests/month, 360,000 GB-seconds/month
- **Cloud Scheduler**: 3 jobs/month free

## Troubleshooting

### Google Calendar not working
- Ensure OAuth consent screen is configured
- Check that Calendar API is enabled
- Verify refresh token is valid

### SendGrid emails not sending
- Verify sender email address
- Check API key permissions
- Ensure you haven't exceeded free tier limit (100/day)

### Gemini API errors
- Check API key is valid
- Verify you haven't exceeded rate limits (60/min)
- Ensure proper JSON formatting in prompts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please create an issue in the repository.

## Roadmap

- [ ] Add user authentication (JWT)
- [ ] Integrate database (PostgreSQL) for persistence
- [ ] Add WebSocket for real-time notifications
- [ ] Implement meeting transcription
- [ ] Add calendar conflict detection
- [ ] Email template builder
- [ ] Advanced NLP intent recognition
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Analytics dashboard

## Acknowledgments

- NestJS framework
- Google Calendar API
- SendGrid
- Google Gemini AI