using System;
using System.Security.AccessControl;
using Microsoft.AspNetCore.Identity;
using Mover.BL;
using Mover.DAL;

namespace Mover.BL
{
    public class Supplier
    {
        private string id;
        private string username;
        private string email;
        private string password;
        private string company_name;
        private string first_name;
        private string last_name;
        private string phone_number;
        private string address;
        private string preferred_Areas;
        private DateTime registration_Date;
        private DateTime blockedate;





        public string Id { get => id; set => id = value; }
        public string Username { get => username; set => username = value; }
        public string Email { get => email; set => email = value; }
        public string Password { get => password; set => password = value; }
        public string Company_name { get => company_name; set => company_name = value; }
        public string First_name { get => first_name; set => first_name = value; }
        public string Last_name { get => last_name; set => last_name = value; }
        public string Phone_number { get => phone_number; set => phone_number = value; }
        public string Address { get => address; set => address = value; }
        public string Preferred_Areas { get => preferred_Areas; set => preferred_Areas = value; }
        public DateTime Registration_Date { get => registration_Date; set => registration_Date = value; }
        public DateTime Blockedate { get => blockedate; set => blockedate = value; }



        public Supplier() { }

        public Supplier(string id, string username, string email, string password, string company_name, string first_name, string last_name, string phone_number, string address, string preferred_Areas, DateTime registration_Date)
        {
            this.Id = id;
            this.Username = username;
            this.Email = email;
            this.Password = password;
            this.Company_name = company_name;
            this.First_name = first_name;
            this.Last_name = last_name;
            this.Phone_number = phone_number;
            this.Address = address;
            this.Preferred_Areas = preferred_Areas;
            this.Registration_Date = registration_Date;
            this.Blockedate = blockedate;
        }


        public enum InsertError
        {
            None,
            DuplicateId,
            DuplicateEmail,
            DuplicateUsername,
            InvalidId,
            BadRequest,
            InvalidSupplierId,
            SaveError
        }


        // Method to insert a new supplier
        public InsertError Insert()
        {
            DBServices dbs = new DBServices();

            // Check if the supplier id is numeric
            if (!IsNumeric(this.Id))
            {
                return InsertError.InvalidId;
            }

            // Check if the supplier id already exists
            if (dbs.UserIdExists(this.Id))
            {
                return InsertError.DuplicateId;
            }

            // Check if the supplier email already exists
            if (dbs.UserEmailExists(this.Email))
            {
                return InsertError.DuplicateEmail;
            }

            // Check if the supplier username already exists
            if (dbs.UsernameExists(this.Username))
            {
                return InsertError.DuplicateUsername;
            }

            // Hash the password before inserting the supplier into the database
            PasswordHasher hasher = new PasswordHasher();
            this.Password = hasher.HashPassword(this.Password);

            // Insert the supplier into the database
            dbs.Supplier_Insert(this);

            return InsertError.None;
        }



        // Method to get all suppliers
        public List<Supplier> ReadSuppliers()
        {
            DBServices dbs = new DBServices();
            return dbs.ReadSuppliers();
        }




        // Method to get a supplier by username
        public List<Supplier> GetSupplierByUsername(string username)
        {
            DBServices dbs = new DBServices();
            return dbs.GetSupplierByUsername(username);
        }



        // Method to update supplier
        public InsertError Supplier_Update()
        {
            DBServices dbs = new DBServices();

            // Hash the password before inserting the supplier into the database
            PasswordHasher hasher = new PasswordHasher();
            this.Password = hasher.HashPassword(this.Password);

            // Insert the supplier into the database
            dbs.Supplier_Update(this);
            return InsertError.None;
        }



        // Method to delete supplier
        public int Supplier_Delete(string username)
        {
            DBServices dbs = new DBServices();
            return dbs.Supplier_Delete(username);
        }




        //Checks if the input string represents an integer number
        public static bool IsNumeric(string input)
        {
            int result;
            return int.TryParse(input, out result);
        }




        // Method to add new blockdate by supplier
        public int AddBlockedate(string username, DateTime blockedate)
        {
            DBServices dbs = new DBServices();
            return dbs.AddBlockedate(username, blockedate);
        }



        // Method to delete blockedate by supplier
        public int DeleteBlockedate(string username, string date)
        {
            DBServices dbs = new DBServices();
            return dbs.DeleteBlockedate(username, date);
        }



        // Method to get all available supplier by area and date
        public List<Supplier> GetAvailableSuppliers(string area, DateTime date)
        {
            DBServices dbs = new DBServices();
            return dbs.GetAvailableSuppliers(area, date);
        }




        // Method to get average feedbacks by supplier id
        public float GetAvgFeedbackBySupplierId(string supplierId)
        {
            DBServices dbs = new DBServices();
            return dbs.getAvgFeedback(supplierId);
        }





        // Method to upload supplier`s photo to the server / database
        public void UploadPicture(int supplierId, IFormFile picture)
        {
            DBServices dbs = new DBServices();
            dbs.UploadPictureToTheDataBase(supplierId, picture);
        }



        // Method to get supplier picture path
        public string GetPicturePathFromDatabase(int supplierId)
        {
            DBServices dbs = new DBServices();
            return dbs.UnloadPictureFromTheDataBase(supplierId);
        }

    }
}
