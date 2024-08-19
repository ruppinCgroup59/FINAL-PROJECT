using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Data.SqlClient;
using System.Data;
using System.Text;
using Mover.BL;
using System.Collections;
using System.Net;

namespace Mover.DAL
{
    public class DBServices
    {
        // This method creates a connection to the database according to the connectionString name in the web.config 
        public SqlConnection connect(String conString)
        {
            // read the connection string from the configuration file
            IConfigurationRoot configuration = new ConfigurationBuilder()
            .AddJsonFile("appsettings.json").Build();
            string cStr = configuration.GetConnectionString("myProjDB");
            SqlConnection con = new SqlConnection(cStr);
            con.Open();
            return con;
        }


        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // פונקציה לבדיקת קיום תעודת זהות במסד הנתונים
        public bool UserIdExists(string UserId)
        {
            SqlConnection con;
            SqlCommand cmdCustomer;
            SqlCommand cmdSupplier;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            var queryCustomer = "SELECT COUNT(*) FROM Users u inner join Customers c ON u.User_Id = c.Customer_Id WHERE Customer_Id = @CustomerId";
            cmdCustomer = new SqlCommand(queryCustomer, con);
            cmdCustomer.Parameters.AddWithValue("@CustomerId", UserId);

            var querySupplier = "SELECT COUNT(*) FROM Users u inner join Suppliers s ON u.User_Id = s.Supplier_Id WHERE Supplier_Id = @SupplierId";
            cmdSupplier = new SqlCommand(querySupplier, con);
            cmdSupplier.Parameters.AddWithValue("@SupplierId", UserId);

            bool IdExists = (int)cmdCustomer.ExecuteScalar() > 0 || (int)cmdSupplier.ExecuteScalar() > 0;
            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return IdExists;
        }




        // פונקציה לבדיקת קיום דוא"ל במסד הנתונים
        public bool UserEmailExists(string email)
        {
            SqlConnection con;
            SqlCommand cmdCustomer;
            SqlCommand cmdSupplier;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }


            var queryCustomer = "SELECT COUNT(*) FROM Users u inner join Customers c ON u.User_Id = c.Customer_Id WHERE Email = @Email";
            cmdCustomer = new SqlCommand(queryCustomer, con);
            cmdCustomer.Parameters.AddWithValue("@Email", email);

            var querySupplier = "SELECT COUNT(*) FROM Users u inner join Suppliers s ON u.User_Id = s.Supplier_Id WHERE Email = @Email";
            cmdSupplier = new SqlCommand(querySupplier, con);
            cmdSupplier.Parameters.AddWithValue("@Email", email);


            bool EmailExists = (int)cmdCustomer.ExecuteScalar() > 0 || (int)cmdSupplier.ExecuteScalar() > 0;

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return EmailExists;
        }




        // פונקציה לבדיקת קיום שם משתמש במסד הנתונים
        public bool UsernameExists(string username)
        {
            SqlConnection con;
            SqlCommand cmdCustomer;
            SqlCommand cmdSupplier;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            var queryCustomer = "SELECT COUNT(*) FROM Users u inner join Customers c ON u.User_Id = c.Customer_Id WHERE Username = @Username";
            cmdCustomer = new SqlCommand(queryCustomer, con);
            cmdCustomer.Parameters.AddWithValue("@Username", username);

            var querySupplier = "SELECT COUNT(*) FROM Users u inner join Suppliers s ON u.User_Id = s.Supplier_Id WHERE Username = @Username";
            cmdSupplier = new SqlCommand(querySupplier, con);
            cmdSupplier.Parameters.AddWithValue("@Username", username);

            bool UsernameExists = (int)cmdCustomer.ExecuteScalar() > 0 || (int)cmdSupplier.ExecuteScalar() > 0;

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return UsernameExists;
        }







        //-------------------------------------CUSTOMERS----------------------------------------------


