# <img src="https://flagcdn.com/24x18/gb.png" width="24" alt="English"> 🏐 BLS Calendar Integrator
A .NET 10 console application for automatic synchronization of the **Białystok Volleyball League (BLS)** match schedule with Google Calendar.

It allows for interactive team selection from a list and automatically adds unplayed matches to your calendar while preventing duplicate events.

---

## 🚀 Features

* **Real-time Data Scraping** – Fetching the latest list of teams and match schedules directly from the BLS portal.
* <span style="background-color: #fc031c; color: #000000; padding: 2px 4px; border-radius: 3px;">***Currently***</span> **Interactive Console UI** – Convenient team selection using arrow keys with smooth scrolling (10-item viewport).
* **Google Calendar API Integration** – Automated creation of events with date, time, and opponent details.
* **Idempotency (No Duplicates)** – Before adding an event, the application checks the unique match ID to prevent duplicate entries.

---

## 🛠️ Requirements

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* A Google Account (for syncing with Google Calendar)
* OAuth 2.0 configuration file (`credentials.json`)

---

## 🔑 Guide: Generating `credentials.json`

For the application to securely send matches to your Google Calendar, you need to create free OAuth 2.0 access credentials in the Google Cloud Console.

1. **Create a project in Google Cloud Console**:
   * Go to [Google Cloud Console](https://console.cloud.google.com/).
   * Sign in with your Google account.
   * Click the project dropdown list at the top and select **New Project**.
   * Enter a project name (e.g., `blscalendar`) and click **Create**.

2. **Enable the Google Calendar API**:
   * In the left menu, select **APIs & Services** > **Library**.
   * In the search bar, type `Google Calendar API`.
   * Click on the service and press **Enable**.

3. **Configure the OAuth Consent Screen**:
   * Go to **APIs & Services** > **OAuth consent screen**.
   * Select user type **External** and click **Create**.
   * Fill in the basic fields (App name, support email).
   * In the **Test users** section, add your Google email address (the one you use for your calendar).
   * Save changes.

4. **Generate Credentials**:
   * Go to **APIs & Services** > **Credentials**.
   * Click **+ CREATE CREDENTIALS** at the top and select **OAuth client ID**.
   * Select **Desktop app** as the Application type.
   * Enter any name (e.g., `BLS Calendar CLI`) and click **Create**.

5. **Download `credentials.json`**:
   * Once created, a summary popup will appear. Click **DOWNLOAD JSON**.
   * Rename the downloaded file to `credentials.json`.
   * Place the `credentials.json` file in the root directory of the `Calendar_CLI` project (where the `.csproj` file is located or in `bin/Debug/net10.0/`).

---

## 📄 Structure of `credentials.json`

Your file should follow this format:

```json
{
   "installed": {
      "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
      "project_id": "blscalendar",
      "auth_uri": "[https://accounts.google.com/o/oauth2/auth](https://accounts.google.com/o/oauth2/auth)",
      "token_uri": "[https://oauth2.googleapis.com/token](https://oauth2.googleapis.com/token)",
      "auth_provider_x509_cert_url": "[https://www.googleapis.com/oauth2/v1/certs](https://www.googleapis.com/oauth2/v1/certs)",
      "client_secret": "YOUR_CLIENT_SECRET",
      "redirect_uris": [
         "http://localhost"
      ]
   }
}
```

## 💻 How to run

1. **Clone the repository and navigate to the project directory**:
```console
git clone [https://github.com/twoj-login/BLS_Calendar.git](https://github.com/twoj-login/BLS_Calendar.git)
cd BLS_Calendar/Calendar_CLI
```
2. **Ensure `credentials.json` is located in the project directory.**
3. **Run the application**:
```console
dotnet run
```



# <img src="https://flagcdn.com/24x18/pl.png" width="24" alt="Polska"> 🏐 BLS Calendar Integrator

Aplikacja konsolowa w .NET 10 do automatycznej synchronizacji terminarza meczów **Białostockiej Ligi Siatkówki (BLS)** z Google Calendar.

Pozwala na interaktywny wybór drużyny z listy i automatyczne dodanie nierozegranych spotkań do Twojego kalendarza, unikając przy tym tworzenia dubli czy powtórzonych wydarzeń.

---

## 🚀 Funkcje

* **Scrapowanie danych w czasie rzeczywistym** – pobieranie aktualnej listy drużyn oraz terminarzy meczów z serwisu BLS.
* <span style="background-color: #fc031c; color: #000000; padding: 2px 4px; border-radius: 3px;">***Chwilowo***</span> **Interaktywna konsola** – wygodny wybór drużyny za pomocą strzałek z płynnym przewijaniem (okno 10 elementów). 
* **Integracja z Google Calendar API** – automatyczne tworzenie wydarzeń z datą, godziną oraz nazwą rywali.
* **Idempotentność (Brak dubli)** – przed dodaniem wydarzenia aplikacja sprawdza unikalny identyfikator meczu, zapobiegając powielaniu wpisów.

---

## 🛠️ Wymagania

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* Konto Google (do synchronizacji z Google Calendar)
* Plik konfiguracyjny OAuth 2.0 (`credentials.json`)

---

## 🔑 Instrukcja wygenerowania `credentials.json` Chat Wygenerował

Aby aplikacja mogła bezpiecznie wysyłać mecze do Twojego Kalendarza Google, musisz utworzyć darmowe dane dostępowe OAuth 2.0 w konsoli Google Cloud.

1. **Utwórz projekt w Google Cloud Console**:
   * Wejdź na stronę [Google Cloud Console](https://console.cloud.google.com/).
   * Zaloguj się na swoje konto Google.
   * Kliknij rozwijaną listę projektów na samej górze i wybierz **New Project** (Nowy projekt).
   * Wpisz nazwę projektu (np. `blscalendar`) i kliknij **Create**.

2. **Włącz Google Calendar API**:
   * W lewym menu wybierz **APIs & Services** > **Library**.
   * W wyszukiwarce wpisz `Google Calendar API`.
   * Kliknij w odnalezioną usługę i naciśnij button **Enable** (Włącz).

3. **Skonfiguruj ekran zgody OAuth (OAuth Consent Screen)**:
   * Przejdź do **APIs & Services** > **OAuth consent screen**.
   * Wybierz typ użytkownika **External** (Zewnętrzny) i kliknij **Create**.
   * Wypełnij podstawowe pola (Nazwa aplikacji, email kontaktowy).
   * W sekcji **Test users** dodaj swój adres email Google (ten, na którym używasz kalendarza).
   * Zapisz zmiany.

4. **Wygeneruj poświadczenia (Credentials)**:
   * Przejdź do zakładki **APIs & Services** > **Credentials**.
   * Kliknij **+ CREATE CREDENTIALS** u góry ekranu i wybierz **OAuth client ID**.
   * Jako *Application type* wybierz **Desktop app** (Aplikacja desktopowa).
   * Nadaj dowolną nazwę (np. `BLS Calendar CLI`) i kliknij **Create**.

5. **Pobierz plik `credentials.json`**:
   * Po utworzeniu klucza pojawi się okno z podsumowaniem. Kliknij **DOWNLOAD JSON**.
   * Zmień nazwę pobranego pliku na `credentials.json`.
   * Umieść plik `credentials.json` w katalogu uruchomieniowym projektu `Calendar_CLI` (tam, gdzie znajduje się plik `.csproj` lub w `bin/Debug/net10.0/`).

---

## 📄 Struktura pliku `credentials.json`

Twój plik powinien mieć następujący format:

```json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "blscalendar",
    "auth_uri": "[https://accounts.google.com/o/oauth2/auth](https://accounts.google.com/o/oauth2/auth)",
    "token_uri": "[https://oauth2.googleapis.com/token](https://oauth2.googleapis.com/token)",
    "auth_provider_x509_cert_url": "[https://www.googleapis.com/oauth2/v1/certs](https://www.googleapis.com/oauth2/v1/certs)",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": [
      "http://localhost"
    ]
  }
}

```
---

## 💻 Uruchomienie

1. **Sklonuj repozytorium i przejdź do folderu projektu**:
```console
git clone [https://github.com/twoj-login/BLS_Calendar.git](https://github.com/twoj-login/BLS_Calendar.git)
cd BLS_Calendar/Calendar_CLI
```
2. **Upewnij się, że plik `credentials.json` znajduje się w katalogu projektu.**
3. **Uruchom aplikację**:
```console
dotnet run
```