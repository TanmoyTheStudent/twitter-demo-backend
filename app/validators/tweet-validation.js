const tweetValidationSchema ={
    text: {
        exists: {
            errorMessage: 'text field is required'
        },
        notEmpty:{
            errorMessage:"text can not be empty"
        },
        trim:true  
    }

}

module.exports = tweetValidationSchema