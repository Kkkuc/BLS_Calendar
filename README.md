# 🏐 BLS Calendar Integrator

Aplikacja konsolowa w .NET 10 do automatycznej synchronizacji terminarza meczów **Białostockiej Ligi Siatkówki (BLS)** z Google Calendar.

Pozwala na interaktywny wybór drużyny z listy i automatyczne dodanie nierozegranych spotkań do Twojego kalendarza, unikając przy tym tworzenia dubli czy powtórzonych wydarzeń.

---

## 🚀 Funkcje

* **Scrapowanie danych w czasie rzeczywistym** – pobieranie aktualnej listy drużyn oraz terminarzy meczów z serwisu BLS.
* **Interaktywna konsola** – wygodny wybór drużyny za pomocą strzałek z płynnym przewijaniem (okno 10 elementów).
* **Integracja z Google Calendar API** – automatyczne tworzenie wydarzeń z datą, godziną oraz nazwą rywali.
* **Idempotentność (Brak dubli)** – przed dodaniem wydarzenia aplikacja sprawdza unikalny identyfikator meczu, zapobiegając powielaniu wpisów.

---

## 🛠️ Wymagania

* [.NET 10.0 SDK](https://dotnet.microsoft.com/download)
* Konto Google (do synchronizacji z Google Calendar)
* Plik konfiguracyjny OAuth 2.0 (`credentials.json`)

---

## 🔑 Instrukcja wygenerowania `credentials.json`

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