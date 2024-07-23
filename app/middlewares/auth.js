const jwt= require("jsonwebtoken")

const authenticateUser = (req,res,next)=>{
    const token = req.headers['authorization']
    if(!token){
        return res.status(401).json({error:"token is required"})
        
    }
    try{
        const tokenData=jwt.verify(token, process.env.JWT_SECRET)
        req.user={
            id: tokenData.id,
            role: tokenData.role
        }
        console.log(req.user)
        next()
    }catch(err){
        console.log(err)
        res.status(401).json({error: err.message })
    }

}

const authorizeUser =(permittedRoles)=>{
    return (req,res,next) =>{
        if(permittedRoles.includes(req.user.role)){
            next()
            console.log(`authorize confirmed,${req.user.role}`)
        }else{
            res.status(403).json({error:"you are not authorized to access this"})
        }
    }
}

module.exports={
    authenticateUser:authenticateUser,
    authorizeUser:authorizeUser
}