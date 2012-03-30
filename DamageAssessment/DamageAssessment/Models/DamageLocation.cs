using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace DamageAssessment.Models
{
    public class DamageLocation:Location
    {
        /// <summary>
        /// Type of damage
        /// </summary>
        public string DamageType { get; set; }        
    }
}