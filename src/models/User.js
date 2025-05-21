// Description => This file contains the schema and model for the users collection.
const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
  userName:{
    type:String,
    required:[true,"User name is required"],
    unique:[true,"User name should be unique"],
    trim:true,
    minLength:[3,"User name should be at least 3 characters long"],
    maxLength:[20,"User name should be at most 20 characters long"],
    lowercase:true
  },
  email:{
    type:String,
    required:[true,"Email is required"],
    trim:true,
    unique:[true,"Email should be unique"],
    minLength:[5,"Email should be at least 5 characters long"],
    maxLength:[50,"Email should be at most 50 characters long"],
    lowercase:true
  },
  password:{
    type:String,
    required:[true,"Password is required"],
    trim:true,
    select:false
  },
  verified:{
    type:Boolean,
    default:false
  },
  verificationCode:{
    type:String,
    select:false,
  },
  verificationCodeValidation:{
    type:Number,
    select:false
  },
  forgotPasswordCode:{
    type:String,
    select:false
  },
  forgotPasswordCodeValidation:{
    type:Number,
    select:false
  }

},{timestamps:true});
module.exports=mongoose.model("User",userSchema);