# CottonYield AI UI Design Guide

This document captures the design system used in the frontend copied into this repository. The goal is to preserve the original visual style of the CottonYield AI web app without breaking the existing UI.

## Design foundation

### Core font
- Font family: Inter
- Source: `@fontsource/inter`
- Weights used: 400, 500, 600, 700, 800
- Global styling is applied in `src/index.css`
- Use: `font-variant-numeric: tabular-nums;` for metrics and numbers

### Base color palette

| Token | Hex | Usage |
| --- | --- | --- |
| Primary green | `#3B6D11` | Main CTA, active states, key actions |
| Secondary green | `#639922` | Gradient end color, chart highlights |
| Primary light | `#EAF3DE` | Soft green panels, pills, selected cards |
| Deep teal | `#0F6E56` | Secondary accent, success states |
| Teal highlight | `#1D9E75` | Some gradient/secondary UI accents |
| Ink / dark text | `#1A1A1A` | Main typography |
| Muted text | `#888780` | Secondary text, labels |
| Surface background | `#F5F5F3` | App background |
| Border / line | `#E5E5E3` | Forms, cards, dividers |
| White | `#FFFFFF` | Cards, panel surfaces |
| Danger | `#A32D2D` | Error states |
| Danger soft | `#FCEBEB` | Error backgrounds |

### Common styles
- Background: warm neutral with green accents (`#F5F5F3`)
- Cards: white with rounded corners and subtle shadow
- Buttons: green gradient, rounded edges, slight lift on hover
- Shadows: soft warm shadow for cards and buttons
- Border radius: mostly `12px` to `24px` depending on component

## Component-by-component design spec

### 1. Global shell and app layout
#### `AppLayout.jsx`
- Background: `#F5F5F3`
- Sidebar background: white
- Border: `#E5E5E3`
- Mobile top bar: white, border-bottom soft shadow
- Main text: `#1A1A1A`
- Accent for active nav items: `#EAF3DE` + `#3B6D11`
- Typography: Inter, `font-semibold`, `font-bold`

#### `Sidebar.jsx`
- Active nav item background: `#EAF3DE`
- Active icon/text: `#3B6D11`
- Inactive icon/text: `#888780`
- Sidebar avatar ring: green gradient
- Logout button text: `#A32D2D`
- Use vertical divider borders with `#E5E5E3`

### 2. Buttons
#### `Button.jsx`
- `primary`: green gradient background (`#3B6D11` → `#639922`)
- `secondary`: `#EAF3DE` with dark green text
- `outline`: white background with green border
- `danger`: `#A32D2D`
- Border radius: `12px`
- Text: Inter, weight 600/700
- Hover: subtle scale and shadow enhancement

### 3. Input fields
#### `Input.jsx`
- Field background: white
- Border: `#E5E5E3`
- Focus border: `#3B6D11`
- Placeholder text: `#888780`
- Label text: `#1A1A1A`, weight 600
- Error border: `#A32D2D`
- Error text: `#A32D2D`

### 4. Cards
#### `Card.jsx`
- Background: white
- Border: `#E5E5E3`
- Shadow: soft warm shadow
- Accent mode: green border `#3B6D11` / `#639922`
- Radius: `16px` to `24px`
- Hover: slight lift with stronger shadow

### 5. Splash screen
#### `SplashPage.jsx`
- Entire screen background: green gradient (`#3B6D11` → `#639922`)
- Main title: white, large bold typography
- Supporting text: white with 60% opacity
- Loader dots: white with opacity animation
- Icon background: semi-transparent white

### 6. Login / Signup / Forgot pages
#### `LoginPage.jsx`, `SignupPage.jsx`, `ForgotPage.jsx`
- Page background: `#F5F5F3`
- Left hero panel: green gradient background (`#3B6D11` → `#639922`)
- Hero text: white
- CTA buttons: green gradient with rounded corners
- Success banner: soft green / teal backgrounds
- Error messages: soft red background with danger text
- Typography: Inter, heading weight 800, supporting text weight 500

### 7. Home dashboard
#### `HomePage.jsx`
- Header text: `#1A1A1A`
- Hero card: green gradient with white content
- KPI cards: white cards with green/neutral highlights
- Chart colors: bars use green shades (`#3B6D11`, `#639922`)
- Muted labels: `#888780`
- CTA link to prediction page: light green bordered panel with primary text

### 8. Predict page
#### `PredictPage.jsx`
- Page background: `#F5F5F3`
- Step cards: white background with green accent when selected
- Selected step badge: light green + dark green text
- Grid buttons: white/green border states
- Primary button: green gradient
- Result card accent: grade-based color with green, orange, or red
- Text colors: `#1A1A1A`, `#888780`, `#3B6D11`

### 9. Analytics page
#### `AnalyticsPage.jsx`
- Uses green chart palette: `#3B6D11`, `#4D8E18`, `#639922`
- Pie chart segments use green and neutral tones
- Card background: white
- Info panel background: very light green (`#EAF3DE`)
- Metrics and model labels: Inter, bold tabular-styled numbers

### 10. Varieties page
#### `VarietiesPage.jsx`
- Variety pills: green gradient when selected, white otherwise
- Bar chart uses green shades from dark to light
- Warning callout: soft green background with primary text
- Ranking bars: green fill with slightly different tones for selected items
- Summary cards: white with subtle green accent borders

### 11. Profile page
#### `ProfilePage.jsx`
- User avatar ring: green gradient
- Research summary cards: white with thin border
- Key-value rows: light divider line in `#E5E5E3`
- Menu buttons: neutral hover background, red background for logout
- Text hierarchy: dark ink + muted labels + green accent for key values

## Typography hierarchy

### Headings
- H1/H2/H3: Inter, weight 700–800
- Tracking: slightly tight for product-like headings
- Line-height: comfortable and modern

### Body text
- Main copy: Inter 400–500
- Secondary labels: Inter 500/600
- Numbers: `font-variant-numeric: tabular-nums`

## Shadow and depth
- Main shadow style: `box-shadow: 0 1px 3px rgba(59,109,17,0.08), 0 4px 12px rgba(59,109,17,0.06);`
- Larger shadow: `box-shadow: 0 4px 16px rgba(59,109,17,0.12), 0 1px 4px rgba(59,109,17,0.08);`
- Use for cards, selected states, and action components

## Recommended implementation notes
- Keep Inter as the single primary typeface everywhere.
- Preserve the green brand palette consistently across cards, navigation, charts, and CTAs.
- Maintain soft, neutral backgrounds to keep the UI calm and readable.
- Use green accents for product trust and agricultural context without overusing bright colors.

## Summary of the official visual style
This project uses a clean, modern agricultural-tech aesthetic:
- warm neutral background
- strong green brand system
- minimal but readable card-based layout
- rounded shapes and soft shadows
- bold headings and structured data panels
- metrics and charts styled with tabular numbers for clarity
