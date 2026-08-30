using Microsoft.EntityFrameworkCore;
using TaskManangerWebAPI.Data;
using Scalar.AspNetCore;
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

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

app.Run();
