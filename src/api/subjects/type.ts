type SubjectRequestBody = {
    name: string,
    students: string[],
    schedules: {
        day: number,
        start: string,
        end: string,
        roomId: number
    }
}

export default SubjectRequestBody;