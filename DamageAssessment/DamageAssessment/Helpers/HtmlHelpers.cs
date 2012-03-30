using System.Text;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.Mvc.Html;
using System.Configuration;
using System.Collections.Generic;
using System.IO;



namespace System.Web.Mvc {
    public static partial class HtmlHelpers
    {
        // TODO: Need to debug this route issue; having to force the app folder for apps listed under a virtual directory
        const string pubDir="public";
        const string cssDir="css";
        const string imageDir="images";
        const string scriptDir="javascript";                 

        public static HtmlString Analytics(this HtmlHelper htmlHelper, string urchin, string domainName)
        {
            StringBuilder sb = new StringBuilder();

            sb.Append("<script type='text/javascript'>");
            sb.Append("  var _gaq = _gaq || [];");
            sb.Append(" _gaq.push(['_setAccount', '" + urchin + "']);");
            sb.Append(" _gaq.push(['_setDomainName', '" + domainName + "']);");
            sb.Append(" _gaq.push(['_trackPageview']);");
            sb.Append("  (function() {");
            sb.Append("   var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;");
            sb.Append("    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';");
            sb.Append("   var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);");
            sb.Append("  })();");
            sb.Append("</script>");

            return new HtmlString(sb.ToString());
        }

        public static HtmlString Analytics(this HtmlHelper htmlHelper)
        {
            //pull values from Config
            string urchin = ConfigurationManager.AppSettings["ga-urchin"];
            string domainName = ConfigurationManager.AppSettings["ga-domainName"];
            return Analytics(htmlHelper, urchin, domainName);
        }

        private static string GetPublicUrl(this HtmlHelper helper)
        {
            var urlHelper = new UrlHelper(helper.ViewContext.RequestContext);
            string appUrl = urlHelper.Content("~/");
            return appUrl + pubDir;         
        }

        public static HtmlString Script(this HtmlHelper helper, string debugFilename, string releaseFilename)
        {
            var fileName = (helper.ViewContext.HttpContext.IsDebuggingEnabled) ? debugFilename : releaseFilename;
            return helper.Script(fileName);
        }

        public static HtmlString Script(this HtmlHelper helper, string fileName)
        {
            if (!fileName.EndsWith(".js"))
                fileName += ".js";
            var jsPath = string.Format("<script src='{0}/{1}/{2}' ></script>\n", GetPublicUrl(helper), scriptDir, helper.AttributeEncode(fileName));
            return new HtmlString(jsPath);
        }

        public static HtmlString CSS(this HtmlHelper helper, string fileName)
        {
            return CSS(helper, fileName, "screen");
        }

        public static HtmlString CSS(this HtmlHelper helper, string fileName, string media)
        {
            if (!fileName.EndsWith(".css"))
                fileName += ".css";
            var jsPath = string.Format("<link rel='stylesheet' type='text/css' href='{0}/{1}/{2}'  media='" + media + "'/>\n", GetPublicUrl(helper),  cssDir, helper.AttributeEncode(fileName));
            return new HtmlString(jsPath);
        }

        public static HtmlString Image(this HtmlHelper helper, string fileName)
        {
            return Image(helper, fileName, "");
        }

        public static HtmlString Image(this HtmlHelper helper, string fileName, string attributes)
        {
            fileName = string.Format("{0}/{1}/{2}", GetPublicUrl(helper),  imageDir, fileName);
            return new HtmlString(string.Format("<img src='{0}' {1} />", helper.AttributeEncode(fileName), helper.AttributeEncode(attributes)));
        }                     
    }
}