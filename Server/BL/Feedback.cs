using Mover.DAL;

namespace Mover.BL
{
    public class Feedback
    {
         int feedback_id;
         int cId;
         int sId;
         int rate;
         string description;
         DateTime feedbackDate;


        public int Feedback_id { get => feedback_id; set => feedback_id = value; }
        public int CId { get => cId; set => cId = value; }
        public int SId { get => sId; set => sId = value; }
        public int Rate { get => rate; set => rate = value; }
        public string Description { get => description; set => description = value; }
        public DateTime FeedbackDate { get => feedbackDate; set => feedbackDate = value; }

        public Feedback() { }

        public Feedback(int feedback_id, int cId, int sId, int rate, string description, DateTime feedbackDate)
        {
            Feedback_id = feedback_id;
            CId = cId;
            SId = sId;
            Rate = rate;
            Description = description;
            FeedbackDate = feedbackDate;
        }


        public enum InsertError
        {
            None
        }


        // Method to to get all feedbacks by supplier id 
        public List<Feedback> readFeedback(int s_id)
        {
            DBServices dbs = new DBServices();
            return dbs.readAllFeedback(s_id);
        }


        // Method to insert a new feedback 
        public InsertError addFeedback()
        {
            DBServices dbs = new DBServices();
            dbs.Feedback_Insert(this);
            return InsertError.None;
        }

    }
}
