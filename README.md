# RayyAI Frontend

A comprehensive personal finance management application built with React 19, featuring AI-powered insights, transaction tracking, budget management, and financial health analytics.

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | React 19.1, React Router 7.9 |
| **Build Tool** | Vite 7.1 |
| **Styling** | Tailwind CSS 4.1, Framer Motion |
| **UI Components** | Radix UI, Shadcn/ui, Lucide Icons |
| **Charts** | Recharts 2.15 |
| **HTTP Client** | Axios 1.12 |
| **Forms** | React Hook Form, Zod |
| **State** | React Context API |

## Features

- **Dashboard** - Financial overview with metrics, trends, and health scores
- **Transactions** - Track income, expenses, and transfers with filtering/search
- **Bank Statement Upload** - Automated parsing of CSV/PDF statements
- **Budget Tracking** - Create and monitor budgets with real-time spending alerts
- **Credit Cards** - Manage cards, track limits, and get AI recommendations
- **Financial Goals** - Set savings goals with progress visualization
- **RayyAI Chat** - Conversational AI assistant for financial advice
- **Smart Analysis** - AI-powered spending insights and recommendations
- **Receipt Scanner** - OCR-based receipt scanning for quick expense entry
- **Fraud Detection** - Suspicious transaction alerts

## Project Structure

```
src/
├── components/
│   ├── charts/           # Financial visualizations (7 chart types)
│   ├── general/          # Navigation, auth dialogs
│   ├── shared/           # Reusable components (Badge, MetricCard, etc.)
│   ├── transactions/     # Transaction forms, AI-assisted entry
│   ├── upload-statement/ # Statement upload components
│   └── ui/               # Radix UI primitives (50+ components)
├── pages/
│   ├── details/          # Detail pages (Category, Goal, Card)
│   ├── Dashboard.jsx
│   ├── TransactionHistory.jsx
│   ├── BudgetTrackerPage.jsx
│   ├── FinancialGoals.jsx
│   ├── CreditCardpage.jsx
│   ├── RayyAIchat.jsx
│   └── ...
├── contexts/             # AuthContext for authentication state
├── hooks/                # Custom hooks (useTransactions, useBudgets, etc.)
├── services/api/         # Modular API services
├── utils/                # Formatting and helper utilities
└── config/               # Navigation and app configuration
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see [rayyai-backend](../rayyai-backend))

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd rayyai-frontend/rayyai

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your API URL
```

### Environment Variables

```env
VITE_API_BASE_URL=http://localhost:8000
```

### Development

```bash
# Start development server (http://localhost:5173)
npm run dev

# Run linting
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend connects to a FastAPI backend with the following services:

| Service | Endpoints |
|---------|-----------|
| **Auth** | Login, register, profile management |
| **Transactions** | Income, expenses, transfers CRUD |
| **Accounts** | Bank account management |
| **Budgets** | Budget creation and tracking |
| **Cards** | Credit card management, AI recommendations |
| **Goals** | Financial goals tracking |
| **Chat** | RayyAI conversations and insights |
| **Scanner** | Receipt OCR scanning |

### API Client Features

- Axios-based HTTP client with interceptors
- Automatic JWT token attachment
- Environment-based URL switching (dev/prod)
- Centralized error handling

## Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Authentication state and methods |
| `useTransactions` | Transaction CRUD operations |
| `useBudgets` | Budget management |
| `useAccounts` | Account operations |
| `useCards` | Credit card management |
| `useGoals` | Financial goals |
| `useChat` | AI chat integration |
| `useScanner` | Receipt scanning |
| `useAsync` | Generic async state management |

## Path Aliases

The project uses `@/` as an alias for the `src/` directory:

```javascript
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts";
import { transactionApi } from "@/services/api";
```

## Deployment

### Firebase Hosting

```bash
# Build the project
npm run build

# Deploy to Firebase
firebase deploy --only hosting
```

### Production Build

The production build outputs to `dist/` with:
- Minified JavaScript bundles
- Optimized CSS with Tailwind purge
- Asset fingerprinting for cache busting

## Contributing

1. Follow the existing folder structure
2. Use TypeScript-style JSDoc comments
3. Run `npm run lint` before committing
4. Keep components focused and reusable

## License

Private - All rights reserved
