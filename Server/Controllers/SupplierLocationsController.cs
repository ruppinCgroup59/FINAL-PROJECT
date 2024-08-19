using Mover.BL;
using Microsoft.AspNetCore.Mvc;

namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SupplierLocationsController : ControllerBase
    {

        // עדכון המיקום של המוביל
        // PUT api/SupplierLocations
        [HttpPut]
        public IActionResult UpdateSupplierLocation([FromBody] SupplierLocation sl)
        {
            if (sl == null)
            {
                return StatusCode(400, new { message = "Invalid supplier location data", status = "error" });
            }

            var insertionResult = sl.UpdateSupplierLocation();
            switch (insertionResult)
            {
                case SupplierLocation.InsertError.None:
                    return Ok(new { message = "Supplier location updated successfully", status = "success" });

                default:
                    return StatusCode(500, new { message = "An unexpected error occurred", status = "error" });
            }
        }



        // קריאת המיקום של המוביל
        // GET api/SupplierLocations/{serviceId}
        [HttpGet("{serviceId}")]
        public IActionResult GetSupplierLocation(int serviceId)
        {
            SupplierLocation sl = new SupplierLocation();
            var Result = sl.GetSupplierLocation(serviceId);

            if (Result == null)
            {
                return NotFound(); 
            }
            return Ok(Result); 
        }



        // מחיקת מיקום מוביל
        // DELETE api/SupplierLocations/{serviceId}
        [HttpDelete("{serviceId}")]
        public IActionResult Delete(int serviceId)
        {
            SupplierLocation sl = new SupplierLocation();
            sl.Supplier_Location_Delete(serviceId);
            return Ok(serviceId);
        }

    }
}
