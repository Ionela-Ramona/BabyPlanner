using System.Text.Json.Serialization;

using BabyPlanner.Api.Middleware;
using BabyPlanner.Application;
using BabyPlanner.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

const string AngularCorsPolicy = "AngularClient";

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Tipurile de activitate circula ca text ("Feeding"), nu ca numere —
        // mai usor de citit in Angular si in Swagger.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Serviciile de business (Application) si persistenta (Infrastructure).
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);

// Browserul blocheaza apelurile din aplicatia Angular daca originea ei nu e permisa explicit.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200"];

builder.Services.AddCors(options =>
    options.AddPolicy(AngularCorsPolicy, policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()));

var app = builder.Build();

// Tratarea erorilor sta prima in pipeline, ca sa prinda tot ce urmeaza dupa ea.
app.UseMiddleware<ExceptionHandlingMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(AngularCorsPolicy);

app.UseAuthorization();

app.MapControllers();

app.Run();
