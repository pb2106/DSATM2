# Intelligent Carbon Emission Management System (Frontend)

A modern **Expo React Native** application that helps organizations **monitor, visualize, and forecast** their carbon emissions.  
This repository contains **only the frontend**, built with clean design, mock data, and interactive charts — ideal for hackathons or demo presentations.

---

##  Overview

The **Intelligent Carbon Emission Management System (ICEMS)** is designed to give organizations visibility into their environmental impact.  
It features dashboards, analytics, and visualization tools for tracking emissions and predicting future trends.

---

##  Features

- 📊 **Interactive Dashboard** — Total emissions, reduction percentage, forecast charts  
- 📈 **Analytics View** — Deep-dive visualizations (trend lines, predictions)  
- 🧾 **Emission Logs** — Scrollable history with quick-add modal  
- ➕ **Add Entry Form** — Input emission details with validation  
- 👤 **Profile & Settings** — Manage preferences, themes, and dummy logout  
- 🌗 **Dark/Light Mode** — Smooth animated theme transitions  
- 🧮 **Mock Data Integration** — Works completely offline  

---

## 🛠️ Tech Stack

| Category | Technology |
|-----------|-------------|
| Framework | [Expo SDK 51+](https://expo.dev) |
| UI Library | React Native, React Native Paper, Tailwind (via `nativewind`) |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| Charts | Victory Native |
| Animations | React Native Reanimated 3, Framer Motion |
| Icons | Lucide React Native / Expo Vector Icons |

---

## 📁 Folder Structure

```

📦 ICEMS-Frontend
┣ 📂 assets/           # Images, logos, icons
┣ 📂 components/       # Reusable UI components (cards, charts, buttons)
┣ 📂 screens/
┃ ┣ 📜 DashboardScreen.js
┃ ┣ 📜 AnalyticsScreen.js
┃ ┣ 📜 EmissionLogsScreen.js
┃ ┣ 📜 AddEntryScreen.js
┃ ┗ 📜 ProfileScreen.js
┣ 📂 data/
┃ ┗ 📜 mockData.js     # Static emission dataset
┣ 📜 App.js            # Main app entry with navigation setup
┣ 📜 app.json
┣ 📜 package.json
┗ 📜 README.md

```

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/ICEMS-Frontend.git
   cd ICEMS-Frontend
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the project**

   ```bash
   npx expo start
   ```

   Scan the QR code using **Expo Go** (on Android/iOS) to view the app.

---

## 📊 Mock Data Example

```js
// data/mockData.js
export const emissions = [
  { id: 1, source: "Transport", amount: 45, date: "2025-10-01" },
  { id: 2, source: "Electricity", amount: 30, date: "2025-10-02" },
  { id: 3, source: "Waste", amount: 15, date: "2025-10-03" },
];
```

---

## 🧩 Screens Preview (Concept)

* **Dashboard:** Overview cards + line/pie charts
* **Analytics:** Forecast graph + detailed trends
* **Emission Logs:** List of emissions + Add Entry modal
* **Profile:** Theme toggle, org info, logout

---

## 💚 Hackathon Notes

* Focused on **UI/UX, interactivity, and smooth animations**
* Uses **mock data** — no backend required
* Perfect for integration later with a Flask, Django, or FastAPI backend
* Code is modular and ready for scaling into a full-stack solution

---

## 🧑‍💻 Contributing

Pull requests are welcome!
If you find UI bugs or performance issues, open an issue or submit a PR.

---

## 📄 License

This project is licensed under the **MIT License**.
Feel free to use and modify for educational or hackathon purposes.
