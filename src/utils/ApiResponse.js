class APIRessponse {
    constructor(statueCode,data,message="success"){
        this.statueCode= statueCode,
        this.data = data,
        this.message = message,
        this.success = statueCode > 400 
    }
}

export {APIRessponse}