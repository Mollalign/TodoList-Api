const jwt= require("jsonwebtoken");

module.exports.identification= async(req,res,next) => {
let token;
if(req.client==="not-browser"){
  token=req.headers.authorization;
}else{
  token=req.cookies.Authorization;
}
if(!token){
  return res.status(403).json({success:false,message:"Unauthorized"});
}
try {
  const decoded=jwt.verify(token.split(" ")[1],process.env.SECRET_KEY);

  if(decoded){
    req.user=decoded;
    next();
  }else{
    return res.status(400).json({success:false,message:"Invalid token"})
  }
    
} catch (error) {
  console.log(error);
}

}