using Mover.BL;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Specialized;
using static Mover.Controllers.CustomersController;
using System.Globalization;


namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SuppliersController : ControllerBase
    {


        // קריאת כל הספקים 
        // GET api/<SuppliersController>
        [HttpGet]
        public IEnumerable<Supplier> Get()
        {
            Supplier s = new Supplier();
            return s.ReadSuppliers();
        }



        //קריאת ספק לפי שם משתמש
        // GET api/<SuppliersController>/username
        [HttpGet("{username}")]
        public IActionResult GetSupplierByUsername(string username)
        {
            Supplier s = new Supplier();
            var suppliers = s.GetSupplierByUsername(username);

            if (suppliers == null || suppliers.Count == 0)
            {
                return NotFound(); // Return 404 if no suppliers with the specified username are found
            }

            return Ok(suppliers); // Return the list of suppliers if found
        }



        //רישום ספק
        // POST api/<SuppliersController>
        [HttpPost("register")]
        public IActionResult RegisterSupplier([FromBody] Supplier s)
        {
            if (s == null)
            {
                return StatusCode(400, new { message = "Invalid supplier data", status = "error" });
            }

            var insertionResult = s.Insert();
            switch (insertionResult)
            {
                case Supplier.InsertError.InvalidId:
                    return StatusCode(409, new { message = "Invalid Id", status = "error" });

                case Supplier.InsertError.DuplicateId:
                    return StatusCode(409, new { message = "Id already exists", status = "error" });

                case Supplier.InsertError.DuplicateEmail:
                    return StatusCode(409, new { message = "Email already exists", status = "error" });

                case Supplier.InsertError.DuplicateUsername:
                    return StatusCode(409, new { message = "Username already exists", status = "error" });

                case Supplier.InsertError.None:
                    return Ok(new { message = "Supplier created successfully", status = "success" });

                default:
                    return StatusCode(500, new { message = "An unexpected error occurred", status = "error" });
            }
        }




        //עדכון פרטים של ספק
        // PUT api/<SuppliersController>/5
        [HttpPut("Edit")]
        public IActionResult Put(string username, [FromBody] Supplier s)
        {
            if (s == null)
            {
                return StatusCode(400, new { message = "Invalid supplier data", status = "error" });
            }

            var insertionResult = s.Supplier_Update();
            switch (insertionResult)
            {
                case Supplier.InsertError.None:
                    return Ok(new { message = "The supplier details have been successfully updated", status = "success" });

                default:
                    return StatusCode(500, new { message = "An unexpected error occurred", status = "error" });
            }
        }




        //מחיקת ספק
        // DELETE api/<SuppliersController>/5
        [HttpDelete("{Username}")]
        public IActionResult Delete(string Username)
        {
            Supplier s = new Supplier();
            s.Supplier_Delete(Username);
            return Ok(Username);
        }



        // הוספת תאריך חסום לספק
        // POST api/Suppliers/{username}/blockedate
        [HttpPost("{username}/blockedate")]
        public IActionResult AddBlockedDate(string username, [FromBody] DateTime blockedate)
        {
            Supplier s = new Supplier();
            int success = s.AddBlockedate(username, blockedate);

            if (success == 0)
            {
                return StatusCode(500, "Failed to add blocked date");
            }

            return Ok();
        }




        //מחיקת תאריך חסום של ספק
        // DELETE api/Suppliers/{username}/blockedate/{date}
        [HttpDelete("{username}/blockedate/{date}")]
        public IActionResult DeleteBlockedDate(string username, string date)
        {
            Supplier s = new Supplier();
            int success = s.DeleteBlockedate(username, date);

            if (success == 0)
            {
                return StatusCode(500, "Failed to delete blocked date");
            }

            return Ok();
        }



        // קריאת ספקים זמינים לפי תאריך ואזור
        // GET api/Suppliers/available
        [HttpGet("{area}/AvailableSuppliers/{date}")]
        public IActionResult GetAvailableSuppliers(string area, DateTime date)
        {
            Supplier s = new Supplier();
            var availableSuppliers = s.GetAvailableSuppliers(area, date);

            if (availableSuppliers == null || availableSuppliers.Count == 0)
            {
                return NotFound(); // Return 404 if no available suppliers are found
            }

            return Ok(availableSuppliers); // Return the list of available suppliers if found
        }



        // קריאת דירוג ממוצע של ספק
        // GET api/<SuppliersController>/supplierId/avgFeedback
        [HttpGet("{supplierId}/avgFeedback")]
        public IActionResult GetAvgFeedbackBySupplierId(string supplierId)
        {
            Supplier s = new Supplier();
            float avgFeedback = s.GetAvgFeedbackBySupplierId(supplierId);

            if (avgFeedback == -1)
            {
                return NotFound(); // Return 404 if no feedback found for the specified supplierId
            }

            return Ok(avgFeedback); // Return the avgFeedback if found
        }




        

        // העלאת תמונה
        // POST api/<SuppliersController>/uploadPicture
        [HttpPost("uploadPicture")]
        public IActionResult UploadSupplierPicture(int supplierId, IFormFile picture)
        {
            if (supplierId <= 0 || picture == null || picture.Length == 0)
            {
                return StatusCode(400, new { message = "Invalid supplier ID or picture", status = "error" });
            }

            try
            {
                // יצירת אובייקט של Supplier והעלאת התמונה
                Supplier supplier = new Supplier();
                supplier.UploadPicture(supplierId, picture);

                return Ok(new { message = "Picture uploaded successfully", status = "success" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, status = "error" });
            }
        }




        // שליחת תמונה לקליינט
        [HttpGet("getPicture")]
        public IActionResult GetSupplierPicture(int supplierId)
        {
            try
            {
                Supplier s = new Supplier();
                string pictureFileName = s.GetPicturePathFromDatabase(supplierId);

                if (string.IsNullOrEmpty(pictureFileName))
                {
                    return NotFound(new { message = "Picture not found", status = "error" });
                }

                // קביעת נתיב מוחלט לתיקיית uploads
                string uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "uploads");
                string absolutePath = Path.Combine(uploadsFolder, pictureFileName);

                if (!System.IO.File.Exists(absolutePath))
                {
                    return NotFound(new { message = "Picture not found", status = "error" });
                }

                byte[] pictureData = System.IO.File.ReadAllBytes(absolutePath);
                return File(pictureData, "image/jpeg"); // או לפי סוג הקובץ הרלוונטי
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message, status = "error" });
            }
        }



    }
}
