# Merchants Management Board

Yuno's merchant management portal with Kanban boards, technical demand tracking, implementations, goals, and NPS.

## Stack

- **Frontend:** HTML + CSS + JavaScript (vanilla, zero dependencies)
- **Single file:** `index.html` — no build, no framework, no backend
- **Persistence:** `localStorage` (data saved in browser)
- **i18n:** Portuguese (PT-BR), English (EN), Spanish (ES)

## Getting Started

```bash
# Any static server works. Example with Python:
python3 -m http.server 8080 --directory .

# Then open:
# http://localhost:8080
```

No `npm install`, `yarn`, `build` or any setup required. Just serve the file.

## Test Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `sarah@y.uno` | `yuno123` |
| **Merchant** | `debora@q2ingressos.com.br` | `q2123` |

Fields are pre-filled on the login screen. Use the **Administrator / Merchant** toggle to switch roles.

## Features

### Admin View
- **Merchants Table** — search, filters, sorting, resizable columns, inline editing
- **Merchant Detail** — click any merchant to see full info, boards, TAM, and ticket creation
- **Kanban Boards (per merchant)** — Feature Requests, Technical Demand, Projects & Consulting, Implementation
- **TAM — Technical Demands** — CRUD demands per merchant with priority and status tracking
- **General & Specific Goals** — goal boards with Canvas charts (status bars and % achieved)
- **Create Ticket** — create tickets directly into any merchant's Kanban board
- **About (Sobre)** — editable merchant profile with multi-select dropdowns for all fields

### Merchant View
- **Home** — dynamic hero banner (pulls website, countries, providers, integration from About) + 7 status stat cards
- **Kanban Boards** — Feature Requests, Technical Demand, Projects & Consulting, Implementation
- **About (Sobre)** — edit merchant info: name, website, business, communication channels, payment methods, providers, countries, KAM, TAM, integration type, billing types
- **Create Ticket** — submit tickets directly to the correct Kanban board
- **NPS** — satisfaction tracking (coming soon)

### Kanban Board Columns (standardized across all boards)
- Novo → Em Andamento → Aguardando Tech → Aguardando Merchant → Aguardando Provider → Concluído → Standby

### Kanban Features
- **Drag-and-drop cards** (HTML5 native) between columns with Y-position insertion
- **Drag-and-drop columns** — reorder columns by dragging their headers
- **Visual drop indicators** — blue line shows insertion point between cards
- Create, rename, and delete columns
- Create cards with title, description, and priority
- Slide-out detail panel with card info
- Comments with timeline
- "Awaiting merchant" toggle
- Move card via dropdown in detail panel
- Automatic persistence via localStorage
- Shortcut: `Esc` closes the detail panel

### About (Sobre) — Editable Merchant Profile
- **Text fields:** Name, Website, Business
- **Single-select dropdowns:** KAM, TAM (with "add new" option)
- **Multi-select with tags:** Channels, Payment Methods, Providers, Countries, Integration, Billing Types
- Each multi-select allows adding new options and removing existing ones
- Changes persist immediately and reflect across both Admin and Merchant views
- Hero banner on Merchant home dynamically pulls: website, countries, providers, integration

### Shared Data
- Admin and Merchant views share the same board data — tickets created by either side appear on both
- About/Sobre edits are reflected everywhere instantly

## Structure

```
gestao-merchants/
└── index.html    # Complete app (HTML + CSS + JS)
```

## Languages

Switch between PT / EN / ES using the language buttons on the login screen. Translation covers navigation, labels, and UI text.

## Roadmap

- [ ] Backend (API + database)
- [ ] NPS section content
- [ ] Real authentication
- [ ] Multi-tenant (multiple merchants)
