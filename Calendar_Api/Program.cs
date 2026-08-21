using Calendar_Api.Services;
using Calendar_Core.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Rejestracja IHttpClientFactory dla LigspaceScraper
builder.Services.AddHttpClient<LigspaceScraper>(client =>
{
    client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
});

builder.Services.AddScoped<IGoogleCalendarService, GoogleCalendarService>();
builder.Services.AddScoped<ITeamService, TeamService>();

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();
app.MapControllers();

app.Run();