class expressError extends Error{
    constructor(message,statusCode){
        super(message);
        
        this.statusCode = statusCode;
        
    }
}

export {expressError};