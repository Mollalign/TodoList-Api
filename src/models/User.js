// Description => This file contains the schema and model for the users collection.
const mongoose=require("mongoose");

const userSchema=mongoose.Schema({
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
  forgotPasswordCode: {
  type: String,
  select: false,
  },
  forgotPasswordCodeValidation: {
    type: Date,
    select: false,
  }
},{timestamps:true});
module.exports=mongoose.model("User",userSchema);