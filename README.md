# <img src="https://flagcdn.com/24x18/gb.png" width="24" alt="English"> 🏐 BLS Calendar Integrator

A full-stack web application designed for automatic synchronization of **Białystok Volleyball League (BLS)** match schedules with Google Calendar.

The application scrapes real-time team and match data, allows users to select their favorite team, preview match schedules, and export chosen upcoming games directly to their Google Calendar with minimal required scope permissions.

---

## 🚀 Features

* **Real-time Data Scraping** – Automatically fetches live schedules, scores, and team details directly from the BLS Ligspace portal using HtmlAgilityPack.
* **Modern Web Interface** – Responsive React UI built with Vite, featuring Dark/Light mode toggling, team search, persistent selection via `sessionStorage`, and non-blocking background scrolling modal flows.
* **Secure Google Calendar Integration** – Authenticates via Google OAuth 2.0 with minimal required scope (`calendar.events`) to safely export events.
* **Match Preview & Categorization** – Clearly separates upcoming fixtures from played matches.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite, `@react-oauth/google`, Custom CSS Variables (Theme System).
* **Backend:** ASP.NET Core Web API (.NET 10), HtmlAgilityPack, Google.Apis.Calendar.v3.

---

## 💻 Quick Start (Local Development)

### Prerequisites

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/) (v18+ recommended)
* Google OAuth Client ID (Web Application type from Google Cloud Console)

### 1. Backend Setup

```console
cd Calendar_Api
dotnet restore
dotnet run
```

### 2. Frontend Setup
```console
cd client
npm install
npm run dev
```



# <img src="https://flagcdn.com/24x18/pl.png" width="24" alt="Polska"> 🏐 BLS Calendar Integrator

Nowoczesna aplikacja webowa służąca do automatycznej synchronizacji terminarza meczów **Białostockiej Ligi Siatkówki (BLS)** z Google Calendar.

Aplikacja pobiera w czasie rzeczywistym dane o drużynach i meczach, umożliwia wybór ulubionego zespołu, podgląd terminarza oraz bezpośredni eksport wybranych nadchodzących spotkań do Kalendarza Google przy zachowaniu minimalnych wymaganych uprawnień.

---

## 🚀 Funkcje

* **Scrapowanie danych w czasie rzeczywistym** – automatyczne pobieranie aktualnych terminarzy, wyników i szczegółów drużyn bezpośrednio z portalu BLS Ligspace przy użyciu biblioteki HtmlAgilityPack.
* **Nowoczesny interfejs użytkownika** – responsywny UI w React (Vite) z obsługą przełączania motywu ciemnego i jasnego (Dark/Light mode), wyszukiwarką drużyn, zapamiętywaniem wybranego zespołu w `sessionStorage` oraz blokadą przewijania tła pod oknami modalnymi.
* **Bezpieczna integracja z Google Calendar** – autoryzacja przez Google OAuth 2.0 z ograniczeniem do minimalnego wymaganego zakresu uprawnień (`calendar.events`) dla bezpiecznego eksportu wydarzeń.
* **Podgląd i kategoryzacja meczów** – przejrzyste rozdzielenie nadchodzących spotkań od meczów już rozegranych.

---

## 🛠️ Stos Technologiczny

* **Frontend:** React 18, TypeScript, Vite, `@react-oauth/google`, Zmienne CSS (System motywów).
* **Backend:** ASP.NET Core Web API (.NET 10), HtmlAgilityPack, Google.Apis.Calendar.v3.

---

## 💻 Szybki Start (Uruchomienie Lokalne)

### Wymagania wstępne

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* [Node.js](https://nodejs.org/) (zalecana wersja v18+)
* Google OAuth Client ID (typ aplikacji internetowej wygenerowany w Google Cloud Console)

### 1. Konfiguracja Backendu

```console
cd Calendar_Api
dotnet restore
dotnet run
```
### 2. Konfiguracja Frontendu
```console
cd client
npm install
npm run dev
```
