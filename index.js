//.env file setup
require('dotenv').config()

//primary server set-up
const express=require("express")
const cors=require("cors")
const app=express()
const port=process.env.PORT|| 3100
const http = require('http');
const socketIo = require('socket.io');

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:3000", // Allow requests from your frontend domain
        methods: ["GET", "POST"],
        credentials: true
    }
});


const configureDB=require("./config/db")
configureDB()

app.use(cors())
app.use(express.json())

const { getTotalTweets } = require("./config/helper")


// Socket.IO connection handler
io.on('connection', (socket) => {
    console.log('a user connected');

    io.emit("firstEvent","Hello this is a test")

    socket.on("sendNotification", ({ search,socketId}) => {
      
        const updatedTotalTweets = getTotalTweets()
        console.log("Emitting updated total tweets:", updatedTotalTweets)
        console.log("socket id is",socketId)
         io.to(socketId).emit("getNotification",{search,totalTweets:updatedTotalTweets})
      });
   
    
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });

  
  

});

//multer set-up
const path=require('path')
const multer = require('multer')
//Define storage for the uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/images') // Directory where uploaded files will be stored
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname) // File name format: timestamp-originalname
    }
});

//Initialize Multer instance
const upload = multer({ storage: storage });
app.use('/uploads/images',express.static(path.join(__dirname,'uploads/images')))


//user registration and login routes

//requiring validators and controllers

const {checkSchema}=require("express-validator")
const { userRegisterSchema,
userLoginSchema}=require("./app/validators/user-validation")

const userCltrs=require("./app/controllers/user-controller")
app.post("/api/users/register",checkSchema(userRegisterSchema),userCltrs.register)
app.post('/api/users/login',checkSchema(userLoginSchema),userCltrs.login)

//requiring authenticateUser & authorizeUser
const {authenticateUser, authorizeUser}=require("./app/middlewares/auth")
app.get('/api/users/account',authenticateUser,userCltrs.account)




//tweet-routes

const tweetCltrs=require("./app/controllers/tweet-controller")
const tweetValidationSchema=require("./app/validators/tweet-validation")


app.get("/api/tweets",tweetCltrs.getAllTweets)
app.get('/api/tweets/search',tweetCltrs.search)
app.get('/api/tweets/my',authenticateUser,authorizeUser(['user']),tweetCltrs.getTweetsOfUser)
app.get("/api/tweets/:id",tweetCltrs.getTweet)

//app.post("/api/spaces",upload.single('image'),spaceCltrs.create)
app.post("/api/tweets",authenticateUser,authorizeUser(['user']),upload.single('image'),checkSchema(tweetValidationSchema),tweetCltrs.createTweet)
app.put("/api/tweets/:id",authenticateUser,authorizeUser(['user']),upload.single('image'),checkSchema(tweetValidationSchema),tweetCltrs.updateMyTweet)

//app.delete("/api/tweets/:id",authenticateUser,authorizeUser(['user']),spaceCltrs.paidAmenities) //validation required, make another validation in space validation for this route


server.listen(port,()=>{
    console.log("server connected to the port no",port)
})

