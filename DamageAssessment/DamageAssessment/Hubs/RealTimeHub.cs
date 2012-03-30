using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using SignalR.Hubs;
using System.Threading;
using DamageAssessment.Models;
using DTS.Infrastructure.Logging;
using DamageAssessment.Repositories;

namespace DamageAssessment
{
    /*
     * the voids recieve messages from clients and usually also broadcast messages to clients in response
     * the ones that return object are json endpoints
     */

    /// <summary>
    /// 
    /// </summary>
    public class RealTimeHub:Hub
    {        
        public RealTimeHub()
        {    
            //Can't get the repos here b/c this is created when the app
            //spins up and that borks things up. Get the repos as needed...

            //There is a SignalR.Ninject assembly but I don't know if we can do constructor injection with autofac
            //so we're using private properties with DependencyResolver
        }

        #region private properties

        private ILogger _logger;
        private ILogger Logger
        {
            get
            {
                //not sure how to do constructor injection with AutoFac so we'll use the resolver
                if (_logger == null)
                {
                    _logger = DependencyResolver.Current.GetService<ILogger>();
                }

                return _logger;
            }
        }       

        private IDamageLocationRepository _dmgRepo;
        private IDamageLocationRepository DamageRepo
        {
            get
            {
                //not sure how to do constructor injection with AutoFac so we'll use the resolver
                if (_dmgRepo == null)
                {
                    _dmgRepo = DependencyResolver.Current.GetService<IDamageLocationRepository>();
                }
                return _dmgRepo;
            }
        }

        #endregion

        /// <summary>
        /// Recieves a map extent and broadcasts it to clients
        /// </summary>
        /// <param name="lat"></param>
        /// <param name="lng"></param>
        /// <param name="zoom"></param>
        public void UpdateMapExtent(double lat, double lng, int zoom)
        {
            Logger.Info("UpdateMapExtent called with lat, lng: " + lat + ", " + lng + " and zoom: " + zoom);
            Clients.gotMapExtent(new { lat = lat, lng = lng, zoom = zoom, callerId = Context.ClientId });
        }        
        
        /// <summary>
        /// Gets all map points
        /// </summary>
        /// <returns></returns>
        public object GetMapPoints()
        {
            var mapPoints = DamageRepo.All.ToList().Where(x => x.RecordedAt > DateTime.Now.AddDays(-1)).Select(x => new
            {
                id = x.Id,
                pointType = x.DamageType,
                lat = x.Lat,
                lng = x.Lng
            });
            return mapPoints;
        }

        /// <summary>
        /// Adds damage location to db and pushes it to clients
        /// </summary>
        /// <param name="id"></param>
        /// <param name="lat"></param>
        /// <param name="lng"></param>
        /// <param name="pointType"></param>
        public void AddDamageLocation(double lat, double lng, string pointType)
        {
            Logger.Info("AddDamageLocation called with lat, lng: " + lat + ", " + lng + " and pointType: " + pointType);

            //update user location in SQL Server 
            DamageLocation d = new DamageLocation();
            d.DamageType = pointType;
            d.Lat = lat;
            d.Lng = lng;
            d.RecordedAt = DateTime.Now;
            DamageRepo.InsertOrUpdate(d);
            DamageRepo.Save();

            //push to all users
            Clients.gotNewDamageLocation(new { lat = lat, lng = lng, pointType = pointType });
        }          
    }
}