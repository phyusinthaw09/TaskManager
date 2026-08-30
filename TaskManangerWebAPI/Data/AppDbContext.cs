using Microsoft.EntityFrameworkCore;
using TaskManangerWebAPI.Models;
namespace TaskManangerWebAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }
        public DbSet<TaskItem> Tasks { get; set; }
    }
}
