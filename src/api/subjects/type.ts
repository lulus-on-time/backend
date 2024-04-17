type SubjectRequestBody = {
    name: string,
    students: string[],
    schedules: {
        day: string,
        start: string,
        end: string,
        roomId: number
    }
}

export default SubjectRequestBody;