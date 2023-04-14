const {constants} = require("../constants")

const errorHandler = (err,req,res,next) =>{

    const statusCode = res.statusCode ? res.statusCode:500;
    let title="";
    switch(statusCode){
        case constants.VALIDATION_ERROR:
            title = "Validation Error";
            break;
        case constants.NOT_FOUND:
            title= "Not Found";
            break;
        case constants.FORBIDDEN:
            title= "Forbidden";
            break;
        case constants.UNAUTHORIZED:
            title= "Authorization Error";
            break;
        case constants.SERVER_ERROR:
            title= "Server Error";
            break;
        default:
            title="No error";
            break;
    }
    res.json({
        title,
        message:err.message
    })
}

module.exports = errorHandler