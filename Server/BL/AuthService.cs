using Mover.DAL;

namespace Mover.BL
{
    public class AuthService
    {
        public AuthResult AuthenticateUser(string username, string password)
        {
            DBServices dbs = new DBServices();

            // Hash the password input by the user
            PasswordHasher hasher = new PasswordHasher();
            string hashedPassword = hasher.HashPassword(password);

            // Authenticate customer
            var customerResult = dbs.AuthenticateCustomer(username, hashedPassword);
            if (customerResult.Item1)
            {
                return new AuthResult
                {
                    UserType = "customer",
                    UserName = username,
                    UserId = customerResult.Item2
                };
            }

            // Authenticate supplier
            var supplierResult = dbs.AuthenticateSupplier(username, hashedPassword);
            if (supplierResult.Item1)
            {
                return new AuthResult
                {
                    UserType = "supplier",
                    UserName = username,
                    UserId = supplierResult.Item2
                };
            }

            // If the username is not found in either list, authentication fails
            return null;
        }
    }

    public class AuthResult
    {
        public string UserType { get; set; }
        public string UserName { get; set; }
        public string UserId { get; set; }
    }
}
