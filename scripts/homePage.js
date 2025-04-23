// homePage.js
import { Assignment } from '../models/Assignment.js';
import { User } from '../models/User.js';

document.addEventListener("DOMContentLoaded", () => {
    // בונים את הקלנדר
    createCalendar();

    // מגדירים Drag & Drop על כל time-slot
    setupDragAndDrop();

    // טוענים את היוזר המחובר ומעדכנים את התצוגה
    const currentUser = User.getCurrentUser();
    if (currentUser) {
        updateCalendar();
    }

    // לחצן להוספת משימה באופן ידני
    document.getElementById('add-task-button')
        .addEventListener('click', () => openTaskForm());
});


// 1️⃣  בוני את הקלנדר בצורה דינמית
// homePage.js (snippet עם הפונקציה המעודכנת בלבד)

function createCalendar() {
    const container = document.getElementById('calendar-container');
    container.innerHTML = ''; // נקה קודם כל

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

    // wrapper שמכיל עמודת שעות + עמודות ימים
    const wrapper = document.createElement('div');
    wrapper.classList.add('calendar-wrapper');

    // 1) עמודת שעות בצד שמאל
    const hoursCol = document.createElement('div');
    hoursCol.classList.add('hours-column');
    hours.forEach(hour => {
        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour-label');
        hourDiv.textContent = hour;
        hoursCol.appendChild(hourDiv);
    });
    wrapper.appendChild(hoursCol);

    // 2) עמודות הימים
    const calendar = document.createElement('div');
    calendar.id = 'calendar';
    calendar.classList.add('calendar');
    daysOfWeek.forEach(day => {
        const dayDiv = document.createElement('div');
        dayDiv.classList.add('calendar-day');

        // כותרת היום
        const h3 = document.createElement('h3');
        h3.textContent = day;
        dayDiv.appendChild(h3);

        // time slots
        hours.forEach(hour => {
            const slot = document.createElement('div');
            slot.classList.add('time-slot');
            slot.dataset.day = day;
            slot.dataset.hour = hour;
            slot.addEventListener('click', () => openTaskForm(day, hour));
            dayDiv.appendChild(slot);
        });

        calendar.appendChild(dayDiv);
    });
    wrapper.appendChild(calendar);

    container.appendChild(wrapper);
}



// 2️⃣  טען ועשה ריסטרט לכל המשימות במסכים
function updateCalendar() {
    const currentUser = User.getCurrentUser();
    if (!currentUser) return;

    // נקה קודם כל
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.innerHTML = '';
    });

    // עבור כל משימה ביוזר, אתר את המשבצת המתאימה והצג
    currentUser.todolist.forEach(task => {
        const [day, hour] = task.label.split('-');
        const slot = document.querySelector(`.time-slot[data-day="${day}"][data-hour="${hour}"]`);
        if (!slot) return;

        const div = document.createElement('div');
        div.classList.add('event');
        // צבע לפי urgency
        div.style.backgroundColor = task.urgency === 'high' ? 'red' : 'yellow';
        div.textContent = task.title;
        div.draggable = true;
        div.dataset.id = task.assignmentId;

        // לחיצה כפולה למחיקה
        div.addEventListener('dblclick', () => {
            if (confirm('Delete this task?')) {
                const user = User.getCurrentUser();
                user.removeTask(task.assignmentId);
                updateCalendar();
            }
        });

        // גרירה
        div.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', task.assignmentId);
        });

        slot.appendChild(div);
    });
}


// 3️⃣  גרירה ושחרור
function setupDragAndDrop() {
    document.querySelectorAll('.time-slot').forEach(slot => {
        slot.addEventListener('dragover', e => {
            e.preventDefault();
            slot.classList.add('drag-over');
        });
        slot.addEventListener('dragleave', () => {
            slot.classList.remove('drag-over');
        });
        slot.addEventListener('drop', e => {
            e.preventDefault();
            slot.classList.remove('drag-over');

            const taskId = e.dataTransfer.getData('text/plain');
            const user = User.getCurrentUser();
            const task = user.todolist.find(t => t.assignmentId == taskId);
            if (!task) return;

            // עדכן את הלייבל (day-hour) של המשימה
            task.label = `${slot.dataset.day}-${slot.dataset.hour}`;
            user.saveToLocalStorage();
            updateCalendar();
        });
    });
}


// 4️⃣  פתיחת טופס הוספה/עריכה  
//     אם day/hour ידועים – מוסיף שם, אחרת שואל גם day/hour
function openTaskForm(day = null, hour = null) {
    const user = User.getCurrentUser();
    if (!user) { alert('Please log in first'); return; }

    // בחר יום ושעה אם לא נשלחו
    if (!day || !hour) {
        day = prompt('Enter day (Sunday–Friday):');
        hour = prompt('Enter hour (08:00–18:00):');
    }

    const title = prompt('Task title:');
    if (!title) return;

    const description = prompt('Description:');
    const label = `${day}-${hour}`;
    const urgency = prompt('Urgency? (high/normal)').toLowerCase() === 'high' ? 'high' : 'normal';
    const fromWhom = prompt('From whom?');

    const task = new Assignment(
        Date.now(),
        label,
        title,
        description,
        new Date().toISOString(),
        urgency,
        fromWhom,
        'open'
    );
    user.addTask(task);
    updateCalendar();
}
