import { Assignment } from '../models/Assignment.js';
import { getCurrentUser, loadUserTodoList, logoutUser, saveAssignmentToUser, editAssignmentOfUser, deleteAssignmentFromUser } from '../utils/functions.js';

let calendar;

document.addEventListener('DOMContentLoaded', function () {
    const user = getCurrentUser();
    if (!user) return document.location.href = "registryPage.html";

    const userEmail = document.getElementById("user-email");
    userEmail.dir = "rtl";
    userEmail.textContent = `${user.userName}`;

    const todoList = loadUserTodoList(user.email);
    const calendarEl = document.getElementById("calendar");

    // Initialize FullCalendar
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridWeek',
        locale: 'he',
        timeZone: 'Asia/Jerusalem',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: todoList.map(assignment => {
            const startDateTime = `${assignment.dataOfPublished}T${assignment.dueTime}`;

            return {
                id: assignment.assignmentId, // מזהה ייחודי של המשימה
                title: assignment.title, // כותרת המשימה
                start: startDateTime, // תאריך ושעת התחלה
                end: assignment.endTime, // תאריך ושעת סיום
                color: assignment.status === 'פתוח' ? 'green' : assignment.status === 'בוצע' ? 'gray' : 'red', // צבע לפי סטטוס
                extendedProps: { // מאפיינים מותאמים אישית
                    description: assignment.description,
                    label: assignment.label,
                    urgency: assignment.urgency,
                    status: assignment.status,
                    fromWhomtheTaskIs: assignment.fromWhomtheTaskIs,
                    priority: assignment.priority
                }
            };
        }),
        eventClick: function (info) {
            // מציאת המודל
            const editModal = new bootstrap.Modal(document.getElementById('editEventModal'));

            console.log(info.event);
            // מילוי השדות במידע הקיים
            document.getElementById('editId').value = info.event.id;
            document.getElementById('editTitle').value = info.event.title;
            document.getElementById('editDescription').value = info.event.extendedProps.description;
            document.getElementById('editDate').value = info.event.start.toISOString().split('T')[0];
            document.getElementById('editTimeSelect').value;
            document.getElementById('editPriority').value = info.event.extendedProps.priority || 'בינוני';
            document.getElementById('editLabel').value = info.event.extendedProps.label || '';
            document.getElementById('editStatus').value = info.event.extendedProps.status || 'פתוח';
            document.getElementById('editFromWhom').value = info.event.extendedProps.fromWhomtheTaskIs || '';

            console.log(info.event.start.toISOString().split('T')[0], info.event.start.toISOString().split('T')[1].slice(0, 5));
            // פתיחת המודל
            editModal.show();

            disableOccupiedHoursEditForm(); // הסתר שעות תפוסות שנבחרו

            // טיפול בכפתור המחיקה
            const deleteButton = document.getElementById('DeleteButton');
            deleteButton.onclick = function () {
                // מחיקת האירוע מהקלנדר
                info.event.remove();

                // מחיקת המשימה מרשימת המשימות
                const user = getCurrentUser();
                if (user) {
                    const success = deleteAssignmentFromUser(user.email, info.event.id);
                    if (!success) {
                        alert("לא הצלחנו למחוק את המשימה.");
                    }
                }

                alert("המשימה נמחקה בהצלחה!")


                // סגירת המודל
                editModal.hide();
            };

            // טיפול בשמירת הנתונים
            const editForm = document.getElementById('editEventForm');
            editForm.onsubmit = function (e) {
                e.preventDefault();

                // יצירת אובייקט משימה מעודכן
                const updatedAssignment = {
                    assignmentId: document.getElementById('editId').value,
                    title: document.getElementById('editTitle').value,
                    description: document.getElementById('editDescription').value,
                    dataOfPublished: document.getElementById('editDate').value,
                    dueTime: document.getElementById('editTimeSelect').value,
                    label: document.getElementById('editLabel').value,
                    urgency: document.getElementById('editPriority').value,
                    status: document.getElementById('editStatus').value,
                    fromWhomtheTaskIs: document.getElementById('editFromWhom').value
                };


                // יצירת מחרוזת זמן-תאריך התחלה (בפורמט ISO)
                const startDateTimeUTC = `${updatedAssignment.dataOfPublished}T${updatedAssignment.dueTime}Z`; // הוספת 'Z' לצורך אינדיקציה של זמן UTC

                // המרת מחרוזת הזמן לאובייקט Date (הזמן יהיה ב-UTC)
                const startDateUTC = new Date(startDateTimeUTC);

                // הוספת 3 שעות כדי להמיר מ-UTC לזמן ישראל (זמן קיץ ישראלי הוא UTC+3)
                const endDateUTC = new Date(startDateUTC);
                endDateUTC.setHours(startDateUTC.getHours() + 1); // הוספת שעה אחת למשך האירוע
                startDateUTC.setHours(startDateUTC.getHours()); // הוספת 3 שעות למרחק הזמן של אזור הזמן של ישראל

                // פורמט של תאריכים התחלה וסיום כפי שנדרש (למשל "2025-04-28 11:00" עבור זמן ישראל)
                const formattedStartDate = startDateUTC.toISOString().replace('T', ' ').slice(0, 16); // "2025-04-28 11:00"
                const formattedEndDate = endDateUTC.toISOString().replace('T', ' ').slice(0, 16); // "2025-04-28 12:00"

                console.log(`Start: ${formattedStartDate}, End: ${formattedEndDate}`);



                // עדכון האירוע בקלנדר
                info.event.setProp('title', updatedAssignment.title);
                info.event.setExtendedProp('description', updatedAssignment.description);
                info.event.setStart(formattedStartDate);
                info.event.setEnd(formattedEndDate);
                info.event.setExtendedProp('priority', updatedAssignment.urgency);
                info.event.setExtendedProp('label', updatedAssignment.label);
                info.event.setExtendedProp('status', updatedAssignment.status);
                info.event.setExtendedProp('fromWhomtheTaskIs', updatedAssignment.fromWhomtheTaskIs);
                let newColor;
                switch (updatedAssignment.status) {
                    case 'פתוח':
                        newColor = 'green';
                        break;
                    case 'בוצע':
                        newColor = 'gray';
                        break;
                    default:
                        newColor = 'red';
                }

                info.event.setProp('backgroundColor', newColor);
                info.event.setProp('borderColor', newColor);





                const user = getCurrentUser();
                if (user) {
                    const success = editAssignmentOfUser(user.email, updatedAssignment);
                    if (!success) {
                        alert("לא הצלחנו לשמור את המשימה המעודכנת.");
                    }
                }

                alert("המשימה עודכנה בהצלחה!");


                // סגירת המודל
                editModal.hide();
            };
        },
        views: {
            timeGridWeek: {
                slotMinTime: "08:00:00", // Start time: 08:00 AM
                slotMaxTime: "18:00:00", // End time: 06:00 PM
            },
            timeGridDay: {
                slotMinTime: "08:00:00", // Start time: 08:00 AM
                slotMaxTime: "18:00:00", // End time: 06:00 PM
            }
        }
    });

    calendar.render();

    const logoutButton = document.getElementById("logoutButton");
    logoutButton.addEventListener("click", function () {

        logoutUser();
    });


    function disableOccupiedHoursCreateForm() {
        const timeSelect = document.getElementById("dueTimeSelect"); // Select element
        const selectedDate = document.getElementById("dataOfPublished").value; // Get the selected date

        // Load the user's todo list (this should return the current assignments)
        const user = getCurrentUser();
        const todoList = loadUserTodoList(user.email);

        // Clear the previous options before adding new ones
        timeSelect.innerHTML = '';

        // Get all available time slots from 08:00 to 18:00
        const availableTimes = Array.from({ length: 11 }, (_, i) => {
            const hour = String(i + 8).padStart(2, '0');
            return `${hour}:00`;
        });

        // Loop through each available time and check if it's occupied by an assignment on the selected date
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;

            // If the time is already occupied on the selected date, disable it
            if (todoList.some(assignment => assignment.dueTime === time && assignment.dataOfPublished === selectedDate)) {
                option.disabled = true;
            }

            // Add the option to the select dropdown
            timeSelect.appendChild(option);
        });
    }

    function disableOccupiedHoursEditForm() {
        const timeSelect = document.getElementById("editTimeSelect"); // Select element for time
        const selectedDate = document.getElementById("editDate").value; // Get the selected date from the editDate input field

        // Load the user's todo list (this should return the current assignments)
        const user = getCurrentUser();
        const todoList = loadUserTodoList(user.email);

        // Clear the previous options before adding new ones
        timeSelect.innerHTML = '';

        // Get all available time slots from 08:00 to 18:00
        const availableTimes = Array.from({ length: 11 }, (_, i) => {
            const hour = String(i + 8).padStart(2, '0');
            return `${hour}:00`;
        });

        // Loop through each available time and check if it's occupied by an assignment on the selected date
        availableTimes.forEach(time => {
            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;

            // If the time is already occupied on the selected date, disable it
            if (todoList.some(assignment => assignment.dueTime === time && assignment.dataOfPublished === selectedDate)) {
                option.disabled = true;
            }

            // Add the option to the select dropdown
            timeSelect.appendChild(option);
        });
    }


    // קריאה לפונקציה זו כאשר המשתמש בוחר תאריך
    document.getElementById("dataOfPublished").addEventListener("change", function () {
        disableOccupiedHoursCreateForm();
    });

    // קריאה לפונקציה כדי להשבית זמנים תפוסים    

    disableOccupiedHoursEditForm();



    // Get references to the modal and the button
    const newAssignmentBtn = document.getElementById("newAssignmentBtn");
    const createModal = document.getElementById("createModal");

    // Add an event listener to the button to show the modal
    newAssignmentBtn.addEventListener("click", () => {
        createModal.classList.remove("hidden");
    });

    const closeNodal = document.getElementById("close-modal");
    // Add an event listener to the modal to close it when clicking outside
    closeNodal.addEventListener("click", (e) => {

        createModal.classList.add("hidden");

    });




});

