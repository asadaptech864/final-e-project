import Users from '../Modals/UsersModal.mjs'
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'  

// Get all rooms
let getAllUsers=async(req,res)=>{
    try {
    let users = await Users.find();
    if (users.length == 0) {
           res.status(404).json({message:"No Users found"});
    } else {
    
        res.status(200).json({
        message:"Our Users",
        users:users,
    })
    } 
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }


// Add a new Sign Up
        let addUser=async(req,res)=>{
            try {
                let user = await Users.find({email: req.body.email});
                if (user.length == 1) {
                    res.status(404).json({message:"User already exists"});
                } else {
                    bcrypt.hash(req.body.password, 15).then(async function(hash){
                        let newUser = new Users({
                            name:req.body.name,
                            email:req.body.email,
                            password:hash,
                            role:req.body.role,
                            isActive:req.body.isActive,

                            });
                       let adduser = await Users.insertOne(newUser);
                       if (!adduser) {
                              res.status(404).json({message:"Failed to add User"});
                       } else {
                           res.status(200).json({
                           message:"User added successfully",
                           user:adduser,
                       })
                       } 
                    })
                }
          
            
            } catch (error) {
               console.log(error) ;
               res.status(500).json({message:"Internal server errror"});
            }
            }
            
// Login User
let LoginUser=async(req,res)=>{
    try {
        let checkUser = await Users.findOne({email:req.body.email});
if (checkUser.length == 0) {
    res.status(404).json({message:"User not found. Please register now...."});
} else {
    const match = bcrypt.compareSync(req.body.password, checkUser.password);
    if(match) {
        const token = await jwt.sign({email: checkUser.email, _id: checkUser._id},process.env.JWT_SECRET,{ expiresIn: '12h'})
        res.cookie("token",token, { maxAge: 43200, httpOnly: true})
        res.status(200).json({
            message:"User Login successfully",
            user:checkUser,
            token:token,
        })
    } else {
        res.status(404).json({message:"Invalid Credentials"});
    }
}
    
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server errror"});
    }
    }


    // detele user

   let deleteuser=async(req,res)=>{
    try {
        let id=req.params.id;
        let deleteUser=await Users.findByIdAndDelete(id);
        if(!deleteUser){
            res.status(404).json({message:"User not found"});
        }else{
            res.status(200).json({message:"User deleted successfully"});
        }
        
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}

    // auth 

    const auth = async (req, res, next)=>{
        try {
            const token = await req.cookies.token;
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            if (decode) {
                next();
            } else {
                res.status(400).json({msg: "Invalid Token"})
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"Internal server errror"});
        }
    }
  
    const UserController = {addUser, LoginUser, auth, getAllUsers, deleteuser};
    export default UserController;