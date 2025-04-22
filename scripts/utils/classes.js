;
export class User {
    constructor(userId, userName, email, password) {
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.password = password;
        this.todolist = [];
    }
}
export class Assignment {
    constructor(assignmentId, title, description, dataOfPublished, status) {
        this.assignmentId = assignmentId;
        this.title = title;
        this.description = description;
        this.dataOfPublished = dataOfPublished;
        this.status = status;
    }
}
