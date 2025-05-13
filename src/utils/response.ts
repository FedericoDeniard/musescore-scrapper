export class HttpError extends Error {
    status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
    }
}

export class ResponseObject<T> {
    constructor(
        public success: boolean,
        public message: string,
        public data: T
    ) { }
}
