using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Scalar.AspNetCore;
using TaskManangerWebAPI.Data;
var builder = WebApplication.CreateBuilder(args);
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// မူလ SQL Server သို့မဟုတ် UseSqlServer ရေးထားသည်ကို ခေတ္တ ပိတ်/ပြောင်းပါ
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseInMemoryDatabase("TaskManagerDb"));


// Connection String ကို Environment Variable မှ ယူမည်
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
                       ?? builder.Configuration["ConnectionStrings:DefaultConnection"];

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString)
           .ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning)));
// Npgsql (PostgreSQL) သို့ ပြောင်းမည်
//builder.Services.AddDbContext<AppDbContext>(options =>
//    options.UseNpgsql(connectionString));
// --- CORS Policy ထည့်သွင်းခြင်း (စတင်ရန်) ---
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowNextJS",
//        policy =>
//        {
//            policy.WithOrigins("http://localhost:3000") // Frontend ရဲ့ URL
//                  .AllowAnyHeader()
//                  .AllowAnyMethod();
//        });
//});
//builder.Services.AddCors(options =>
//{
//    options.AddPolicy("AllowNextJS",
//        policy =>
//        {
//            policy.SetIsOriginAllowed(origin => true) // IP ရော localhost ပါ အကုန် ခွင့်ပြုမည်
//                  .AllowAnyHeader()
//                  .AllowAnyMethod();
//        });
//});
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowNextJS",
        policy =>
        {
            policy.WithOrigins(
                    "http://localhost:3000",
                    "https://your-nextjs-app.vercel.app" // 👈 Next.js Deploy လုပ်ပြီးရလာမယ့် Vercel URL ထည့်ရပါမည်
                  )
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});
// --- CORS Policy ထည့်သွင်းခြင်း (အဆုံး) --

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // 👈 Scalar UI ပွင့်လာအောင် ဒါလေး ထည့်ပေးရပါမယ်
}
// --- CORS Middleware ကို သုံးမည် (UseAuthorization ရဲ့ အပေါ်မှာ ထားပေးပါ) ---
app.UseCors("AllowNextJS");
app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

//Startup တွင် Auto-Migration ထည့်ခြင်း

//Neon Cloud DB ထဲမှာ Table တွေ အလိုအလျောက် ဆောက်သွားအောင် Program.cs ၏ app.Run(); မတိုင်မီ အောက်ပါ Code လေး ထည့်ပေးပါ:
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var dbContext = services.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}
app.Run();
