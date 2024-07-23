const Tweet = require("../models/tweet-model");
const User= require("../models/user-model")
// const Like = require("../models/Like");
// const Comment = require("../models/Comment");
// const Retweet = require("../models/Retweet");
// const { cloudinaryLink } = require("../utils/upload");
const { validationResult }= require("express-validator")
const { setTotalTweets } = require("../../config/helper")
const tweetCltrs={}

// Get All Tweets
tweetCltrs.getAllTweets = async (req, res)=> {
  
  try {
    const loadNum = parseInt(req.query.loadNum) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 25; // Number of tweets per page, default is 25

    const totalTweets= await Tweet.countDocuments()
    console.log("total tweets",totalTweets)
    setTotalTweets(totalTweets)
    const tweets = await Tweet.find()
                              .populate('user', 'username')
                              .sort({createdAt:-1})
                              .limit(limit*loadNum)
  
    res.status(200).json({
      status: "success",
      data: {
        tweets,totalTweets
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      msg: err.message
    });
  }
};

// Get Tweet
tweetCltrs.getTweet = async (req, res) => {
  try {
    const tweet = await Tweet.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        tweet
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      msg: err.message
    });
  }
};

//search offices based on city
tweetCltrs.search= async (req,res)=>{
  console.log(req.query)
  const  name = req.query.name||""
  const loadNum = parseInt(req.query.loadNum) || 1; // Current page number, default is 1
    const limit = parseInt(req.query.limit) || 25; // Number of tweets per page, default is 25
  try{
     const users= await User.find({username:{$regex: name,$options:'i'}}).select({_id:1})

     // Step 2: Extract user IDs
     const userIds = users.map(user => user._id);

     // Step 3: Find tweets based on user IDs
     const totalTweets= await Tweet.countDocuments({ user: { $in: userIds } })
    console.log("total Tweets",totalTweets)
    setTotalTweets(totalTweets)
    
     const tweets = await Tweet.find({ user: { $in: userIds } })
       .populate('user', 'username')
       .sort({ createdAt: 1 })
       .limit(limit * loadNum);
 
     res.status(200).json({
       status: "success",
       data: {
         tweets,totalTweets
       }})
  }catch(err){
      console.log(err)
      res.status(500).json({error: "Internal Server error"})
  }
}
// Create Tweet

tweetCltrs.createTweet = async (req, res) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
    const {body,file}=req
    

    try{
        const tweet= new Tweet(body)
        //console.log(tweet)
        console.log(file)
        
        tweet.user=req.user.id
        //image needs to be added separately as it is in req.file, not req.body 
       
        if(file){
        tweet.image=file.path //for only single image
        }
        
        console.log(tweet)
        await tweet.save()
        res.status(201).json(tweet)

    }catch(err){
        console.log(err)
        res.status(500).json({error: "Internal Server error"})
    }

}
// tweetCltrs.createTweet = async (req, res) => {
//     const errors = validationResult(req)
//     if(!errors.isEmpty()){
//         return res.status(400).json({ errors: errors.array() })
//     }
//   try {

//     const user = req.user;
//     // Get Cloudinary Link for Media
//     const mediaLink = await cloudinaryLink(req.file.path);
//     let tweet = await Tweet.create({
//       userId: user._id,
//       text: req.body.text,
//       media: mediaLink.url
//     });
//     tweet = await tweet.populate("userId", "name username").execPopulate();

//     res.status(201).json({
//       status: "success",
//       data: {
//         tweet
//       }
//     });
//   } catch (err) {
//     console.log(err.message);
//     res.status(400).json({
//       status: "fail",
//       msg: err.message
//     });
//   }
// };

// Get Tweets Of User
tweetCltrs.getTweetsOfUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const tweets = await Tweet.find({ user:userId })
      .populate('user', 'username')
      .sort({ createdAt: 1 })
    res.status(200).json({
      status: "success",
      data: {
        length: tweets.length,
        tweets
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({
      status: "fail",
      msg: err.message
    });
  }
};

// Update My Tweet
tweetCltrs.updateMyTweet = async (req, res) => {
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }

  try {
    const tweet = await Tweet.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      {
        new: true
      }
    );
    res.status(200).json({
      status: "success",
      data: {
        tweet
      }
    });
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ status: "error", msg: err.message });
  }
};

// Delete My Tweet

// tweetCltrs.deleteMyTweet = async (req, res) => {
//   try {
//     const tweetId = req.params.id;
//     await Tweet.findOneAndDelete({ _id: tweetId, userId: req.user.id });
//     await Like.deleteMany({ tweetId });
//     await Comment.deleteMany({ tweetId });
//     await Retweet.deleteMany({ tweetId });
//     res
//       .status(204)
//       .json({ status: "success", msg: "Tweet successfully deleted" });
//   } catch (err) {
//     console.log(err.message);
//     res.status(400).json({ status: "error", msg: err.message });
//   }
// };

module.exports=tweetCltrs