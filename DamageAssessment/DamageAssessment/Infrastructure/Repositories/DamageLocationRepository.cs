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
    public class DamageLocationRepository :RepositoryBase, IDamageLocationRepository
    {
        public DamageLocationRepository(DamageAssessmentContext context)
            : base(context)
        {
           
        }

        public IQueryable<DamageLocation> All
        {
            get { return context.DamageLocations; }
        }

        public IQueryable<DamageLocation> AllIncluding(params Expression<Func<DamageLocation, object>>[] includeProperties)
        {
            IQueryable<DamageLocation> query = context.DamageLocations;
            foreach (var includeProperty in includeProperties) {
                query = query.Include(includeProperty);
            }
            return query;
        }

        public DamageLocation Find(int id)
        {
            return context.DamageLocations.Find(id);
        }

        public void InsertOrUpdate(DamageLocation damagelocation)
        {
            if (damagelocation.Id == default(int)) {
                // New entity
                context.DamageLocations.Add(damagelocation);
            } else {
                // Existing entity
                context.Entry(damagelocation).State = EntityState.Modified;
            }
        }

        public void Delete(int id)
        {
            var damagelocation = context.DamageLocations.Find(id);
            context.DamageLocations.Remove(damagelocation);
        }

        public void Save()
        {
            context.SaveChanges();
        }
    }

    public interface IDamageLocationRepository
    {
        IQueryable<DamageLocation> All { get; }
        IQueryable<DamageLocation> AllIncluding(params Expression<Func<DamageLocation, object>>[] includeProperties);
        DamageLocation Find(int id);
        void InsertOrUpdate(DamageLocation damagelocation);
        void Delete(int id);
        void Save();
    }
}