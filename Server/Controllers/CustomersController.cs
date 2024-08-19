using Mover.BL;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Specialized;


namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomersController : ControllerBase
    {


        // קריאת כל הלקוחות
        // GET: api/<CustomersController>
        [HttpGet]
        public IEnumerable<Customer> Get()
        {
            Customer c = new Customer();
            return c.ReadCustomers();
        }


        //רישום לקוח
        [HttpPost("register")]
        public IActionResult RegisterCustomer([FromBody] Customer c)
        {
            if (c == null)
            {
                return StatusCode(400, new { message = "Invalid customer data", status = "error" });
            }

            var insertionResult = c.Insert();
            switch (insertionResult)
            {
                case Customer.InsertError.InvalidId:
                    return StatusCode(409, new { message = "Invalid Id", status = "error" });

                case Customer.InsertError.DuplicateId:
                    return StatusCode(409, new { message = "Id already exists", status = "error" });

                case Customer.InsertError.DuplicateEmail:
                    return StatusCode(409, new { message = "Email already exists", status = "error" });

                case Customer.InsertError.DuplicateUsername:
                    return StatusCode(409, new { message = "Username already exists", status = "error" });


                case Customer.InsertError.None:
                    return Ok(new { message = "Customer created successfully", status = "success" });

                default:
                    return StatusCode(500, new { message = "An unexpected error occurred", status = "error" });
            }
        }



        //עדכון פרטי לקוח
        // PUT api/<CustomersController>/5
        [HttpPut("{Username}")]
        public int Put(int id, [FromBody] Customer c)
        {
            int numEffected = c.Customer_Update();
            return numEffected;
        }



        //מחיקת לקוח
        // DELETE api/<CustomersController>/5
        [HttpDelete("{Username}")]
        public IActionResult Delete(string Username)
        {
            Customer c = new Customer();
            c.Customer_Delete(Username);
            return Ok(Username);
        }


    }

}
