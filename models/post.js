const mongoose=require("mongoose");



const postSchema = mongoose.Schema({

    content:String,
    user:[ { type:mongoose.Schema.Types.ObjectId, ref: "user"}]
})

 module.exports= mongoose.model("post",postSchema)