using System.ComponentModel.DataAnnotations;

namespace TaskManangerWebAPI.Models
{
    public class TaskItem
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Task Title ထည့်သွင်းရန် လိုအပ်ပါသည်။")]
        [StringLength(100, MinimumLength = 3, ErrorMessage = "Title သည် အနည်းဆုံး ၃ လုံးမှ အများဆုံး စာလုံး ၁၀၀ အတွင်း ရှိရပါမည်။")]
        public string Title { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Description သည် စာလုံးရေ ၅၀၀ ထက် မပိုရပါ။")]
        public string Description { get; set; } = string.Empty;

        public bool IsCompleted { get; set; }
    }
}