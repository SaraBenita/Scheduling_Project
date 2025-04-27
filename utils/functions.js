export function loadUserTodoList(email) {

    const users = JSON.parse(localStorage.getItem("users") || []);
    const user = users.find(u => u.email === email);

    if (!user) {
        console.warn(`User with email ${email} not found.`);
        return [];
    }

    return user.todolist || [];
}

export function loadUsers() {

    return JSON.parse(localStorage.getItem("users") || []);
}

export function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser") || null);
}

export function saveAssignmentToUser(email, assignment) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        console.warn(`User with email ${email} not found.`);
        return false;
    }

    if (!users[userIndex].todolist) {
        users[userIndex].todolist = [];
    }

    users[userIndex].todolist.push(assignment);
    localStorage.setItem("users", JSON.stringify(users));
    return true;
}

export function editAssignmentOfUser(email, assignment) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email === email);

    console.log(assignment);
    console.log(userIndex);
    if (userIndex === -1) {
        console.warn(`User with email ${email} not found.`);
        return false;
    }

    const userTodoList = users[userIndex].todolist;
    console.log(userTodoList);
    if (!userTodoList) {
        console.warn(`Todo list not found for user with email ${email}.`);
        return false;
    }

    // // מציאת המשימה המתאימה ועדכונה
    const assignmentIndex = userTodoList.findIndex(a => a.assignmentId == assignment.assignmentId);
    if (assignmentIndex === -1) {
        console.warn(`Assignment with id ${assignment.assignmentId} not found.`);
        return false;
    }

    // // עדכון המשימה
    users[userIndex].todolist[assignmentIndex] = assignment;
    console.log(users)
    // // שמירת המשתמשים המעודכנים ב-LocalStorage
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

    return true;
}

export function deleteAssignmentFromUser(email, assignmentId) {
    const users = loadUsers();
    const userIndex = users.findIndex(u => u.email === email);

    if (userIndex === -1) {
        console.warn(`User with email ${email} not found.`);
        return false;
    }

    const userTodoList = users[userIndex].todolist;
    if (!userTodoList) {
        console.warn(`Todo list not found for user with email ${email}.`);
        return false;
    }

    // מחיקת המשימה לפי ה-ID
    const assignmentIndex = userTodoList.findIndex(a => a.assignmentId === assignmentId);
    if (assignmentIndex === -1) {
        console.warn(`Assignment with id ${assignmentId} not found.`);
        return false;
    }

    userTodoList.splice(assignmentIndex, 1);

    // שמירת המשתמשים המעודכנים ב-LocalStorage
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(users[userIndex]));

    return true;
}

export function logoutUser() {
    localStorage.removeItem("currentUser"); // Clear user data from localStorage
    document.location.href = "homePage.html"; // Redirect to registration page
}
