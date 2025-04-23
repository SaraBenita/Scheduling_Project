import { Assignment } from '../models/Assignment.js';
import { getCurrentUser, loadUserTodoList, logoutUser, saveAssignmentToUser } from '../utils/functions.js';

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
                title: assignment.title,
                start: startDateTime,
                description: assignment.description + `\n נוצר על ידי ${assignment.fromWhomtheTaskIs}`,
                color: assignment.status === 'פתוח' ? 'green' : assignment.status === 'בוצע' ? 'gray' : 'red'
            };
        }),
        eventClick: function (info) {
            alert(
                `כותרת: ${info.event.title}\n` +
                `תיאור: ${info.event.extendedProps.description}`
            );
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
