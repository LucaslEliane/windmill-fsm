export class ParametersError extends Error {
    constructor(m: string) {
        super(m);

        Object.setPrototypeOf(this, ParametersError.prototype);
    
        this.name = 'ParametersError'
    }
}

export class TransitionError extends Error {
    constructor(m: string) {
        super(m);

        Object.setPrototypeOf(this, TransitionError.prototype);

        this.name = 'TransitionError'

        Error.captureStackTrace(this, this.constructor);
    }
}