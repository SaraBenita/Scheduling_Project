export class Assignment {
    constructor(assignmentId, label, title, description, dataOfPublished, urgency, fromWhomtheTaskIs, status, dueTime) {
        this.assignmentId = assignmentId;
        this.label = label;
        this.title = title;
        this.description = description;
        this.dataOfPublished = dataOfPublished;  // החלק של התאריך
        this.urgency = urgency;
        this.fromWhomtheTaskIs = fromWhomtheTaskIs;
        this.status = status;
        this.dueTime = dueTime;  // שדה חדש עבור הזמן הספציפי
        this.endTime = this.calculateEndTime(this.dataOfPublished, this.dueTime);
    }


    // שיטה עזר לחישוב זמן הסיום בהתבסס על זמן ההתחלה והמשך (למשל, שעה אחת)
    calculateEndTime(startDate, startTime) {

        // יצירת אובייקט Date מתוך התאריך והזמן הנתונים, באופן מפורש ב-UTC
        const startDateTime = new Date(`${startDate}T${startTime}Z`);  // הוספת 'Z' לצורך אינדיקציה של UTC

        // הוספת שעה אחת לזמן ההתחלה כדי לחשב את זמן הסיום
        startDateTime.setUTCHours(startDateTime.getUTCHours() + 1);

        // החזרת זמן הסיום בפורמט ISO (כלומר, YYYY-MM-DDTHH:mm) ב-UTC
        return startDateTime.toISOString().slice(0, 16); // חיתוך כדי לקבל את הפורמט "YYYY-MM-DDTHH:mm"
    }
}
