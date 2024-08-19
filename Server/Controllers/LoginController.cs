using Mover.BL;
using Microsoft.AspNetCore.Mvc;

namespace Mover.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LoginController : ControllerBase
    {
        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        // Login to the system
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return StatusCode(401, new { message = "Invalid username or password", status = "error" });
            }

            AuthService authService = new AuthService();

            // Authenticate the user using the provided username and password
            AuthResult authResult = authService.AuthenticateUser(request.Username, request.Password);

            if (authResult != null)
            {
                // Customize the response to include customerId or supplierId based on user type
                if (authResult.UserType == "customer")
                {
                    return Ok(new
                    {
                        message = "Login successful",
                        status = "success",
                        userType = authResult.UserType,
                        userName = authResult.UserName,
                        customerId = authResult.UserId
                    });
                }
                else if (authResult.UserType == "supplier")
                {
                    return Ok(new
                    {
                        message = "Login successful",
                        status = "success",
                        userType = authResult.UserType,
                        userName = authResult.UserName,
                        supplierId = authResult.UserId
                    });
                }

                // If user type is not recognized
                return StatusCode(401, new { message = "Invalid user type", status = "error" });
            }
            else
            {
                return StatusCode(401, new { message = "Invalid username or password", status = "error" });
            }
        }
    }
}
