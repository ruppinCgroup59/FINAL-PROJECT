using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Identity;
using Mover.DAL;



namespace Mover.BL
{
    public class Customer
    {
        private string id;
        private string username;
        private string password;
        private string first_name;
        private string last_name;
        private string email;
        private string phone_number;
        private string address;
        private DateTime registration_Date;
        private String status;


        public string Id { get => id; set => id = value; }
        public string Username { get => username; set => username = value; }
        public string Password { get => password; set => password = value; }
        public string First_name { get => first_name; set => first_name = value; }
        public string Last_name { get => last_name; set => last_name = value; }
        public string Email { get => email; set => email = value; }
        public string Phone_number { get => phone_number; set => phone_number = value; }
        public string Address { get => address; set => address = value; }
        public DateTime Registration_Date { get => registration_Date; set => registration_Date = value; }
        public string Status { get => status; set => status = value; }
        
        public Customer() { }

        public Customer(string id,string username, string password, string first_name, string last_name, string email, string phone_number, string address, DateTime registration_Date, string status)
        {
            this.Id=id;
            this.Username = username;
            this.Password = password;
            this.First_name = first_name;
            this.Last_name = last_name;
            this.Email = email;
            this.Phone_number = phone_number;
            this.Address = address;
            this.Registration_Date = registration_Date;
            this.Status = status;
        }

        public enum InsertError
        {
            None,
            DuplicateId,
            DuplicateEmail,
            DuplicateUsername,
            InvalidId
        }


        // Method to read all customers
        public List<Customer> ReadCustomers()
        {
            DBServices dbs = new DBServices();
            return dbs.ReadCustomers();
        }


        // Method to update customer
        public int Customer_Update()
        {
            DBServices dbs = new DBServices();
            return dbs.Customer_Update(this);
        }


        // Method to delete customer
        public int Customer_Delete(string username)
        {
            DBServices dbs = new DBServices();
            return dbs.Customer_Delete(username);
        }


        // Method to insert a new customer
        public InsertError Insert()   
        {
            DBServices dbs = new DBServices();

            // Check if the customer id is numeric
            if (!IsNumeric(this.Id))
            {
                return InsertError.InvalidId; 
            }

            // Check if the customer id already exists
            if (dbs.UserIdExists(this.Id))
            {
                return InsertError.DuplicateId;
            }

            // Check if the customer email already exists
            if (dbs.UserEmailExists(this.Email))
            {
                return InsertError.DuplicateEmail;
            }

            // Check if the customer username already exists
            if (dbs.UsernameExists(this.Username))
            {
                return InsertError.DuplicateUsername;
            }

            // Hash the password before inserting the customer into the database
            PasswordHasher hasher = new PasswordHasher();
            this.Password = hasher.HashPassword(this.Password);

            // Insert the customer into the database
            dbs.Customer_Insert(this);

            return InsertError.None;
        }



        //Checks if the input string represents an integer number
        public static bool IsNumeric(string input)
        {
            int result;
            return int.TryParse(input, out result);
        }
    }
}
