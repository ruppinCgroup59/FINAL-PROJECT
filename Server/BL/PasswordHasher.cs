using System;
using System.Security.Cryptography;
using System.Text;

namespace Mover.BL
{
    public class PasswordHasher          /*מחלקה של הצפנת סיסמא*/
    {

        // Function to hash a password using SHA256 algorithm
        public string HashPassword(string inputPassword)
        {
            using (SHA256 sha256 = SHA256.Create())
            {
                // Convert the input password to bytes
                byte[] inputBytes = Encoding.UTF8.GetBytes(inputPassword);

                // Compute the hash of the input password
                byte[] hashedInputBytes = sha256.ComputeHash(inputBytes);

                // Convert the hashed input password bytes to a hexadecimal string
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < hashedInputBytes.Length; i++)
                {
                    builder.Append(hashedInputBytes[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }

    }
}
