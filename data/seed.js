import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';

// פונקציה לאתחול נתונים ראשוניים בלוקאל סטורג
function seedUserWithAssignments() {
    // יוצרים משימות
    const assignments = [
        new Assignment(1, "עבודה", "להגיש דו\"ח", "דו\"ח שבועי למחלקת כספים", "2025-04-23", "גבוה", "אבשלום", "פתוח", "09:00"),
        new Assignment(2, "לימודים", "לסיים מטלה", "מטלה בקורס תכנות", "2025-04-20", "בינוני", "אבשלום", "פתוח", "10:00"),
        new Assignment(3, "אישי", "לקנות מתנה", "מתנה ליום הולדת", "2025-04-25", "נמוך", "אבשלום", "פתוח", "All day")
    ];

    // יוצרים משתמש ומצמידים לו את המשימות
    const user = new User(
        1,
        "bob",
        "bob@example.com",
        "123456"
    );

    // שמירת המשימות בתוך המשתמש
    user.todolist = assignments;

    // שמירה בלוקאל סטורג'
    localStorage.setItem("users", JSON.stringify([user]));
}


if (!localStorage.getItem("users")) {
    seedUserWithAssignments();

}
