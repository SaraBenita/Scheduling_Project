
export class User {
    constructor(userId, userName, email, password, todolist = []) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.todolist = todolist; // רשימת המשימות
    }
    

    /* addTask(task) {
         this.todolist.push(task);
         this.saveToLocalStorage();
     }
 
     removeTask(taskId) {
         this.todolist = this.todolist.filter(task => task.assignmentId !== taskId);
         this.saveToLocalStorage();
     }
 
     saveToLocalStorage() {
         let users = JSON.parse(localStorage.getItem('users')) || [];
         const index = users.findIndex(user => user.userId === this.userId);
         const userData = {
             userId: this.userId,
             userName: this.userName,
             email: this.email,
             password: this.password,
             todolist: this.todolist,
         };
         if (index !== -1) {
             users[index] = userData;
         } else {
             users.push(userData);
         }
         localStorage.setItem('users', JSON.stringify(users));
     }
 
     static setCurrentUser(userId) {
         localStorage.setItem('currentUser', userId);
     } */
}