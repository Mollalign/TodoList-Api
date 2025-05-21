const {hash,compare} = require('bcryptjs');
const {createHmac}= require('crypto');

// function that will hash the value
module.exports.doHash= async(value,saltValue)=>{
  const result= await hash(value,saltValue);
  return result;
}

// function that compare the hashed value with the un hashed value
module.exports.doHashValidation=async(value,hashedValue)=>{
  const result= await compare(value,hashedValue)
  return result;
}

// function that do hmac hashing
module.exports.hmac=(value,secretKey)=>{
  const result = createHmac("sha256",secretKey).update(value).digest("hex");
  return result;
}