import { User } from './utils/classes.js';

document.addEventListener("DOMContentLoaded", () => {
    const registrationForm = document.getElementById("registrationForm");

    registrationForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const userName = document.getElementById("userName").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Retrieve existing users from Local Storage
        const users = JSON.parse(localStorage.getItem("users")) || [];

        // Check if the email already exists
        const userExists = users.some(user => user.email === email);

        if (userExists) {
            alert("A user with this email already exists. Please log in.");
            return;
        }

        // Generate a new userId (incremental index)
        const userId = users.length > 0 ? users[users.length - 1].userId + 1 : 1;

        // Create a new user
        const newUser = new User(userId, userName, email, password);

        // Add the new user to the users array
        users.push(newUser);

        // Save the updated users array to Local Storage
        localStorage.setItem("users", JSON.stringify(users));

        alert("Registration successful! You can now log in.");
        // Redirect to the login page
        window.location.href = "loginPage.html";
    });
});