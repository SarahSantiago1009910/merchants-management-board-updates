# Merchants Management Board

Yuno's merchant management portal with Kanban boards, technical demand tracking, implementations, goals, NPS surveys, and consolidated overview dashboards.

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

### Admin Sidebar

| Section | Description |
|---------|-------------|
| **Merchants Overview** | Full merchants table with search, filters, sorting, resizable columns, and inline editing |
| **Home** | Dynamic hero banner + 7 status stat cards per merchant |
| **Overview (Visão Geral)** | Consolidated view across all merchants with tabs: Technical Demands, Feature Requests, Projects & Consulting, Implementation. Includes merchant filter, create/edit/delete |
| **Feature Requests** | Kanban board for feature requests |
| **Technical Demand** | Kanban board for technical demands |
| **Projects & Consulting** | Kanban board for projects and consulting |
| **Implementation** | Kanban board for implementations |
| **Merchants** | Merchant cards with full data (integration, countries, providers, payment methods, billing, business type) + demands + goals |
| **About (Sobre)** | Editable merchant profile with multi-select dropdowns |
| **Manage Tickets** | Create tickets with type, title, description, and priority |
| **NPS** | Build custom NPS survey forms (score 0-10, text, checkbox, select fields), send to merchants, view responses with average scores |

### Merchant Sidebar

| Section | Description |
|---------|-------------|
| **Home** | Dynamic hero banner (pulls website, countries, providers, integration from About) + 7 status stat cards |
| **Feature Requests** | Kanban board |
| **Technical Demand** | Kanban board |
| **Projects & Consulting** | Kanban board |
| **Implementation** | Kanban board |
| **About (Sobre)** | Edit merchant info: name, website, business, channels, payment methods, providers, countries, KAM, TAM, integration type, billing types |
| **Create Ticket** | Submit tickets directly to the correct Kanban board |
| **NPS** | View and respond to NPS surveys sent by admin |

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
- Changes persist immediately and reflect across both Admin and Merchant views
- Hero banner on Merchant home dynamically pulls: website, countries, providers, integration

### NPS Survey System
- **Admin:** Create custom NPS forms with dynamic fields (Score 0-10, Free text, Checkbox, Dropdown select)
- **Admin:** Set form title, merchant email, add/remove fields
- **Admin:** Send forms to merchants (simulated email + appears in merchant panel)
- **Admin:** View responses with average NPS score
- **Merchant:** View received NPS forms, respond with score and fields
- **Persistence:** All NPS data saved in localStorage

### Merchant Management
- **Create/Edit/Delete** merchants from multiple locations: Merchants Overview table, Merchants panel, Overview dashboard
- **Edit modal** pre-populates with existing merchant data
- **Merchant filter dropdown** on all admin panels to switch context
- **Full merchant data** displayed on cards: integration type, countries, providers, payment methods, billing types, business type, website

### Shared Data
- Admin and Merchant views share the same board data — tickets created by either side appear on both
- About/Sobre edits are reflected everywhere instantly
- NPS forms created by admin appear in merchant's NPS panel

### Goals (Metas)
- **General Goals** — 3 fixed goals visible across all TAMs with status dropdown
- **Specific Goals per TAM** — filterable table with % achieved (10-100% dropdown) and deadline calendar
- **Canvas charts** (no libraries) — status bars + % achieved bars with green average line

## Structure

```
gestao-merchants/
└── index.html    # Complete app (HTML + CSS + JS)
```

## Data Persistence

All data is stored in `localStorage` under key `yuno_gm_data`:

```json
{
  "merchants": [],
  "demands": {},
  "planos": {},
  "metas": {},
  "metasGerais": [],
  "boards": {},
  "npsForms": []
}
```

## Languages

Switch between PT / EN / ES using the language buttons on the login screen. Translation covers navigation, labels, and UI text.

## Roadmap

- [ ] Backend (API + database)
- [ ] Real authentication
- [ ] Multi-tenant (multiple merchants)
- [ ] Email integration for NPS delivery
