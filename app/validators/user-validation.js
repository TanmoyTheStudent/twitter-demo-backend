const User= require("../models/user-model")

const userRegisterSchema ={
    username: {
        exists: {
            errorMessage: 'username field is required'
        },
        notEmpty:{
            errorMessage:"username value is required"
        },
        trim:true  
    },
    email:{
        exists: {
            errorMessage: 'email field is required'
        },
        notEmpty:{
            errorMessage:"Email value is required"
        },
        isEmail:{
            errorMessage:"Email should be in a valid format"
        },
        custom:{
            options: async function(value){
                const user = await User.findOne({email:value})
                if(!user){
                    return true
                } else{
                    throw new Error("Email already exists")

                }
            } 
        },
        trim: true,
        normalizeEmail: true 
    },
    password:{
        exists: {
            errorMessage: 'password field is required'
        },
        notEmpty:{
            errorMessage:"Password value is required"
        },
        isLength:{
            options:{min:8,max:128},//options in some validatior
            errorMessage:"Password should be between 8-128 characters"
        }, //isStrongPassword:{},
        trim:true
    }
}

const userLoginSchema= {
    email:{
        exists: {
            errorMessage: 'email field is required'
        },
        trim: true,
        notEmpty:{
            errorMessage:"Email value is required"
        },
        isEmail:{
            errorMessage:"Email should be in a valid format"
        },
        
        normalizeEmail: true
    },
    password:{
        exists: {
            errorMessage: 'password field is required'
        },
        notEmpty:{
            errorMessage:"Password value is required"
        },
        isLength:{
            options:{min:8,max:128},
            errorMessage:"Password should be between 8-128 characters"
        },
        trim:true
    }
}

module.exports={
    userRegisterSchema: userRegisterSchema,
    userLoginSchema : userLoginSchema
}
