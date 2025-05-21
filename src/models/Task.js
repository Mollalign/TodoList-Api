// Description => Model for todo
const mongoose=require("mongoose");
const todoSchema= mongoose.Schema({
    title:{
      type:String,
      required:[true,"Title is required"],
      trim:true
    },
    description:{
      type:String,
      required:[true,"Description is required"],
      trim:true
    },
    completed:{
      type:Boolean,
      default:false
    },
    priorityLevel:{
      type:Number,
      required:true,
      validate:{
        validator:(value)=>value>=0 && value<=10,
        message:"Priority level should be between 0 and 10"
      },
      default:0
    },
    userId:{
      type:mongoose.Schema.Types.ObjectId,
      required:true,
      ref:"User",
      select:false
    }
},{timestamps:true});

module.exports=mongoose.model("Todo",todoSchema);