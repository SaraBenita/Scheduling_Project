export class Assignment {
    constructor(assignmentId, label, title, description, dataOfPublished, urgency, fromWhomtheTaskIs, status, dueTime) {
        this.assignmentId = assignmentId;
        this.label = label;
        this.title = title;
        this.description = description;
        this.dataOfPublished = dataOfPublished;  // Date part
        this.urgency = urgency;
        this.fromWhomtheTaskIs = fromWhomtheTaskIs;
        this.status = status;
        this.dueTime = dueTime;  // New field for specific time
    }
}
