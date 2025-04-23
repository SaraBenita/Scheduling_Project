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


export function logoutUser() {
    localStorage.removeItem("currentUser"); // Clear user data from localStorage
    document.location.href = "homePage.html"; // Redirect to registration page
}
