using Microsoft.AspNetCore.Mvc;
using Mover.BL;
using System.Security.Claims;


namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FeedbackController : ControllerBase
    {

        // קריאת חוות דעות של ספק
        // GET: api/Feedback/{supplierId}
        [HttpGet]
        public IActionResult GetFeedbacks(int supplier_Id )
        {
            Feedback f = new Feedback();
            var Result = f.readFeedback(supplier_Id);
            if (Result == null)
            {
                return NotFound();
            }
            return Ok(Result);
        }




        // עדכון חוות דעת  / כתיבת חוות דעת חדשה
        // POST api/<FeedbackController>
        [HttpPost]
        public IActionResult Add_Feedback([FromBody] Feedback feedback)
        {
            if (feedback == null)
            {
                return StatusCode(400, new { message = "Invalid feedback data", status = "error" });
            }

            var insertionResult = feedback.addFeedback();
            switch (insertionResult)
            {
                case Feedback.InsertError.None:
                    return Ok(new { message = "feedback inserted successfully", status = "success" });

                default:
                    return StatusCode(500, new { message = "An unexpected error occurred", status = "error" });
            }
        }

    }
}
