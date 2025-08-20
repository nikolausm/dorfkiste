using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace DorfkisteBlazor.Infrastructure.Data;

/// <summary>
/// Design-time factory for ApplicationDbContext used by EF migrations
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Use SQLite for design-time migrations
        optionsBuilder.UseSqlite("Data Source=dorfkiste-dev.db");
        
        return new ApplicationDbContext(optionsBuilder.Options);
    }
}