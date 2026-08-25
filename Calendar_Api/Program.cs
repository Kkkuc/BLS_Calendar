using Calendar_Api.Services;
using LigspaceScraper = Calendar_Api.LigspaceScraper;

var builder = WebApplication.CreateBuilder(args);

// Konfiguracja CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "https://bls-calendar.kakuc91.workers.dev",
                "https://*.workers.dev",
                "https://*.pages.dev"
            )
            .SetIsOriginAllowedToAllowWildcardSubdomains()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});


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
app.UseCors("AllowFrontend");
app.Run();

/*
"wystarczy, że zrobisz crona, który będzie pingować backend



ja tak zrobiłem na potrzeby kursu, bo chyba po 10-15 minutach usypia backend"
*/