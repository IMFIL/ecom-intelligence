# Compete Insight Hub Analysis Server (Node.js)

This Node.js server handles automated browser interactions and screenshot capture for e-commerce website analysis using Browserbase and Stagehand.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file with the following variables:

   ```
   PORT=3002
   BROWSERBASE_API_KEY=your_browserbase_api_key
   BROWSERBASE_PROJECT_ID=your_browserbase_project_id
   OPENAI_API_KEY=your_openai_api_key
   ```

3. Start the server:

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

The server will start on port 3002 by default.

## API Endpoints

### POST `/api/analyze-pages`

Analyze a product page and capture screenshots.

**Request Body:**

```json
{
  "url": "string",
  "page_group": "string",
  "company_name": "string"
}
```

**Response:**
Returns the filepath of the captured screenshot.

### Features

- **Automated Navigation**: Intelligently navigates e-commerce websites to find and analyze product pages
- **Modal Handling**: Automatically handles various types of popups and modals:

  - Cookie consent banners
  - Newsletter signups
  - Country/region selection
  - Age verification
  - App download prompts
  - Chat widgets
  - Survey invites

- **Smart Screenshot Management**:

  - Takes full-page screenshots
  - Splits screenshots into three parts for easier analysis
  - Organizes screenshots by domain and timestamp
  - Checks for existing screenshots to avoid duplicate work

- **Error Handling**:
  - Graceful handling of navigation timeouts
  - Recovery from common e-commerce site issues
  - Detailed error logging

## Screenshot Storage

Screenshots are stored in the `screenshots` directory, organized by domain:

```
screenshots/
├── example.com/
│   ├── PDP_timestamp.jpg
│   ├── PDP_timestamp_part1.jpg
│   ├── PDP_timestamp_part2.jpg
│   └── PDP_timestamp_part3.jpg
└── another-site.com/
    └── ...
```

## Browser Automation

The server uses Browserbase and Stagehand for reliable browser automation with the following features:

- Viewport size: 1920x3400
- Captcha solving enabled
- Session recording for debugging
- 10-minute timeout for long-running operations

## Dependencies

- Express.js
- Browserbase SDK
- Stagehand
- Sharp (for image processing)
- Other dependencies listed in `package.json`

## Development

The server is written in TypeScript and uses ES modules. Key files:

- `src/index.ts`: Server entry point
- `src/routes/analysis.ts`: API route handlers
- `src/services/analysis.ts`: Core analysis logic
- `src/models/types.ts`: TypeScript type definitions