// ✅ Form handler outside but can access `calendar` from outer scope
document.getElementById("assignmentForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const user = getCurrentUser();
    if (!user) return document.location.href = "loginPage.html";

    const newAssignment = new Assignment(
        Date.now(),
        document.getElementById("label").value,
        document.getElementById("title").value,
        document.getElementById("description").value,
        document.getElementById("dataOfPublished").value, // Date part
        document.getElementById("priority").value,
        user.email,
        "פתוח",// status
        document.getElementById("dueTimeSelect").value  // Time part (assuming you are using a <select> now)
    );

    const success = saveAssignmentToUser(user.email, newAssignment);
    if (!success) {
        alert("לא הצלחנו לשמור את המשימה.");
    }

    const createModal = document.getElementById("createModal");

    createModal.classList.add("hidden");



    alert("המשימה נשמרה בהצלחה!")


    // Combine date and time for the start property
    const startDateTime = `${newAssignment.dataOfPublished}T${newAssignment.dueTime}`;

    calendar.addEvent({
        title: newAssignment.title,
        start: startDateTime,  // Use the combined date and time
        end: newAssignment.endTime,
        description: newAssignment.description,
        priority: newAssignment.urgency,
        status: newAssignment.status,
        color: "green"
    });

    // Clear form
    e.target.reset();


});


