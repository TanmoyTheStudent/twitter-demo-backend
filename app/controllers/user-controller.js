//install and require jwt //.env file
const User= require("../models/user-model")
const bcryptjs = require ("bcryptjs")
const jwt=require ("jsonwebtoken")
const _=require('lodash')
const { validationResult }= require("express-validator")
const userCltrs = {}


userCltrs.register= async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    }
    try{

        const body= req.body   //es5 feature
         //const {body}=req --destructuring--es6 feature

         const user= new User(body)
         const salt =await bcryptjs.genSalt()
         const encryptedPassword = await bcryptjs.hash(user.password, salt)
         user.password=encryptedPassword
        
         const userCount = await User.countDocuments() //analyse countDocument in mongoose
         if (userCount === 0) {
            user.role="admin"    
         } 

        await user.save()
        const userInfo=_.pick(user,['username','email','role'])
        res.status(201).json(userInfo)
    }catch(err){
        console.log(err)
        res.status(500).json({error: "Internal Server Error"})
    }

}

//login

userCltrs.login= async(req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() })
    } //.isEmpty , .array are provided by mongoose
    console.log(req.body)
    try{

        const body= req.body   //es5 feature
         //const {body}=req --destructuring--es6 feature

        const user= await User.findOne({ email: body.email })
        if(!user){ //to check if the user with email provided is present in the system
            return res.status(404).json({ error:"invalid email/password" })
        }

        console.log(user)

        const checkPassword = await bcryptjs.compare(body.password, user.password)

        console.log(checkPassword)
        if(!checkPassword){
           
            return res.status(404).json({ error: "invalid email/password"})
        }
        const tokenData = {
            id: user._id,
            role: user.role 
        }
        
        const token= jwt.sign(tokenData, process.env.JWT_SECRET,{ expiresIn: '7d'})

        const userInfo=_.pick(user,['username'])

        res.json({token:token,userInfo})
        //res.json(user)

    }catch(err){
        console.log(err)
        res.status(500).json({error: "Internal Server Error"})
    }

}

//account

userCltrs.account=async (req,res)=>{
    try{
        const user=await User.findById(req.user.id).select({password:0})
        /*In Mongoose, when you use the select() method with findById() or find() queries, you can specify which fields to include or exclude from the query results.

        In the expression select({ password: 0 }), { password: 0 } is an object specifying the fields to exclude from the query results. The 0 indicates that the field should be excluded. */

        res.json(user)

    }catch(err){
        console.log(err)
        res.status(500).json({error: 'Internal server error'})
    }

}

module.exports=userCltrs

