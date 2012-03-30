using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using DTS.Infrastructure.Repositories;
using DamageAssessment.Models;

namespace DamageAssessment.Repositories
{ 
    public class LocationRepository :RepositoryBase, ILocationRepository
    {
        public LocationRepository(DamageAssessmentContext context):base(context)
        {
           
        }

        public IQueryable<Location> All
        {
            get { return context.Locations; }
        }

        public IQueryable<Location> AllIncluding(params Expression<Func<Location, object>>[] includeProperties)
        {
            IQueryable<Location> query = context.Locations;
            foreach (var includeProperty in includeProperties) {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public Location Find(int id)
        {
            return context.Locations.Find(id);
        }

        public void InsertOrUpdate(Location location)
        {
            if (location.Id == default(int)) {
                // New entity
                context.Locations.Add(location);
            } else {
                // Existing entity
                context.Entry(location).State = EntityState.Modified;
            }
        }

        public void Delete(int id)
        {
            var location = context.Locations.Find(id);
            context.Locations.Remove(location);
        }

        public void Save()
        {
            context.SaveChanges();
        }
    }

    public interface ILocationRepository
    {
        IQueryable<Location> All { get; }
        IQueryable<Location> AllIncluding(params Expression<Func<Location, object>>[] includeProperties);
        Location Find(int id);
        void InsertOrUpdate(Location location);
        void Delete(int id);
        void Save();
    }
}