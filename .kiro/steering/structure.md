# Ghostagotchi Project Structure

## Repository Organization

```
ghostagotchi/
├── .kiro/                      # Kiro configuration and steering
│   ├── specs/                  # Spec-driven development files
│   ├── steering/               # AI steering documents
│   └── settings/               # Kiro settings (MCP config, etc.)
├── ios/                        # iOS mobile application
│   ├── Ghostagotchi/
│   │   ├── Views/              # SwiftUI views
│   │   │   ├── ARView/         # AR ghost display
│   │   │   ├── ChatView/       # Chat interface
│   │   │   └── AuthView/       # Login/signup
│   │   ├── ViewModels/         # State management
│   │   │   └── PetViewModel.swift
│   │   ├── Models/             # Data models
│   │   │   └── Pet.swift
│   │   ├── Services/           # Network and business logic
│   │   │   ├── SupabaseService.swift
│   │   │   └── APIService.swift
│   │   ├── Resources/          # Assets, 3D models
│   │   └── App/                # App entry point
│   └── Ghostagotchi.xcodeproj
├── web/                        # Next.js web application
│   ├── pages/                  # Next.js pages and routing
│   │   ├── api/                # API routes (serverless functions)
│   │   │   ├── pet/
│   │   │   │   ├── index.ts    # GET/POST pet
│   │   │   │   ├── feed.ts     # Feed action
│   │   │   │   └── play.ts     # Play action
│   │   │   ├── chat.ts         # OpenAI integration
│   │   │   ├── leaderboard.ts  # Leaderboard data
│   │   │   └── profile.ts      # Profile updates
│   │   ├── index.tsx           # Landing/login page
│   │   ├── dashboard.tsx       # Main ghost dashboard
│   │   ├── leaderboard.tsx     # Public leaderboard
│   │   └── _app.tsx            # App wrapper
│   ├── components/             # React components
│   │   ├── GhostCard.tsx       # Ghost display and stats
│   │   ├── ChatBox.tsx         # Chat interface
│   │   ├── ActionButtons.tsx   # Feed/play buttons
│   │   └── Layout.tsx          # Common layout
│   ├── lib/                    # Utilities and helpers
│   │   ├── supabase.ts         # Supabase client setup
│   │   └── openai.ts           # OpenAI client setup
│   ├── styles/                 # CSS/Tailwind styles
│   ├── public/                 # Static assets
│   └── prisma/                 # Database schema and migrations
│       ├── schema.prisma       # Prisma data model
│       └── migrations/         # Database migrations
├── docs/                       # Documentation
│   ├── srd.md                  # Software Requirements Document
│   └── api.md                  # API documentation
├── .env.local                  # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Key Directories

### iOS App Structure

- **Views/**: SwiftUI views organized by feature (AR, Chat, Auth)
- **ViewModels/**: ObservableObject classes managing state and business logic
- **Models/**: Swift structs representing data (Pet, Message, etc.)
- **Services/**: Network layer and external service integrations
- **Resources/**: 3D models (.usdz), images, sounds

### Web App Structure

- **pages/**: File-based routing (Next.js convention)
  - Each file in `pages/` becomes a route
  - `pages/api/` contains serverless API endpoints
- **components/**: Reusable React components
- **lib/**: Shared utilities, client configurations
- **prisma/**: Database schema and migration files

### Kiro Directory

- **specs/**: Specification documents driving development
- **steering/**: Context documents teaching Kiro about the project
- **settings/**: MCP configuration and other Kiro settings

## Code Organization Principles

### iOS (MVVM Pattern)

1. **Views** are purely presentational, binding to ViewModel properties
2. **ViewModels** handle state, business logic, and coordinate services
3. **Services** encapsulate network calls and external integrations
4. **Models** are simple data structures (structs preferred)

Example flow:
```
View → ViewModel → Service → API/Database
     ← (via @Published) ← (async/await)
```

### Web (Component-Based)

1. **Pages** handle routing and may fetch initial data (SSR/SSG)
2. **Components** are functional with hooks for state
3. **API routes** handle server-side logic (auth, OpenAI, complex queries)
4. **lib/** contains shared logic and client setup

Example flow:
```
Page/Component → API Route → Prisma/Supabase → Database
               ← (fetch/axios) ← (JSON response)
```

## Database Schema Location

The single source of truth for the database schema is `web/prisma/schema.prisma`. This defines:
- All tables (Profile, Pet, Message)
- Relationships and constraints
- Indexes and defaults

Migrations are generated and stored in `web/prisma/migrations/`.

## Shared Concepts Across Platforms

Both iOS and web implement the same core features:
- User authentication (Supabase Auth)
- Pet state management (hunger, mood, level, XP)
- Real-time synchronization (Supabase Realtime)
- AI chat (via Next.js API proxy)
- Feed/play actions (updating stats)

The backend (Supabase + Next.js API) is the single source of truth, ensuring consistency.

## Development Workflow

1. **Spec First**: Define features in `.kiro/specs/`
2. **Backend**: Implement data model and API routes
3. **iOS & Web**: Implement UI and integrate with backend (can be parallel)
4. **Testing**: Unit tests, integration tests, manual cross-platform testing
5. **Deployment**: Vercel for web, TestFlight for iOS

## File Naming Conventions

- **iOS**: PascalCase for files (e.g., `PetViewModel.swift`)
- **Web**: 
  - Components: PascalCase (e.g., `GhostCard.tsx`)
  - Pages: lowercase (e.g., `dashboard.tsx`)
  - API routes: lowercase (e.g., `feed.ts`)
  - Utilities: camelCase (e.g., `supabase.ts`)

## Configuration Files

- **iOS**: `Info.plist` for app configuration, permissions
- **Web**: 
  - `next.config.js` for Next.js configuration
  - `tailwind.config.js` for styling
  - `tsconfig.json` for TypeScript
  - `.env.local` for environment variables (not committed)

## Asset Management

- **iOS**: Assets in Xcode Asset Catalog, 3D models in Resources/
- **Web**: Static files in `public/`, imported assets in components

## Testing Structure

- **iOS**: XCTest files alongside source (e.g., `PetViewModelTests.swift`)
- **Web**: Jest tests in `__tests__/` or co-located with `.test.ts` suffix
