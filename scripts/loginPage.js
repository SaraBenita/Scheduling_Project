import { loadUsers } from "../utils/functions.js";

document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        // Retrieve users array from Local Storage
        const users = loadUsers();

        // Find user by email
        const storedUser = users.find(user => user.email === email);

        if (storedUser && storedUser.password === password) {
            // Save the current user to Local Storage
            localStorage.setItem("currentUser", JSON.stringify(storedUser));

            alert("Login successful!");
            // Redirect to the home page
            window.location.href = "calendarPage.html";
        } else {
            // Show an alert with options
            const retry = confirm("Invalid email or password. Would you like to register?");
            if (retry) {
                // Redirect to the registration page
                window.location.href = "registryPage.html";
            } else {
                alert("Please try logging in again.");
            }
        }
    });
});