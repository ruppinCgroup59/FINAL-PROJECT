using Mover.BL;
using Microsoft.AspNetCore.Mvc;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ServicesController : ControllerBase
    {


        // קריאת שירות לפני מזהה
        // GET api/SupplierLocations/{serviceId}
        [HttpGet("{serviceId}")]
        public IActionResult GetServiceByserviceId(int serviceId)
        {
            Service s = new Service();
            var Result = s.GetServiceById(serviceId);

            if (Result == null)
            {
                return NotFound();
            }
            return Ok(Result);
        }




        //קריאת בקשות שירות לפי סוג משתמש וזיהוי
        // GET: api/Services/{userId}/{userType}
        [HttpGet("{userId}/{userType}")]
        public IActionResult GetServiceByUserId(string userId, string userType)
        {
            Service s = new Service();
            List<Service> services = null;

            if (userType == "supplier" || userType == "customer")
            {
                services = s.GetServices(userId, userType);
            }

            else
            {
                return BadRequest("Invalid user type"); // Return 400 if user type is invalid
            }

            if (services == null || services.Count == 0)
            {
                return NotFound(); // Return 404 if no services are found
            }

            return Ok(services); // Return the list of services if found
        }




        //קריאת בקשות פעילה עבור לקוח
        // GET: api/active/{customerId}}
        [HttpGet("active/{customerId}")]
        public IActionResult getActiveServices(int customerId)
        {
            Service s = new Service();
            List<Service> services = null;
            services = s.ActiveServices(customerId);
            if (services == null || services.Count == 0)
            {
                return NotFound(); // Return 404 if no services are found
            }
            return Ok(services); // Return the list of services if found
        }



        // פתיחת בקשת שירות חדשה
        [HttpPost]
        public IActionResult InsertService([FromBody] Service service)
        {
            if (service == null)
            {
                return StatusCode(400, new { message = "Invalid service data", status = "error" });
            }

            try
            {
                var rowsAffected = service.Service_Insert(service);

                if (rowsAffected > 0)
                {
                    return Ok(new { message = "Service inserted successfully", status = "success" });
                }
                else
                {
                    return StatusCode(409, new { message = "Failed to insert service", status = "error" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(409, new { message = ex.Message, status = "error" });
            }
        }




        // עדכון מחיר הובלה
        // PUT api/<ServicesController>/5
        [HttpPut("Price")]
        public int Put_Price(int service_Id, float price)
        {
            Service s = new Service();
            int numEffected = s.Update_Price(service_Id, price);
            return numEffected;
        }



        //עדכון סטטוס הבקשה 
        // PUT api/<ServicesController>/5
        [HttpPut("Confirmed")]
        public int Put_Confirmed(int service_Id, int Confirmed)
        {
            Service s = new Service();
            int numEffected = s.Update_Confirmed(service_Id, Confirmed);
            return numEffected;
        }

        

        // עדכון האם ההובלה פעילה או לא
        // PUT api/<ServicesController>/5
        [HttpPut("isActive")]
        public int Put_isActive(int service_Id, bool isActive)
        {
            Service s = new Service();
            int numEffected = s.IsActive_Update(service_Id, isActive);
            return numEffected;
        }



        // עדכון האם ההובלה הסתיימה
        // PUT api/<ServicesController>/5
        [HttpPut("complete")]
        public int Put_Complete(int service_Id, bool complete)
        {
            Service s = new Service();
            int numEffected = s.ServiceComplete_Update(service_Id, complete);
            return numEffected;
        }


    }
}
