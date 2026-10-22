using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

using BabyPlanner.Api.Auth;
using BabyPlanner.Api.Controllers;
using BabyPlanner.Api.Middleware;
using BabyPlanner.Application;
using BabyPlanner.Application.Common.Interfaces;
using BabyPlanner.Infrastructure;
using BabyPlanner.Infrastructure.Persistence;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;

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
builder.Services.AddSwaggerGen(options =>
{
    // Butonul "Authorize" din Swagger UI: lipesti token-ul de la /api/auth/login si
    // toate cererile urmatoare il trimit in header-ul Authorization.
    var bearer = new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" },
    };
    options.AddSecurityDefinition("Bearer", bearer);
    options.AddSecurityRequirement(new OpenApiSecurityRequirement { [bearer] = [] });
});

// Serviciile de business (Application) si persistenta (Infrastructure).
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);

// Autentificarea: cine e parintele care face cererea.
builder.Services.AddOptions<JwtOptions>()
    .Bind(builder.Configuration.GetSection(JwtOptions.SectionName))
    .ValidateDataAnnotations()
    // Fara cheie, mai bine nu pornim deloc decat sa aflam la primul login.
    .ValidateOnStart();

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer();

// Setarile JwtBearer se citesc din JwtOptions abia cand e nevoie de ele, nu aici, la
// pornire: asa testele pot inlocui cheia din configuratie.
builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((bearer, jwt) =>
    {
        // Claim-urile raman cu numele din JWT ("sub"), fara traducerea veche in
        // ClaimTypes.NameIdentifier; HttpCurrentUser citeste direct "sub".
        bearer.MapInboundClaims = false;
        bearer.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = jwt.Value.Issuer,
            ValidAudience = jwt.Value.Audience,
            IssuerSigningKey = JwtTokenGenerator.SigningKey(jwt.Value),
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

// O limita pe IP pentru login si inregistrare; restul API-ului cere oricum un token.
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddPolicy(AuthRateLimit.PolicyName, context =>
        RateLimitPartition.GetFixedWindowLimiter(
            context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = AuthRateLimit.PermitsPerMinute,
                Window = TimeSpan.FromMinutes(1),
            }));
});

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
    // Aducem baza la zi si o populam inainte de a accepta cereri, ca un "git clone"
    // urmat de "dotnet run" sa fie suficient — fara "dotnet ef database update" manual.
    await app.Services.InitializeDatabaseAsync();

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors(AngularCorsPolicy);

app.UseRateLimiter();

// Intai "cine esti" (citeste token-ul), apoi "ai voie" (cere un token valid).
app.UseAuthentication();
app.UseAuthorization();

// Toate endpoint-urile cer un parinte logat, in afara de cele marcate [AllowAnonymous]
// (login, inregistrare). Implicit inchis: un controller nou nu poate fi uitat deschis.
app.MapControllers().RequireAuthorization();

app.Run();

// Vizibil pentru WebApplicationFactory<Program> din testele de integrare.
public partial class Program;
