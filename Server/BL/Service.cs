using Mover.DAL;
using System.Numerics;

namespace Mover.BL
{
    public class Service
    {
        int service_Id; 
        string customer_Name;
        string supplier_Name;
        int supplier_Id;
        int customer_Id;
        string service_Name;
        string from;
        string to;
        string description;
        float price;
        int confirmed;
        DateTime date;
        bool isActive;
        bool complete;
     
        

        public Service() { }

        public Service(int service_Id,string customer_Name,string supplier_Name, int supplier_Id, int customer_Id, string service_Name, string from, string to, string description, float price, int confirmed, DateTime date, bool isActive , bool complete)
        {
            Service_Id = service_Id; 
            Customer_Name = customer_Name;
            Supplier_Name = supplier_Name;
            Supplier_Id = supplier_Id;
            Customer_Id = customer_Id;
            Service_Name = service_Name;
            From = from;
            To = to;
            Description = description;
            Price = price;
            Confirmed = confirmed;
            Date = date;
            IsActive = isActive;
            Complete = complete;
        }

        public int Service_Id { get => service_Id; set => service_Id = value; } 
        public string Customer_Name { get => customer_Name; set => customer_Name = value; }
        public string Supplier_Name { get => supplier_Name; set => supplier_Name = value; }
        public int Supplier_Id { get => supplier_Id; set => supplier_Id = value; }
        public int Customer_Id { get => customer_Id; set => customer_Id = value; }
        public string Service_Name { get => service_Name; set => service_Name = value; }
        public string From { get => from; set => from = value; }
        public string To { get => to; set => to = value; }
        public string Description { get => description; set => description = value; }
        public float Price { get => price; set => price = value; }
        public int Confirmed { get => confirmed; set => confirmed = value; }
        public DateTime Date { get => date; set => date = value; }
        public bool IsActive { get => isActive; set => isActive = value; }
        public bool Complete { get => complete; set => complete = value; }



        // Method to get all services by user id and user type
        public List<Service> GetServices(string userId, string userType)
        {
            DBServices dbs = new DBServices();
            return dbs.GetServices(userId, userType);
        }


        // Method to get service by service id
        public Service GetServiceById(int serviceId)
        {
            DBServices dbs = new DBServices();
            return dbs.GetServiceBy_ServiceId(serviceId);
        }


        // Method to insert a new service
        public int Service_Insert(Service service)
        {
            DBServices dbs = new DBServices();
            return dbs.Service_Insert(service);
        }


        // Method to update price
        public int Update_Price(int service_Id, float Price)
        {
            DBServices dbs = new DBServices();
            return dbs.Price_Update(service_Id, Price);
        }


        // Method to update confirmed service
        public int Update_Confirmed(int service_Id, int Confirmed)
        {
            DBServices dbs = new DBServices();
            return dbs.Confirmed_Update(service_Id, Confirmed);
        }


        // Method to Active / deActive service
        public int IsActive_Update(int service_Id, bool isActive)
        {
            DBServices dbs = new DBServices();
            return dbs.IsActive_Update(service_Id, isActive);
        }


        // Method to update Complete service
        public int ServiceComplete_Update(int service_Id, bool complete)
        {
            DBServices dbs = new DBServices();
            return dbs.Complete_Update(service_Id, complete);
        }



        // Method to get all activeting services
        public List<Service> ActiveServices(int customerId)
        {
            DBServices dbs = new DBServices();
            return dbs.ActiveServicesForCustomer(customerId);
        }


    }
}
