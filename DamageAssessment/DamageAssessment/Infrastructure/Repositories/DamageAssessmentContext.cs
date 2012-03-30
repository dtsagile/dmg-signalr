using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Web;

namespace DamageAssessment.Repositories
{
    public class DamageAssessmentContext : DbContext
    {        
        public DbSet<DamageAssessment.Models.Location> Locations { get; set; }

        public DbSet<DamageAssessment.Models.DamageLocation> DamageLocations { get; set; }
    }
}