using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using Autofac;
using Autofac.Integration.Mvc;
using DamageAssessment.Models;
using DTS.Infrastructure.Logging;
using DamageAssessment.Repositories;
using System.Data.Entity;

namespace DamageAssessment
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default", // Route name
                "{controller}/{action}/{id}", // URL with parameters
                new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            );

        }

        static IContainer _container;
        public IContainer Container
        {
            get { return _container; }
        }

        protected void Application_Start()
        {
            //Dependency Injection
            var builder = new ContainerBuilder();
            //register all controllers in this app
            builder.RegisterControllers(typeof(MvcApplication).Assembly);

            //setup the database context to be instance per request
            builder.Register(c => new DamageAssessmentContext()).InstancePerHttpRequest();

            //register the Logger
            builder.RegisterType<NLogLogger>().As<ILogger>().SingleInstance();
            
            builder.RegisterType<LocationRepository>().As<ILocationRepository>().InstancePerHttpRequest();
            builder.RegisterType<DamageLocationRepository>().As<IDamageLocationRepository>().InstancePerHttpRequest();

            _container = builder.Build();

            //setup the resolver as it's used in the membership system to get IMembership
            DependencyResolver.SetResolver(new AutofacDependencyResolver(_container));

            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
            Logger.Info("DA is starting...");

        }

        protected void Application_Error()
        {
            var exception = Server.GetLastError();
            var httpException = exception as HttpException;
            Response.Clear();
            Server.ClearError();
            var routeData = new RouteData();
            routeData.Values["controller"] = "Errors";
            routeData.Values["action"] = "General";
            routeData.Values["exception"] = exception;
            Response.StatusCode = 500;
            if (httpException != null)
            {
                Response.StatusCode = httpException.GetHttpCode();
                switch (Response.StatusCode)
                {
                    case 403:
                        routeData.Values["action"] = "Http403";
                        break;
                    case 404:
                        routeData.Values["action"] = "Http404";
                        break;
                }
            }

            // Clear the error on server.
            Server.ClearError();

            // Avoid IIS7 getting in the middle
            Response.TrySkipIisCustomErrors = true;

            //IController errorsController = new ErrorsController();
            //var rc = new RequestContext(new HttpContextWrapper(Context), routeData);
            Logger.Fatal(exception);
            //errorsController.Execute(rc);
        }

        public static ILogger Logger
        {
            get
            {
                return _container.Resolve<ILogger>();
            }
        }

    }
}