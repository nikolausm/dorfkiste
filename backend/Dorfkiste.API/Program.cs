using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Dorfkiste.Infrastructure.Data;
using Dorfkiste.Core.Interfaces;
using Dorfkiste.Infrastructure.Repositories;
using Dorfkiste.Application.Services;
using static Dorfkiste.Infrastructure.Data.DbSeeder;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000", 
                          "http://localhost:3001", "https://localhost:3001", 
                          "http://localhost:3002", "https://localhost:3002",
                          "http://localhost:3003", "https://localhost:3003",
                          "http://localhost:3004", "https://localhost:3004")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Configure Entity Framework
builder.Services.AddDbContext<DorfkisteDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure JWT Authentication
var jwtSecret = builder.Configuration["Jwt:Secret"]!;
var jwtIssuer = builder.Configuration["Jwt:Issuer"]!;

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtIssuer,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSecret))
        };
    });

// Register repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
builder.Services.AddScoped<IOfferRepository, OfferRepository>();
builder.Services.AddScoped<IOfferPictureRepository, OfferPictureRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IAvailabilityRepository, AvailabilityRepository>();
builder.Services.AddScoped<IRentalContractRepository, RentalContractRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();

// Register services
builder.Services.AddScoped<IEmailService>(provider =>
{
    var logger = provider.GetRequiredService<ILogger<EmailService>>();
    var config = builder.Configuration;
    return new EmailService(
        logger,
        config["Email:SmtpHost"] ?? "smtp.gmail.com",
        int.Parse(config["Email:SmtpPort"] ?? "587"),
        config["Email:SmtpUsername"] ?? "",
        config["Email:SmtpPassword"] ?? "",
        config["Email:FromEmail"] ?? "noreply@dorfkiste.local",
        config["Email:FromName"] ?? "Dorfkiste",
        config["Email:BaseUrl"] ?? "http://localhost:3000"
    );
});
builder.Services.AddScoped<IAuthService>(provider =>
{
    var userRepository = provider.GetRequiredService<IUserRepository>();
    var emailService = provider.GetRequiredService<IEmailService>();
    return new AuthService(userRepository, emailService, jwtSecret, jwtIssuer);
});
builder.Services.AddScoped<IOfferService, OfferService>();
builder.Services.AddScoped<IMessageService, MessageService>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IRentalContractService, RentalContractService>();
builder.Services.AddScoped<IReportService, ReportService>();
builder.Services.AddScoped<ContractPdfGenerator>();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

// Add request logging middleware
app.Use(async (context, next) =>
{
    Console.WriteLine($"🌐 Request: {context.Request.Method} {context.Request.Path}");
    Console.WriteLine($"🌐 Headers: {string.Join(", ", context.Request.Headers.Select(h => $"{h.Key}: {h.Value}"))}");
    await next();
    Console.WriteLine($"🌐 Response: {context.Response.StatusCode}");
});

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// Ensure database is created and seeded
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<DorfkisteDbContext>();
    await DbSeeder.SeedAsync(context);
}

app.Run();
