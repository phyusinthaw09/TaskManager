using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Scalar.AspNetCore;
using TaskManangerWebAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Connection String ကို Environment Variable မှ ယူမည်
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));

// --- CORS Policy ထည့်သွင်းခြင်း (Allow All Domain) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        policy =>
        {
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
builder.Services.AddOpenApi();

var app = builder.Build();

// ⚠️ အရေးကြီး: Middleware Pipeline Order
// CORS ကို HTTP Redirection မတိုင်မီ တန်းသုံးရပါမည်
app.UseCors("AllowAll");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

// Database EnsureCreated
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        dbContext.Database.EnsureCreated();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while creating the database tables.");
    }
}

app.Run();