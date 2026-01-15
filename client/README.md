# BidGrid Client

React frontend for the BidGrid RFP management platform.

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: Redux Toolkit
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **HTTP**: Axios

## 📁 Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── Navbar.jsx
│   ├── ChatMessage.jsx
│   ├── RFPPreview.jsx
│   └── VendorList.jsx
├── pages/                # Page components
│   ├── LandingPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── Dashboard.jsx
│   ├── VendorsPage.jsx
│   ├── CreateRFPPage.jsx
│   ├── RFPDetailPage.jsx
│   └── SubmitProposalPage.jsx
├── store/                # Redux store
│   ├── store.js
│   └── slices/
│       ├── authSlice.js
│       ├── vendorSlice.js
│       └── rfpSlice.js
├── utils/
│   └── axiosInstance.js  # Axios with interceptors
├── App.jsx               # Routes & layout
├── main.jsx             # Entry point
└── index.css            # Tailwind imports
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 3. Build for Production

```bash
npm run build
```

## 📱 Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | LandingPage | Public landing with features |
| `/login` | LoginPage | User login |
| `/register` | RegisterPage | User registration |
| `/dashboard` | Dashboard | Overview with RFP list |
| `/vendors` | VendorsPage | Vendor management |
| `/rfps/create` | CreateRFPPage | AI chat RFP builder |
| `/rfps/:id` | RFPDetailPage | RFP details + proposals |

## ✨ Features

### AI Chat RFP Builder
- Natural language conversation with Gemini AI
- Live RFP preview as you chat
- Auto-extraction of requirements, budget, timeline

### Vendor Management
- Add/edit/delete vendor contacts
- Select vendors when sending RFPs
- Track which vendors received RFPs

### Proposal Comparison
- View all vendor proposals side-by-side
- AI-extracted data: price, timeline, terms
- Completeness scores
- AI recommendation with reasoning

### Modern UI
- Dark/light themes
- Glassmorphism design
- Smooth animations
- Responsive layout

## 🔧 Environment

The client connects to the backend at `http://localhost:5000` by default.

To change, update `src/utils/axiosInstance.js`:

```javascript
const axiosInstance = axios.create({
  baseURL: "http://your-api-url/api/v1",
});
```

## 📦 Key Dependencies

- `react` - UI framework
- `react-router-dom` - Routing
- `@reduxjs/toolkit` - State management
- `axios` - HTTP client
- `framer-motion` - Animations
- `lucide-react` - Icons
- `tailwindcss` - Styling
