using Mover.DAL;

namespace Mover.BL
{
    public class SupplierLocation
    {
        private int serviceId;
        private decimal latitude;
        private decimal longitude;
        private DateTime timestamp;
        private string driverName;  
        private string driver_Phone; 

        public SupplierLocation(int serviceId, decimal latitude, decimal longitude, string driverName, string driver_Phone, DateTime timestamp)
        {
            ServiceId = serviceId;
            Latitude = latitude;
            Longitude = longitude;
            DriverName = driverName;
            Driver_Phone = driver_Phone;
            Timestamp = timestamp;
        }
        public SupplierLocation() { }

        public int ServiceId { get => serviceId; set => serviceId = value; }
        public decimal Latitude { get => latitude; set => latitude = value; }
        public decimal Longitude { get => longitude; set => longitude = value; }
        public string DriverName { get => driverName; set => driverName = value; }
        public string Driver_Phone { get => driver_Phone; set => driver_Phone = value; }
        public DateTime Timestamp { get => timestamp; set => timestamp = value; }


        public enum InsertError
        {
            None
        }



        // Method to get supplier location
        public SupplierLocation GetSupplierLocation(int serviceId)
        {
            DBServices dbs = new DBServices();
            return dbs.GetSupplierLocation(serviceId);
        }



        // Method to update supplier location
        public InsertError UpdateSupplierLocation()
        {
            DBServices dbs = new DBServices();
            dbs.SupplierLocation_Update(this);
            return InsertError.None;
        }



        // Method to delete supplier location
        public int Supplier_Location_Delete(int serviceId)
        {
            DBServices dbs = new DBServices();
            return dbs.SupplierLocation_Delete(serviceId);
        }

    }
}