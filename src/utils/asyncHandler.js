// when connect db we have to cover it  (higher_Order_Fuction)

//with promises

const asyncHandler = (reqestHandler) =>{
    return (req,res,next) => {
        Promise.resolve(reqestHandler(req,res,next)).catch((err) => {next(err)})
    }
}
/*


// with try and catch cover
const asyncHandler = (reqestHandler) => async (req,res,next) => {
    try {
        await reqestHandler(res,res,next())
    } catch (error) {
        res.status(err.code || 500).json({
            sueess : failed,
            message:Array.message
        })
    }
}

*/

export  {asyncHandler}