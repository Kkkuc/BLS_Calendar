namespace Calendar_Core;
using System.Net;
using HtmlAgilityPack;

public class Page
{
    private string _url;
    private HttpClient _client;

    public Page(string url)
    {
        _url = url;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    }

    public async Task GetContent()
    {
        try
        {
            var html = await _client.GetStringAsync(_url);
            var doc = new HtmlDocument();
            doc.LoadHtml(html);

            var rows = doc.DocumentNode.SelectNodes("//tr[count(td)=6]");
            
            foreach (var cells in rows.Select(row => row.SelectNodes("./td")).Where(cells => cells.Count == 6))
            {
                try
                {
                    // 1. Gospodarz : Gość (Indeks 0)
                    var pary = WebUtility.HtmlDecode(cells[0].InnerText).Trim();

                    // 2. Status W/P (Indeks 1)
                    var status = WebUtility.HtmlDecode(cells[1].InnerText).Trim();

                    // 3. Wynik i Data (Indeks 2)
                    // Używamy Replace, aby rozdzielić datę od wyniku, jeśli są w osobnych liniach HTML
                    var wynikIDataRaw = WebUtility.HtmlDecode(cells[2].InnerHtml)
                        .Replace("<br>", "|")
                        .Replace("<br/>", "|");
                    var czesci = wynikIDataRaw.Split('|');
                    var wynik = czesci[0].Trim();
                    var data = czesci.Length > 1 ? czesci[1].Trim() : "Brak daty";

                    // 4. Kolejka / Rozgrywki (Indeks 3)
                    var infoRozgrywki = WebUtility.HtmlDecode(cells[3].InnerText).Trim();

                    // 5. Boisko (Indeks 4)
                    var boisko = WebUtility.HtmlDecode(cells[4].InnerText).Trim();

                    // 6. Link do meczu (Indeks 5)
                    var linkNode = cells[5].SelectSingleNode(".//a");
                    linkNode.GetAttributeValue("href", "");

                    // Wyświetlanie wyników
                    Console.WriteLine($"Mecz: {pary}");
                    Console.WriteLine($"Rozgrywki: {infoRozgrywki} | Status: {status}");
                    Console.WriteLine($"Wynik: {wynik} | Data: {data}");
                    Console.WriteLine($"Miejsce: {boisko}");
                    Console.WriteLine(new string('-', 40));
                }
                catch (Exception)
                {
                    // Pomija wiersze, które mimo 6 kolumn mają nietypową strukturę
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Błąd podczas pobierania danych: {ex.Message}");
        }
    }
}