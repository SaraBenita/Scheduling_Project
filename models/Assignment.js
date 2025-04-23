

export class Assignment {
    constructor(assignmentId, label, title, description, dataOfPublished, urgency, fromWhomtheTaskIs, status) {
        this.assignmentId = assignmentId;
        this.label = label;
        this.title = title;
        this.description = description;
        this.dataOfPublished = dataOfPublished;
        this.urgency = urgency;
        this.fromWhomtheTaskIs = fromWhomtheTaskIs;
        this.status = status;
    }
}
