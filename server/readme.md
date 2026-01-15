# BidGrid Server

Backend API for the BidGrid RFP management platform.

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI**: Google Gemini 2.5 Flash (LangChain)
- **Email Sending**: Resend
- **Email Reading**: IMAP (imap-simple)
- **PDF Parsing**: pdf-parse
- **Auth**: JWT with refresh tokens
- **Validation**: Zod

## 📁 Structure

```
src/
├── controllers/          # Request handlers
│   ├── user.controller.js
│   ├── vendor.controller.js
│   ├── rfp.controller.js
│   ├── proposal.controller.js
│   └── ingestion.controller.js
├── models/               # Mongoose schemas
│   ├── user.model.js
│   ├── vendor.model.js
│   ├── rfp.model.js
│   └── proposal.model.js
├── routes/               # API route definitions
├── services/             # Business logic
│   ├── ai.service.js     # Gemini AI integration
│   ├── email.service.js  # Resend email sending
│   ├── emailIngestion.service.js  # IMAP email reading
│   ├── pdfParser.service.js       # PDF text extraction
│   └── vendorRecommendation.service.js  # AI comparison
├── middleware/           # Express middleware
├── validators/           # Zod validation schemas
├── templates/            # Email HTML templates
├── utils/                # Helpers (ApiError, asyncHandler)
├── app.js               # Express app setup
└── index.js             # Server entry point
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `src/.env`:

```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
MONGODB_URI=mongodb+srv://...

# AI Service
GEMINI_API_KEY=your-gemini-api-key

# Email Sending (Resend)
RESEND_API_KEY=re_xxxxx

# Email Ingestion (IMAP)
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=your-email@gmail.com
IMAP_PASSWORD=your-app-password

# JWT Auth
ACCESS_TOKEN_SECRET=your-secret-key
ACCESS_TOKEN_EXPIRY=10d
REFRESH_TOKEN_SECRET=your-refresh-secret
REFRESH_TOKEN_EXPIRY=1d
```

### 3. Run Server

```bash
# Development (with nodemon)
npm run dev

# Production
npm start
```

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/users/register` | Register new user |
| POST | `/api/v1/users/login` | Login |
| POST | `/api/v1/users/logout` | Logout |
| GET | `/api/v1/users/me` | Get current user |
| POST | `/api/v1/users/refresh` | Refresh access token |

### Vendors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/vendors` | List all vendors |
| POST | `/api/v1/vendors` | Create vendor |
| PATCH | `/api/v1/vendors/:id` | Update vendor |
| DELETE | `/api/v1/vendors/:id` | Delete vendor |

### RFPs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/rfps/chat` | AI chat for RFP creation |
| GET | `/api/v1/rfps` | List all RFPs |
| GET | `/api/v1/rfps/:id` | Get single RFP |
| POST | `/api/v1/rfps/:id/send` | Send RFP to vendors |
| GET | `/api/v1/rfps/:id/proposals` | Get proposals for RFP |

### Email Ingestion
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/ingestion/:rfpId/ingest` | Ingest vendor emails |
| GET | `/api/v1/ingestion/:rfpId/recommendation` | Get AI recommendation |

## 🔐 Gmail IMAP Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to: https://myaccount.google.com/apppasswords
3. Generate App Password for "Mail"
4. Use the 16-char password as `IMAP_PASSWORD`

## 📧 Email Flow

```
1. Create RFP → AI generates content
2. Send to Vendors → Resend dispatches emails (Reply-To: IMAP_USER)
3. Vendors Reply → Emails arrive in IMAP_USER inbox
4. Click "Check for Replies" → IMAP fetches unread emails
5. AI Parses → Extracts price, terms, timeline from messy text
6. Compare → View all proposals side-by-side
7. Get Recommendation → AI suggests best vendor with reasoning
```

## 🧪 Testing

```bash
# Run tests
npm test
```
