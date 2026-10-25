# An Idiot's POV

A full-stack writing and reading application, organized as a React frontend,
a Python backend, and a shared local database.

## Project structure

```text
.
├── backend/
│   ├── api/                 # HTTP route handlers for articles, notebooks, health, and uploads
│   ├── database/            # Database connection and initialization
│   ├── models/              # Persisted article and notebook entities
│   ├── schemas/              # Request and response data shapes
│   ├── services/             # Application logic for articles, notebooks, and uploads
│   ├── storage/              # Backend configuration and Python dependencies
│   └── main.py               # Backend application entry point
├── database/
│   └── idiots_pov.db         # Local application database
└── frontend/
    ├── public/               # Static public assets
    ├── src/
    │   ├── assets/           # Imported frontend assets
    │   ├── components/       # Reusable interface components
    │   ├── hooks/            # Article and notebook state/data hooks
    │   ├── pages/            # Editor, reader, story, and notebook screens
    │   ├── services/         # API client and backend-facing operations
    │   ├── utils/            # Shared formatting and reading-time helpers
    │   ├── App.jsx           # Application routes and composition
    │   └── main.jsx          # Frontend entry point
    ├── package.json          # Frontend scripts and dependencies
    └── vite.config.js         # Vite development/build configuration
```

## Responsibilities and boundaries

- **Frontend** owns presentation, navigation, and user interactions. Pages
  compose reusable components; hooks manage page-level data and state; services
  handle communication with the backend.
- **Backend** owns HTTP endpoints, validation/data schemas, application
  services, and persistence coordination. Route handlers should delegate
  application logic to services rather than implement it directly.
- **Database** contains local persisted application data. Database access and
  initialization belong in `backend/database/`, not in route handlers.
- **Uploads and configuration** belong to the backend. Keep secrets in the
  local `backend/storage/.env` file; use `.env.example` to document required
  variable names without values.

## Frontend development

Run the frontend commands from the `frontend/` directory:

```powershell
npm install
npm run dev
```

Available scripts are `dev` (Vite development server), `build` (production
build), `preview` (serve a production build locally), and `lint` (ESLint).

The backend dependency file and application modules are currently placeholders.
Define backend dependencies and startup instructions there as the API is
implemented.