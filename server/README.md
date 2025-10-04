# Survey Server

Express.js backend server with support for SQLite (local) or IBM Db2 (production).

## Quick Start

From the root directory:
```bash
npm install
npm run dev:all
```

## Database Options

### Option 1: SQLite (Default - For Development)
- No configuration needed
- Database file created at `server/survey.db`
- Perfect for local development and testing

### Option 2: IBM Db2 (For Production)

1. Create a `.env` file in the `server/` directory:
```bash
cp env.example .env
```

2. Configure your Db2 connection:
```env
DATABASE_TYPE=db2
DB2_CONN_STRING=DATABASE=SAMPLE;HOSTNAME=your-db2-host;PORT=50000;PROTOCOL=TCPIP;UID=username;PWD=password;
```

3. Run the SQL schema:
```bash
db2 -tvf db2-setup.sql
```

4. Use `db2-server.js` instead:
```bash
node db2-server.js
```

## API Endpoints

### Sessions
- `GET /api/sessions` - Get all sessions
- `POST /api/sessions` - Create new session
- `GET /api/sessions/:id` - Get session by ID
- `PATCH /api/sessions/:id` - Update session (activate/deactivate)
- `DELETE /api/sessions/:id` - Delete session and all responses

### Submissions
- `POST /api/submissions` - Submit survey response
- `GET /api/submissions` - Get all submissions
- `GET /api/sessions/:id/submissions` - Get submissions for specific session

### Export
- `GET /api/export/database` - Download SQLite database file

## Database

The SQLite database (`survey.db`) is created automatically in the `server/` directory.

### Schema
- `sessions` - Survey sessions
- `submissions` - Survey responses with respondent info
- `responses` - Individual question ratings

## Development

The server uses `nodemon` for auto-restart during development.

