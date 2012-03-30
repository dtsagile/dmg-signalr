using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using DamageAssessment.Repositories;

namespace DamageAssessment.Controllers
{
    public class HomeController : Controller
    {
        //
        // GET: /Home/        

        public ActionResult Index()
        {
            //hackety-hack todo: roll in wurfl or something
            if (Request.UserAgent.ToLower().Contains("iphone") || Request.UserAgent.ToLower().Contains("ipad") || Request.UserAgent.ToLower().Contains("android"))
            {
                return View("Map.Mobile");
            }

            return View("Index");
        }
    }
}
