using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;

namespace DamageAssessment.Models
{
    public class Location
    {
        /// <summary>
        /// Id of the record
        /// </summary>
        [Key]
        public int Id { get; set; }
        /// <summary>
        /// Latitude 
        /// </summary>
        public double Lat { get; set; }
        /// <summary>
        /// Longitude
        /// </summary>
        public double Lng { get; set; }

        /// <summary>
        /// Date/Time the location was recorded
        /// </summary>
        public DateTime RecordedAt { get; set; }        
    }
}