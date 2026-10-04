# 🛒 AutoCom | Autonomous Spatial Commerce & Agent-to-Agent Micro-Deals

> **Next-Generation Indoor Spatial Micro-Location Commerce Platform & Machine-to-Machine (A2A) Retail Deal Engine**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)

---

## 🌟 Overview

**AutoCom** is an advanced indoor spatial commerce engine designed for real-time proximity marketing, autonomous mall micro-location simulation, and Agent-to-Agent (A2A) deal negotiations. By combining device orientation sensors (gyroscope and compass), grid-aligned indoor positioning systems (IPS), and automated machine-to-machine negotiation protocols, AutoCom delivers targeted contextual offers to consumers as they navigate physical retail spaces.

---

## 🔥 Key Features

### 🧭 1. Indoor Positioning System (IPS) & Mall Simulator (v2.6 GridCorridor)

- **Architectural Passage Grid Navigation**: Simulates realistic human movement along indoor corridors, passages, and concourses rather than unstructured random wandering.
- **In-Store Retail Traversal**: Character approaches store entrances, steps through doorway nodes into shop interiors, dwells/browses for 3 seconds to trigger contextual offers, and exits back out to the main passage.
- **Interactive Map Blueprint**: Rendered via dynamic 2D HTML5 Canvas with resolution matching and DPR scaling up to 2x for high-DPI mobile screens.
- **Parked Offers (`🅿️`)**: Reserve in-store discounts to review or redeem later via an interactive Parked Offers drawer.
- **Shopping Bag (`🛍️`)**: Claimed deals generate instant digital QR vouchers ready for cashier checkout.
- **Direct Point-to-Point Routing**: Select any store from the directory or tap on the map to compute the shortest corridor route directly to that store.

### 🤖 2. Agent-to-Agent (A2A) Machine-to-Machine Commerce Core

- **Automated Bot Negotiations**: Connects consumer autonomous shopping agents with merchant bots (_Muse-ZA_, _Nibble-ZA_, etc.) to negotiate micro-discounts in real-time.
- **Budget Guardrails & Intent Matching**: Enforces strict spending limits, priority categories, and auto-approval thresholds before executing transactions.
- **Cryptographic Receipts**: Issues signed digital vouchers and transaction audit logs for every cleared A2A deal.

### 🧭 3. Spatial Compass HUD & Device Orientation Integration

- **Live Gyroscope & Compass Sensors**: Captures hardware orientation ticks using the `deviceorientation` API.
- **Throttling & Deadband Filtering**: Throttles orientation calculations to 20 FPS with a 1.0° deadband filter to prevent micro-jitter and eliminate CPU saturation on budget mobile chipsets.
- **Cardinal Direction HUD**: Live cardinal heading ($0^\circ - 360^\circ$) displaying the facing store and distance in meters.

### 🃏 4. Interactive Deal Deck & Gesture Controls

- **Swipe & Park Gestures**: Drag cards left to park, right to accept/buy, or upward to return to the deck.
- **Countdown Timers & Haptics**: Real-time offer expiration countdowns accompanied by subtle Web Vibration API feedback.
- **Double-Tap Inspection**: Double-tap any deal card to reveal full product specifications, perks, and terms.

### 🔑 5. WebAuthn Passkey Authentication & Wallet Security

- **Biometric Authentication**: Fast, secure login using device biometric passkeys (Touch ID, Face ID, Android Fingerprint).
- **Local Wallet Storage**: Secure encrypted token storage for wallet balances and active vouchers.

### 📱 6. Progressive Web App (PWA) & Offline Mode

- **Offline Service Worker**: Full offline support with caching strategy via Service Worker (`sw.js`).
- **Web App Manifest**: Installable PWA banner with high-res app icons (`public/manifest.webmanifest`).

---

## 🏬 Simulated Retail Ecosystem

AutoCom includes a pre-configured 8-outlet South African retail mall directory:

| Store Name            | Category    | Primary Offer     | Special Perks                                        |
| :-------------------- | :---------- | :---------------- | :--------------------------------------------------- |
| **Zara Fashion**      | Apparel     | `30% OFF`         | Free Fitting Room Booking, Instant Checkout, Stylist |
| **H&M Boutique**      | Apparel     | `15% OFF`         | Garment Recycling Voucher, Click & Collect           |
| **iStore Apple**      | Electronics | `R8,000 TRADE-IN` | Apple Support Bar, Demo Stations, 0% Financing       |
| **Exclusive Books**   | Leisure     | `2X POINTS`       | Free Wi-Fi Reading Hub, Artisan Coffee Bar           |
| **Mugg & Bean Kiosk** | Cafe        | `FREE MUFFIN`     | Power Outlets, Bottomless Brews, Ultra-Fast Wi-Fi    |
| **Woolworths Food**   | Grocery     | `SAVE R50`        | WRewards Multiplier, Fresh Bakery, Organic Section   |
| **Nike Performance**  | Sportswear  | `20% EXTRA`       | Gait Analysis Treadmill, Nike App Member Rewards     |
| **Clicks Pharmacy**   | Health      | `3-FOR-2`         | Clinic Sister On Duty, ClubCard 3x Points            |

---

## 🛠️ Tech Stack & Architecture

- **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool & Bundler**: [Vite](https://vitejs.dev/) + `@vitejs/plugin-react`
- **Styling & Design System**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphism UI
- **Graphics Engine**: HTML5 Canvas with Dynamic DPR Scaling & GPU Layer Acceleration
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks + High-Frequency Mutable Refs (`useRef`) for 60 FPS animation loops
- **PWA & Offline**: Custom Service Worker + Web App Manifest
- **Auth & Security**: WebAuthn Passkey SDK (`@simplewebauthn/browser`)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (v18.0.0 or higher) and **npm** installed on your machine.

### Installation & Local Setup

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/your-username/livespecial.git
   cd livespecial
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Start the Development Server**:

   ```bash
   npm run dev
   ```

   Open your browser and navigate to `http://localhost:3000`.

4. **Build for Production**:

   ```bash
   npm run build
   ```

5. **Lint & Code Format**:
   ```bash
   npm run lint
   npm run format
   ```

---

## ⚡ Performance & Mobile Web Optimization

AutoCom is heavily optimized for low-end Android and mobile web environments:

1. **Zero React Re-Renders in Animation Loops**: High-frequency coordinates (`mallX`, `mallY`, `heading`) update inside mutable refs (`userMutable`) while standard React state is reserved for low-frequency UI state.
2. **GPU Hardware Acceleration**: Card dragging, gestures, and modals use CSS GPU compositor properties (`will-change: transform`, `transform: translate3d(0,0,0)`).
3. **Canvas Resolution Matching**: The HTML5 Canvas dynamically scales its internal drawing buffer to match physical device pixels (`getBoundingClientRect() * DPR`) clamped to max 2x DPR to avoid excessive VRAM allocation.
4. **Debounced & Throttled Hardware Events**: Device orientation listeners are capped at 20 FPS to protect mobile battery life.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [Issues page](https://github.com/your-username/livespecial/issues).

---

_Crafted with ❤️ for Next-Gen Spatial Micro-Commerce_
