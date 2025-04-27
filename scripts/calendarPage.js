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
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        events: todoList.map(assignment => {
            const startDateTime = new Date(`${assignment.dataOfPublished}T${assignment.dueTime}`);
            return {
                id: assignment.assignmentId, // מזהה ייחודי של המשימה
                title: assignment.title, // כותרת המשימה
                start: startDateTime, // תאריך ושעת התחלה
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

            // מילוי השדות במידע הקיים
            document.getElementById('editId').value = info.event.id;
            document.getElementById('editTitle').value = info.event.title;
            document.getElementById('editDescription').value = info.event.extendedProps.description;
            document.getElementById('editDate').value = info.event.start.toISOString().split('T')[0];
            document.getElementById('editTime').value = info.event.start.toISOString().split('T')[1].slice(0, 5);
            document.getElementById('editPriority').value = info.event.extendedProps.priority || 'בינוני';
            document.getElementById('editLabel').value = info.event.extendedProps.label || '';
            document.getElementById('editStatus').value = info.event.extendedProps.status || 'פתוח';
            document.getElementById('editFromWhom').value = info.event.extendedProps.fromWhomtheTaskIs || '';

            // פתיחת המודל
            editModal.show();

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
                    dueTime: document.getElementById('editTime').value,
                    label: document.getElementById('editLabel').value,
                    urgency: document.getElementById('editPriority').value,
                    status: document.getElementById('editStatus').value,
                    fromWhomtheTaskIs: document.getElementById('editFromWhom').value
                };

                // עדכון האירוע בקלנדר
                info.event.setProp('title', updatedAssignment.title);
                info.event.setExtendedProp('description', updatedAssignment.description);
                info.event.setStart(new Date(`${updatedAssignment.dataOfPublished}T${updatedAssignment.dueTime}`));
                info.event.setExtendedProp('priority', updatedAssignment.urgency);
                info.event.setExtendedProp('label', updatedAssignment.label);
                info.event.setExtendedProp('status', updatedAssignment.status);
                info.event.setExtendedProp('fromWhomtheTaskIs', updatedAssignment.fromWhomtheTaskIs);


                const user = getCurrentUser();
                if (user) {
                    const success = editAssignmentOfUser(user.email, updatedAssignment);
                    if (!success) {
                        alert("לא הצלחנו לשמור את המשימה המעודכנת.");
                    }
                }

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
        document.getElementById("dueTime").value  // Time part
    );

    const success = saveAssignmentToUser(user.email, newAssignment);
    if (!success) {
        alert("לא הצלחנו לשמור את המשימה.");
    }

    // Add event to calendar

    // Combine date and time for the start property
    const startDateTime = new Date(`${newAssignment.dataOfPublished}T${newAssignment.dueTime}`);

    calendar.addEvent({
        title: newAssignment.title,
        start: startDateTime,  // Use the combined date and time
        description: newAssignment.description,
        priority: newAssignment.urgency,
        status: newAssignment.status,
        color: "green"
    });

    // Clear form
    e.target.reset();
});