        // This method Inserts a Customer to the database
        public int Customer_Insert(Customer customer)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateCustomerInsertCommandWithStoredProcedure("Mover_SP_InsertCustomer", con, customer);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }

        // Create the SqlCommand FOR Customer's INSERT METHOD , using a stored procedure
        private SqlCommand CreateCustomerInsertCommandWithStoredProcedure(String spName, SqlConnection con, Customer customer)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@User_Id", customer.Id);
            cmd.Parameters.AddWithValue("@email", customer.Email);
            cmd.Parameters.AddWithValue("@Password", customer.Password);
            cmd.Parameters.AddWithValue("@Username", customer.Username);
            cmd.Parameters.AddWithValue("@FirstName", customer.First_name);
            cmd.Parameters.AddWithValue("@LastName", customer.Last_name);
            cmd.Parameters.AddWithValue("@PhoneNumber", customer.Phone_number);
            cmd.Parameters.AddWithValue("@Address", customer.Address);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------





        // This method UPDATE Customer details 
        public int Customer_Update(Customer customer)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateCustomerUpdateCommandWithStoredProcedure("Mover_SP_UpdateCustomer", con, customer);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand FOR Customer UPDATE METHOD , using a stored procedure
        private SqlCommand CreateCustomerUpdateCommandWithStoredProcedure(String spName, SqlConnection con, Customer customer)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Username", customer.Username);
            cmd.Parameters.AddWithValue("@Password", customer.Password);
            cmd.Parameters.AddWithValue("@FirstName", customer.First_name);
            cmd.Parameters.AddWithValue("@LastName", customer.Last_name);
            cmd.Parameters.AddWithValue("@PhoneNumber", customer.Phone_number);
            cmd.Parameters.AddWithValue("@Address", customer.Address);

            return cmd;
        }
        
        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method READ customers details
        public List<Customer> ReadCustomers()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            List<Customer> customers = new List<Customer>();
            cmd = buildReadStoredProcedureCommand(con, "Mover_SP_ReadCustomers");
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Customer c = new Customer();
                c.Id = dataReader["User_Id"].ToString();
                c.Username = dataReader["Username"].ToString();
                c.Password = dataReader["Password"].ToString();
                c.First_name = dataReader["firstName"].ToString();
                c.Last_name = dataReader["LastName"].ToString();
                c.Email = dataReader["Email"].ToString();
                c.Phone_number = dataReader["PhoneNumber"].ToString();
                c.Address = dataReader["Address"].ToString();
                c.Registration_Date = DateTime.Parse(dataReader["RegistrationDate"].ToString());
                c.Status = dataReader["Status"].ToString();
                customers.Add(c);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return customers;
        }

        // Create the SqlCommand FOR customers READ METHOD , using a stored procedure
        SqlCommand buildReadStoredProcedureCommand(SqlConnection con, string spName)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method DELETE a Customer 
        public int Customer_Delete(string username)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateCustomerDeleteWithStoredProcedure("Mover_SP_DeleteCustomer", con, username);  // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }

        // Create the SqlCommand FOR DELETE METHOD using a stored procedure
        private SqlCommand CreateCustomerDeleteWithStoredProcedure(String spName, SqlConnection con, string username)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@Username", username);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------





        //-------------------------------------SUPPLIERS----------------------------------------------


        // This method Inserts a new Supplier to the database
        public int Supplier_Insert(Supplier supplier)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateSupplierInsertCommandWithStoredProcedure("Mover_SP_InsertSupplier", con, supplier);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }


        // Create the SqlCommand FOR Supplier's INSERT METHOD , using a stored procedure
        private SqlCommand CreateSupplierInsertCommandWithStoredProcedure(String spName, SqlConnection con, Supplier supplier)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@User_Id", supplier.Id);
            cmd.Parameters.AddWithValue("@Username", supplier.Username);
            cmd.Parameters.AddWithValue("@email", supplier.Email);
            cmd.Parameters.AddWithValue("@Password", supplier.Password);
            cmd.Parameters.AddWithValue("@FirstName", supplier.First_name);
            cmd.Parameters.AddWithValue("@LastName", supplier.Last_name);
            cmd.Parameters.AddWithValue("@PhoneNumber", supplier.Phone_number);
            cmd.Parameters.AddWithValue("@Address", supplier.Address);
            cmd.Parameters.AddWithValue("@CompanyName", supplier.Company_name);
            cmd.Parameters.AddWithValue("@preferredAreas", supplier.Preferred_Areas);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method UPDATE Supplier details 
        public int Supplier_Update(Supplier supplier)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateSupplierUpdateCommandWithStoredProcedure("Mover_SP_UpdateSupplier", con, supplier);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }


        // Create the SqlCommand FOR Supplier UPDATE METHOD , using a stored procedure
        private SqlCommand CreateSupplierUpdateCommandWithStoredProcedure(String spName, SqlConnection con, Supplier supplier)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Username", supplier.Username);
            cmd.Parameters.AddWithValue("@Password", supplier.Password);
            cmd.Parameters.AddWithValue("@FirstName", supplier.First_name);
            cmd.Parameters.AddWithValue("@LastName", supplier.Last_name);
            cmd.Parameters.AddWithValue("@PhoneNumber", supplier.Phone_number);
            cmd.Parameters.AddWithValue("@Address", supplier.Address);
            cmd.Parameters.AddWithValue("@CompanyName", supplier.Company_name);
            cmd.Parameters.AddWithValue("@preferredAreas", supplier.Preferred_Areas);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // Method to get a supplier by username
        public List<Supplier> GetSupplierByUsername(string username)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // Create the connection
            }
            catch (Exception ex)
            {
                // Write to log or handle exception
                throw (ex);
            }

            string query = "SELECT * FROM Users u INNER JOIN Suppliers s ON u.User_Id = s.Supplier_Id left join Blockedates b on b.User_Id=u.User_Id WHERE Username = @Username";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Username", username);

            SqlDataReader dataReader = cmd.ExecuteReader();
            List<Supplier> suppliers = new List<Supplier>();

            while (dataReader.Read())
            {
                Supplier supplier = new Supplier();
                supplier.Id = dataReader["User_Id"].ToString();
                supplier.Username = dataReader["Username"].ToString();
                supplier.Password = dataReader["Password"].ToString();
                supplier.First_name = dataReader["firstName"].ToString();
                supplier.Last_name = dataReader["LastName"].ToString();
                supplier.Email = dataReader["Email"].ToString();
                supplier.Phone_number = dataReader["PhoneNumber"].ToString();
                supplier.Company_name = dataReader["CompanyName"].ToString();
                supplier.Registration_Date = DateTime.Parse(dataReader["RegistrationDate"].ToString());
                supplier.Preferred_Areas = dataReader["preferredAreas"].ToString();
                supplier.Blockedate = DateTime.Parse(dataReader["Blockedate"].ToString());
                supplier.Address = dataReader["Address"].ToString();
                suppliers.Add(supplier);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return suppliers;
        }


        // This method READ ALL suppliers details
        public List<Supplier> ReadSuppliers()
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            List<Supplier> suppliers = new List<Supplier>();
            cmd = buildSupplierReadStoredProcedureCommand(con, "Mover_SP_ReadSuppliers");
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Supplier s = new Supplier();
                s.Id = dataReader["User_Id"].ToString();
                s.Username = dataReader["Username"].ToString();
                s.Password = dataReader["Password"].ToString();
                s.First_name = dataReader["firstName"].ToString();
                s.Last_name = dataReader["LastName"].ToString();
                s.Email = dataReader["Email"].ToString();
                s.Phone_number = dataReader["PhoneNumber"].ToString();
                s.Company_name = dataReader["CompanyName"].ToString();
                s.Registration_Date = DateTime.Parse(dataReader["RegistrationDate"].ToString());
                s.Preferred_Areas = dataReader["preferredAreas"].ToString();
                s.Address = dataReader["Address"].ToString();
                suppliers.Add(s);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return suppliers;
        }


        // Create the SqlCommand FOR Suppliers READ METHOD , using a stored procedure
        SqlCommand buildSupplierReadStoredProcedureCommand(SqlConnection con, string spName)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method DELETE a Supplier 
        public int Supplier_Delete(string username)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateSupplierDeleteWithStoredProcedure("Mover_SP_DeleteSupplier", con, username);  // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }

        // Create the SqlCommand FOR DELETE METHOD using a stored procedure
        private SqlCommand CreateSupplierDeleteWithStoredProcedure(String spName, SqlConnection con, string username)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@Username", username);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------





        //This method add block date by supplier
        public int AddBlockedate(string username, DateTime blockedate)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateSupplierBlockedateCommandWithStoredProcedure("Mover_SP_AddBlockedDate", con, username, blockedate);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }
        }

        private SqlCommand CreateSupplierBlockedateCommandWithStoredProcedure(String spName, SqlConnection con, string username, DateTime blockedate)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@username", username);
            cmd.Parameters.AddWithValue("@blockedDate", blockedate);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------



        //This method delete block date by supplier
        public int DeleteBlockedate(string username, string date)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateSupplierBlockedateCommandWithStoredProcedure("Mover_SP_DeleteBlockedDate", con, username, date);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }
        }

        private SqlCommand CreateSupplierBlockedateCommandWithStoredProcedure(String spName, SqlConnection con, string username, string date)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@username", username);
            cmd.Parameters.AddWithValue("@blockedDate", date);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------



        //This method find available suppliers by date and area
        public List<Supplier> GetAvailableSuppliers(string area, DateTime date)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            List<Supplier> availableSuppliers = new List<Supplier>();
            cmd = GetAvailableSuppliersCommandWithStoredProcedure("Mover_SP_AvailableSuppliers", con, area, date);    // create the command
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);

            while (dataReader.Read())
            {
                Supplier s = new Supplier();
                s.Id = dataReader["User_Id"].ToString();
                s.Username = dataReader["Username"].ToString();
                s.Password = dataReader["Password"].ToString();
                s.First_name = dataReader["firstName"].ToString();
                s.Last_name = dataReader["LastName"].ToString();
                s.Email = dataReader["Email"].ToString();
                s.Phone_number = dataReader["PhoneNumber"].ToString();
                s.Company_name = dataReader["CompanyName"].ToString();
                s.Registration_Date = DateTime.Parse(dataReader["RegistrationDate"].ToString());
                s.Preferred_Areas = dataReader["preferredAreas"].ToString();
                s.Address = dataReader["Address"].ToString();
                availableSuppliers.Add(s);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return availableSuppliers;
        }

        private SqlCommand GetAvailableSuppliersCommandWithStoredProcedure(String spName, SqlConnection con, string area, DateTime date)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@area", area);
            cmd.Parameters.AddWithValue("@date", date);
            return cmd;
        }


        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------


        ///------------------------------------------- Supplier Photo -------------------------------------------/////

        // This Method UPLOAD Supplier`s PHOTO to the database
        public void UploadPictureToTheDataBase(int supplierId, IFormFile picture)
        {
            string fileName = $"{supplierId}_{picture.FileName}";
            var filePath = Path.Combine("uploads", fileName);

            {
                SqlConnection con;

                try
                {
                    con = connect("myProjDB"); // Create the connection
                }
                catch (Exception ex)
                {
                    // Write to log or handle exception
                    throw (ex);
                }

                try
                {
                    // שמירת התמונה בשרת
                    using (var stream = new FileStream(filePath, FileMode.Create))
                    {
                        picture.CopyTo(stream);
                    }
                }
                catch (Exception ex)
                {
                    throw new Exception("An error occurred while saving the picture", ex);
                }



                string query = "UPDATE Suppliers SET PicturePath = @profile_image WHERE Supplier_Id = @SupplierId";

                SqlCommand cmd = new SqlCommand(query, con);
                cmd.Parameters.AddWithValue("@profile_image", fileName);
                cmd.Parameters.AddWithValue("@SupplierId", supplierId);
                cmd.ExecuteNonQuery();


                if (con != null)
                {
                    con.Close(); // close the db connection
                }

            }

        }


        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------

        // This Method Get Supplier`s Photo path from the database
        public string UnloadPictureFromTheDataBase(int supplierId)
        {
            SqlConnection con = null;
            string path = null;

            try
            {
                con = connect("myProjDB"); // יצירת החיבור
                string query = "select PicturePath from Suppliers where Supplier_Id = @supplierId";
                SqlCommand cmd = new SqlCommand(query, con);
                cmd.Parameters.AddWithValue("@supplierId", supplierId);

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read() && reader["PicturePath"] != DBNull.Value)
                {
                    path = reader["PicturePath"].ToString();
                }
            }
            catch (Exception ex)
            {
                // רישום השגיאה בלוג
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // סגירת החיבור לבסיס הנתונים
                }
            }

            return path;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------







        ///------------------------------------------- Login -------------------------------------------/////


        //Customer LOGIN   
        public (bool, string) AuthenticateCustomer(string username, string password)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            string query = "SELECT Customer_Id FROM Users u INNER JOIN Customers c ON u.User_Id = c.Customer_Id WHERE Username = @Username AND Password = @Password";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Username", username);
            cmd.Parameters.AddWithValue("@Password", password);

            SqlDataReader reader = cmd.ExecuteReader();
            bool isAuthenticated = reader.Read();
            string userId = isAuthenticated ? reader["Customer_Id"].ToString() : null;

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return (isAuthenticated, userId);
        }



        //Supplier LOGIN       
        public (bool, string) AuthenticateSupplier(string username, string password)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            string query = "SELECT Supplier_Id FROM Users u INNER JOIN Suppliers s ON u.User_Id = s.Supplier_Id WHERE Username = @Username AND Password = @Password";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@Username", username);
            cmd.Parameters.AddWithValue("@Password", password);

            SqlDataReader reader = cmd.ExecuteReader();
            bool isAuthenticated = reader.Read();
            string userId = isAuthenticated ? reader["Supplier_Id"].ToString() : null;

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return (isAuthenticated, userId);
        }







        /// ------------------------------------------- Feedbacks -------------------------------------------/////


        //This method Inserts a new feedback to the database
        public int Feedback_Insert(Feedback feedback)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateInsertFeedbackCommandWithStoredProcedure("Mover_SP_AddFeedback", con, feedback);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }


        //Create the SqlCommand FOR feedback's INSERT METHOD , using a stored procedure
        private SqlCommand CreateInsertFeedbackCommandWithStoredProcedure(String spName, SqlConnection con, Feedback feedback)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Customer_Id", feedback.CId);
            cmd.Parameters.AddWithValue("@Supplier_Id", feedback.SId);
            cmd.Parameters.AddWithValue("@Rate", feedback.Rate);
            cmd.Parameters.AddWithValue("@Description", feedback.Description);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------



        //This method read all feedbacks by suppier id
        public List<Feedback> readAllFeedback(int supplier_id)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            List<Feedback> feedbacks = new List<Feedback>();
            cmd = buildfeedbackReadStoredProcedureCommand(con,"Mover_SP_GetFeedback",supplier_id);    // create the command
            SqlDataReader dataReader = cmd.ExecuteReader(CommandBehavior.CloseConnection);
            while (dataReader.Read())
            {
                Feedback f = new Feedback();
                f.Feedback_id = Convert.ToInt32(dataReader["Feedback_id"]);
                f.Rate = Convert.ToInt32(dataReader["Rating"]);
                f.CId = Convert.ToInt32(dataReader["Customer_Id"]);
                f.SId = Convert.ToInt32(dataReader["Supplier_Id"]);
                f.Description = dataReader["Description"].ToString();
                f.FeedbackDate = Convert.ToDateTime(dataReader["Date"]);
                feedbacks.Add(f);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return feedbacks;
        }


        // Create the SqlCommand FOR feddback READ METHOD , using a stored procedure
        SqlCommand buildfeedbackReadStoredProcedureCommand(SqlConnection con, string spName, int Supplier_Id)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@Supplier_Id", Supplier_Id);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        //This method get Supplier Average FEEDBACK       
        public float getAvgFeedback(string supplierId)
        {
            SqlConnection con = null;
            float avgFeedback = 0.0f;

            try
            {
                con = connect("myProjDB"); // create the connection
                string query = "SELECT AVG(rating) as avgFeedback FROM Feedback WHERE Supplier_Id = @supplierId";
                SqlCommand cmd = new SqlCommand(query, con);
                cmd.Parameters.AddWithValue("@supplierId", supplierId);

                SqlDataReader reader = cmd.ExecuteReader();
                if (reader.Read() && reader["avgFeedback"] != DBNull.Value)
                {
                    avgFeedback = Convert.ToSingle(reader["avgFeedback"]);
                }
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }
            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

            return avgFeedback;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------






        ///------------------------------------------- Services -------------------------------------------/////

        //This method Inserts a new Service to the database
        public int Service_Insert(Service service)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                // write to log
                throw (ex);
            }

            cmd = CreateInsertServiceCommandWithStoredProcedure("Mover_SP_InsertService", con, service);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }


        //Create the SqlCommand FOR Service's INSERT METHOD , using a stored procedure
        private SqlCommand CreateInsertServiceCommandWithStoredProcedure(String spName, SqlConnection con, Service service)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@SupplierId", service.Supplier_Id);
            cmd.Parameters.AddWithValue("@CustomerId", service.Customer_Id);
            cmd.Parameters.AddWithValue("@ServiceName", service.Service_Name);
            cmd.Parameters.AddWithValue("@From", service.From);
            cmd.Parameters.AddWithValue("@To", service.To);
            cmd.Parameters.AddWithValue("@Description", service.Description);
            cmd.Parameters.AddWithValue("@Date", service.Date);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------



        

        // Method to get Services 
        public List<Service> GetServices(string userId, string userType)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // Create the connection
            }
            catch (Exception ex)
            {
                // Write to log or handle exception
                throw (ex);
            }

            string query = "";

             if (userType == "customer")
            {
                query = "SELECT * FROM Services WHERE Customer_Id = @userId";
            }
            else if (userType == "supplier")
            {
                query = "SELECT * FROM Services WHERE Supplier_Id = @userId";
            }

            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@userId", userId);
            SqlDataReader dataReader = cmd.ExecuteReader();
            List<Service> services = new List<Service>();

            while (dataReader.Read())
            {
                Service service = new Service();
                service.Service_Id = Convert.ToInt32(dataReader["Service_Id"]);
                service.Customer_Name = dataReader["Customer_Name"].ToString();
                service.Supplier_Name = dataReader["Supplier_Name"].ToString();
                service.Supplier_Id = Convert.ToInt32(dataReader["Supplier_Id"]);
                service.Customer_Id = Convert.ToInt32(dataReader["Customer_Id"]);
                service.Service_Name = dataReader["Service_Name"].ToString();
                service.From = dataReader["From"].ToString();
                service.To = dataReader["To"].ToString();
                service.Description = dataReader["Description"].ToString();
                service.Price = Convert.ToInt32(dataReader["Price"]);
                service.Confirmed = Convert.ToInt32(dataReader["Confirmed"]);
                service.Date = Convert.ToDateTime(dataReader["Date"]);
                service.IsActive = Convert.ToBoolean(dataReader["IsActive"]);
                service.Complete = Convert.ToBoolean(dataReader["Complete"]);
                services.Add(service);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return services;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // Method to get Active Services for customer
        public List<Service> ActiveServicesForCustomer(int customerId)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // Create the connection
            }
            catch (Exception ex)
            {
                // Write to log or handle exception
                throw (ex);
            }

            string query = "select * from Services where Customer_Id = @customerId and isActive = 1 and date = CAST(GETDATE() AS DATE);";

            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@customerId", customerId);
            SqlDataReader dataReader = cmd.ExecuteReader();
            List<Service> services = new List<Service>();

            while (dataReader.Read())
            {
                Service service = new Service();
                service.Service_Id = Convert.ToInt32(dataReader["Service_Id"]);
                service.Customer_Name = dataReader["Customer_Name"].ToString();
                service.Supplier_Name = dataReader["Supplier_Name"].ToString();
                service.Supplier_Id = Convert.ToInt32(dataReader["Supplier_Id"]);
                service.Customer_Id = Convert.ToInt32(dataReader["Customer_Id"]);
                service.Service_Name = dataReader["Service_Name"].ToString();
                service.From = dataReader["From"].ToString();
                service.To = dataReader["To"].ToString();
                service.Description = dataReader["Description"].ToString();
                service.Price = Convert.ToInt32(dataReader["Price"]);
                service.Confirmed = Convert.ToInt32(dataReader["Confirmed"]);
                service.Date = Convert.ToDateTime(dataReader["Date"]);
                service.IsActive = Convert.ToBoolean(dataReader["IsActive"]);
                service.Complete = Convert.ToBoolean(dataReader["Complete"]);
                services.Add(service);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return services;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------





        // Method to get service by serviceID
        public Service GetServiceBy_ServiceId(int serviceId)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // Create the connection
            }
            catch (Exception ex)
            {
                // Write to log or handle exception
                throw (ex);
            }

            string query = "SELECT * FROM Services WHERE Service_Id = @ServiceId";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@ServiceId", serviceId);

            SqlDataReader dataReader = cmd.ExecuteReader();
            Service service = new Service();
            while (dataReader.Read())
            {
                service.Service_Id = Convert.ToInt32(dataReader["Service_Id"]);
                service.Customer_Name = dataReader["Customer_Name"].ToString();
                service.Supplier_Name = dataReader["Supplier_Name"].ToString();
                service.Supplier_Id = Convert.ToInt32(dataReader["Supplier_Id"]);
                service.Customer_Id = Convert.ToInt32(dataReader["Customer_Id"]);
                service.Service_Name = dataReader["Service_Name"].ToString();
                service.From = dataReader["From"].ToString();
                service.To = dataReader["To"].ToString();
                service.Description = dataReader["Description"].ToString();
                service.Price = Convert.ToInt32(dataReader["Price"]);
                service.Confirmed = Convert.ToInt32(dataReader["Confirmed"]);
                service.Date = Convert.ToDateTime(dataReader["Date"]);
                service.IsActive = Convert.ToBoolean(dataReader["IsActive"]);
                service.Complete = Convert.ToBoolean(dataReader["Complete"]);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return service;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------






        // This method UPDATE Service Price 
        public int Price_Update(int service_Id, float Price)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateServicePriceUpdateCommandWithStoredProcedure("Mover_SP_UpdatePrice", con, service_Id,Price);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand FOR Service UPDATE (Price) METHOD , using a stored procedure
        private SqlCommand CreateServicePriceUpdateCommandWithStoredProcedure(String spName, SqlConnection con, int service_Id, float Price)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Service_Id", service_Id);
            cmd.Parameters.AddWithValue("@Price", Price);

            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method UPDATE Service Confirmed status
        public int Confirmed_Update(int service_Id, int Confirmed)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateServiceConfirmedUpdateCommandWithStoredProcedure("Mover_SP_UpdateConfirmed", con, service_Id, Confirmed);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand FOR Service UPDATE (Confirmed)  METHOD , using a stored procedure
        private SqlCommand CreateServiceConfirmedUpdateCommandWithStoredProcedure(String spName, SqlConnection con, int service_Id, int Confirmed)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Service_Id", service_Id);
            cmd.Parameters.AddWithValue("@Confirmed", Confirmed);

            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method updates the isActive status of a service
        public int IsActive_Update(int service_Id, bool isActive)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateServiceIsActiveUpdateCommandWithStoredProcedure("Mover_SP_UpdateIsActive", con, service_Id, isActive);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand for updating the isActive status using a stored procedure
        private SqlCommand CreateServiceIsActiveUpdateCommandWithStoredProcedure(string spName, SqlConnection con, int service_Id, bool isActive)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Service_Id", service_Id);
            cmd.Parameters.AddWithValue("@IsActive", isActive);

            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method updates the Complete flag
        public int Complete_Update(int service_Id, bool complete)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateServiceCompleteUpdateCommandWithStoredProcedure("Mover_SP_UpdateComplete", con, service_Id, complete);    // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand for updating the Complete flag using a stored procedure
        private SqlCommand CreateServiceCompleteUpdateCommandWithStoredProcedure(string spName, SqlConnection con, int service_Id, bool complete)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@Service_Id", service_Id);
            cmd.Parameters.AddWithValue("@Complete", complete);

            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------






        ///------------------------------------------- Mover Location -------------------------------------------/////


        // Method to update supplier location
        public int SupplierLocation_Update(SupplierLocation sl)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateUpdateSupplierLocationCommandWithStoredProcedure("Mover_SP_UpsertSupplierLocation", con, sl); // Create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close();  // close the db connection
                }
            }
        }

        // Create the SqlCommand for updating supplier location using a stored procedure
        private SqlCommand CreateUpdateSupplierLocationCommandWithStoredProcedure(string spName, SqlConnection con, SupplierLocation sl)
        {
            SqlCommand cmd = new SqlCommand(); // Create the command object
            cmd.Connection = con; // Assign the connection to the command object
            cmd.CommandText = spName;
            cmd.CommandTimeout = 10;
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@ServiceId", sl.ServiceId);
            cmd.Parameters.AddWithValue("@Latitude", sl.Latitude);
            cmd.Parameters.AddWithValue("@Longitude", sl.Longitude);
            cmd.Parameters.AddWithValue("@DriverName", sl.DriverName);
            cmd.Parameters.AddWithValue("@Driver_Phone", sl.Driver_Phone);

            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // Method to get supplier location
        public SupplierLocation GetSupplierLocation(int serviceId)
        {
            SqlConnection con;

            try
            {
                con = connect("myProjDB"); // Create the connection
            }
            catch (Exception ex)
            {
                // Write to log or handle exception
                throw (ex);
            }

            string query = "SELECT * FROM SupplierLocation WHERE ServiceId = @ServiceId";
            SqlCommand cmd = new SqlCommand(query, con);
            cmd.Parameters.AddWithValue("@ServiceId", serviceId);

            SqlDataReader dataReader = cmd.ExecuteReader();
            SupplierLocation sl = new SupplierLocation();
            while (dataReader.Read())
            {               
                sl.ServiceId = Convert.ToInt32(dataReader["ServiceId"]);
                sl.Latitude = Convert.ToDecimal(dataReader["Latitude"]);
                sl.Longitude = Convert.ToDecimal(dataReader["Longitude"]);
                sl.DriverName = dataReader["DriverName"].ToString(); 
                sl.Driver_Phone = dataReader["Driver_Phone"].ToString(); 
                sl.Timestamp = Convert.ToDateTime(dataReader["Timestamp"]);
            }

            if (con != null)
            {
                con.Close(); // close the db connection
            }

            return sl;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------




        // This method DELETE a Supplier Location
        public int SupplierLocation_Delete(int ServiceId)
        {
            SqlConnection con;
            SqlCommand cmd;

            try
            {
                con = connect("myProjDB"); // create the connection
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            cmd = CreateSupplierLocationDeleteWithStoredProcedure("Mover_SP_DeleteSupplierLocation", con, ServiceId);  // create the command

            try
            {
                int numEffected = cmd.ExecuteNonQuery(); // execute the command
                return numEffected;
            }
            catch (Exception ex)
            {
                throw (ex); // write to log
            }

            finally
            {
                if (con != null)
                {
                    con.Close(); // close the db connection
                }
            }

        }

        // Create the SqlCommand FOR DELETE supplier location METHOD using a stored procedure
        private SqlCommand CreateSupplierLocationDeleteWithStoredProcedure(String spName, SqlConnection con, int serviceId)
        {
            SqlCommand cmd = new SqlCommand(); // create the command object
            cmd.Connection = con;              // assign the connection to the command object
            cmd.CommandText = spName;      // can be Select, Insert, Update, Delete 
            cmd.CommandTimeout = 10;           // Time to wait for the execution' The default is 30 seconds
            cmd.CommandType = System.Data.CommandType.StoredProcedure; // the type of the command, can also be text
            cmd.Parameters.AddWithValue("@serviceId", serviceId);
            return cmd;
        }

        //--------------------------------------------------------------------------------------------------
        //--------------------------------------------------------------------------------------------------

    }

}


