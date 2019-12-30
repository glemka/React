using Microsoft.EntityFrameworkCore;

namespace Persistence
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {            
        }

        public DbSet<Domain.Value> Values { get; set; }

        protected override void OnModelCreating(ModelBuilder builder){
                builder.Entity<Domain.Value>()
                .HasData(
                    new Domain.Value{ Id = 1, Name = "Value 1"},
                    new Domain.Value{ Id = 2, Name = "Value 2"},
                    new Domain.Value{ Id = 3, Name = "Value 3"},
                    new Domain.Value{ Id = 4, Name = "Value 4"}
                );
        }
    }

}
