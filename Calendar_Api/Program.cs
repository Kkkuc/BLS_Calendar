using Calendar_Core;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

// Wyłączamy automatyczne przekierowanie do HTTPS dla lokalnego dev-a
// app.UseHttpsRedirection(); 

// 1. Endpoint zwracający listę drużyn z Calendar_Core
app.MapGet("/api/teams", async () =>
    {
        var teams = await Page.FetchAllTeamsAsync();
        return Results.Ok(teams);
    })
    .WithName("GetTeams");

// 2. Endpoint zwracający mecze danej drużyny
app.MapGet("/api/teams/{id:int}/matches", async (int id) =>
    {
        var url = $"https://blssiatkowka.ligspace.pl/index.php?mod=Teams&ac=TeamSchedule&t_id={id}";
        var page = await Page.CreateAsync(url);
    
        return Results.Ok(page.UnplayedMatches);
    })
    .WithName("GetMatches");

app.Run();