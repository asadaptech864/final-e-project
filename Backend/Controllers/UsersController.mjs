import Users from '../Modals/UsersModal.mjs'
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'  
import EmailController from './EmailController.mjs';
import Notification from '../Modals/NotificationModal.mjs';

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

    // get user by id
    let getUserById=async(req,res)=>{
        try {
            let id=req.params.id;
            let user=await Users.findById(id);
            if(!user){
                res.status(404).json({message:"User not found"});
            }else{
                res.status(200).json({message:"User found",user:user});
            }
        } catch (error) {
            console.log(error);
            res.status(500).json({message:"Internal server error"});
        }
    }
    

// Add a new Sign Up
        let addUser=async(req,res)=>{
            try {
                let user = await Users.find({email: req.body.email});
                if (user.length == 1) {
                    res.status(404).json({message:"User already exists"});
                } else {
                    // If role is null or not provided, treat as guest
                    let userRole = req.body.role ? req.body.role : 'guest';
                    bcrypt.hash(req.body.password, 15).then(async function(hash){
                        let newUser = new Users({
                            name:req.body.name,
                            email:req.body.email,
                            password:hash,
                            role:userRole,
                            isActive:req.body.isActive,
                        });
                       let adduser = await Users.insertOne(newUser);
                       if (!adduser) {
                              res.status(404).json({message:"Failed to add User"});
                       } else {
                           // Send welcome email
                           try {
                             if (userRole === 'guest') {
                               await EmailController.sendMail(
                                 req.body.email,
                                 'Welcome to Our Hotel',
                                 `<div style="font-family:Arial,sans-serif;padding:20px;background:#f9f9f9;border-radius:8px;max-width:500px;margin:auto;">
                                   <h2 style="color:#2d3748;">Welcome, ${req.body.name}!</h2>
                                   <p>Thank you for signing up as a guest at our hotel. We are excited to have you with us!</p>
                                   <p>You can now log in and book your stay with us. If you have any questions, feel free to contact our support team.</p>
                                   <hr style="margin:20px 0;"/>
                                   <p style="font-size:14px;color:#555;">We look forward to serving you.</p>
                                   <p style="font-size:12px;color:#888;">&copy; ${new Date().getFullYear()} Hotel Reservation System</p>
                                 </div>`
                               );
                             } else {
                               await EmailController.sendMail(
                                 req.body.email,
                                 'Welcome to Our Hotel Staff',
                                 `<div style="font-family:Arial,sans-serif;padding:20px;background:#f9f9f9;border-radius:8px;max-width:500px;margin:auto;">
                                   <h2 style="color:#2d3748;">Welcome, ${req.body.name}!</h2>
                                   <p>Congratulations! You have been added as a <b>${userRole}</b> in our hotel management system.</p>
                                   <p>Your login details are:</p>
                                   <ul style="margin:10px 0 20px 20px;padding:0;font-size:15px;">
                                     <li><b>Email:</b> ${req.body.email}</li>
                                     <li><b>Password:</b> ${req.body.password}</li>
                                   </ul>
                                   <p>Please use your email and password to log in and access your staff dashboard. For security, we recommend changing your password after your first login.</p>
                                   <hr style="margin:20px 0;"/>
                                   <p style="font-size:14px;color:#555;">If you have any questions, please contact your manager or IT support.</p>
                                   <p style="font-size:12px;color:#888;">&copy; ${new Date().getFullYear()} Hotel Management System</p>
                                 </div>`
                               );
                             }
                           } catch (e) {
                             console.log('Email send error:', e);
                           }
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
        if (!checkUser) {
            return res.status(404).json({message:"User not found. Please register now...."});
        }
        if (checkUser.isActive === false) {
            return res.status(404).json({message: "Your account is Deactivated. Please contact Admin."});
        }
        const match = bcrypt.compareSync(req.body.password, checkUser.password);
        if(match) {
            const token = await jwt.sign({email: checkUser.email, _id: checkUser._id, role: checkUser.role},process.env.JWT_SECRET,{ expiresIn: '12h'})
            res.cookie("token",token, { maxAge: 43200, httpOnly: true})
            return res.status(200).json({
                message:"User Login successfully",
                user:checkUser,
                token:token
            })
        } else {
            return res.status(401).json({message:"Invalid Credentials"});
        }
    } catch (error) {
       console.log(error) ;
       res.status(500).json({message:"Internal server error"});
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
// edit user
let editUser=async(req,res)=>{
    try {
        let id=req.params.id;
        let editUser=await Users.findByIdAndUpdate(id,req.body);
        if(!editUser){
            res.status(404).json({message:"User not found"});
        }else{
            res.status(200).json({message:"User updated successfully"});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}

// Update user profile
let updateUserProfile=async(req,res)=>{
    try {
        let id=req.params.id;
        const { name, phone, address, gender, profilePic } = req.body;
        
        // Only allow updating specific fields for profile
        const updateData = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address !== undefined) updateData.address = address;
        if (gender !== undefined) updateData.gender = gender;
        if (profilePic !== undefined) updateData.profilePic = profilePic;
        
        let updatedUser = await Users.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true, runValidators: true }
        );
        
        if(!updatedUser){
            res.status(404).json({message:"User not found"});
        }else{
            res.status(200).json({
                message:"Profile updated successfully",
                user: updatedUser
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({message:"Internal server error"});
    }
}
// deactivate user
let deactivateAndActivateUser=async(req,res)=>{
    try {
        let id=req.params.id;
        let deactivateUser=await Users.findByIdAndUpdate(id,{isActive:req.body.isActive});
        if(!deactivateUser){
            res.status(404).json({message:"User not found"});
        }else if(req.body.isActive){
            res.status(200).json({message:"User activated successfully"});
        }else{
            res.status(200).json({message:"User deactivated successfully"});
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

const getAllMaintenanceUsers = async (req, res) => {
  try {
    const users = await Users.find({ role: 'maintenance' });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch maintenance users' });
  }
};

// Get notifications for a user
export const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
};

// Mark a notification as read
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const notif = await Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
    if (!notif) return res.status(404).json({ message: 'Notification not found' });
    res.status(200).json({ notification: notif });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
};

// Get users by role
export const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;
    const users = await Users.find({ role, isActive: true }).select('name email role');
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users by role', error: error.message });
  }
};

// Send notification to specific user
export const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, message, type, data } = req.body;
    
    // Create notification
    const notification = await Notification.create({
      userId,
      type: type || 'admin',
      message,
      data: data || {}
    });

    // Get user details for email
    const user = await Users.findById(userId);
    if (user && user.email) {
      // Send email notification
      const html = `
        <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
          <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">System Notification</h2>
          <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${user.name}</b>,</p>
          <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
            <p style="font-size:15px;color:#333;line-height:1.6;">${message}</p>
          </div>
          <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">Please check your dashboard for more details.</p>
          <hr style="margin:24px 0;"/>
          <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Management System</p>
        </div>
      `;
      
      await EmailController.sendMail(user.email, 'System Notification - Hotel Management', html);
    }

    res.status(200).json({ message: 'Notification sent successfully', notification });
  } catch (error) {
    res.status(500).json({ message: 'Error sending notification', error: error.message });
  }
};
  
// Forgot Password functionality
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await Users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate reset token
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Set token expiry (1 hour from now)
    const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to user
    user.resetPasswordToken = resetPasswordToken;
    user.resetPasswordExpires = resetPasswordExpires;
    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // Email content
    const html = `
      <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
        <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Password Reset Request</h2>
        <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${user.name}</b>,</p>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <p style="font-size:15px;color:#333;line-height:1.6;">You requested a password reset for your account. Click the button below to reset your password:</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${resetUrl}" style="background:#07be8a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Reset Password</a>
          </div>
          <p style="font-size:14px;color:#666;margin-top:16px;">If you didn't request this password reset, please ignore this email.</p>
          <p style="font-size:14px;color:#666;">This link will expire in 1 hour.</p>
        </div>
        <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size:12px;color:#888;text-align:center;word-break:break-all;">${resetUrl}</p>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Management System</p>
      </div>
    `;

    // Send email
    await EmailController.sendMail(user.email, 'Password Reset Request - Hotel Management', html);

    res.status(200).json({ 
      message: 'Password reset email sent successfully',
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

const validateResetToken = async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required' });
    }

    // Hash the token to compare with stored hash
    const crypto = await import('crypto');
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and check if it's not expired
    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    res.status(200).json({ message: 'Token is valid' });
  } catch (error) {
    console.error('Token validation error:', error);
    res.status(500).json({ message: 'Error validating reset token' });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: 'Token and password are required' });
    }

    // Hash the token to compare with stored hash
    const crypto = await import('crypto');
    const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with this token and check if it's not expired
    const user = await Users.findOne({
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password
    const bcrypt = await import('bcrypt');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Update user password and clear reset token
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    const html = `
      <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
        <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Password Reset Successful</h2>
        <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${user.name}</b>,</p>
        <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
          <p style="font-size:15px;color:#333;line-height:1.6;">Your password has been successfully reset. You can now sign in to your account with your new password.</p>
          <div style="text-align:center;margin:24px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/signin" style="background:#07be8a;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;display:inline-block;">Sign In</a>
          </div>
          <p style="font-size:14px;color:#666;margin-top:16px;">If you didn't request this password reset, please contact our support team immediately.</p>
        </div>
        <hr style="margin:24px 0;"/>
        <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Management System</p>
      </div>
    `;

    await EmailController.sendMail(user.email, 'Password Reset Successful - Hotel Management', html);

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password' });
  }
};

// Google Signup functionality
const googleSignup = async (req, res) => {
  try {
    console.log('Google signup request received:', req.body);
    const { name, email, picture } = req.body;
    
    if (!name || !email) {
      console.log('Missing required fields:', { name, email });
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if user already exists
    let user = await Users.findOne({ email });
    console.log('Existing user check:', user ? 'User exists' : 'User not found');
    
    if (user) {
      // User exists, return success with user data
      console.log('Returning existing user data');
      return res.status(200).json({
        message: 'User already exists',
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          profilePic: user.profilePic || picture,
          isActive: user.isActive
        }
      });
    }

    // Create new user with Google data
    console.log('Creating new user with Google data');
    const newUser = new Users({
      name,
      email,
      password: '', // No password for Google users
      provider: 'google', // Set provider to google
      role: 'guest', // Default role for Google signups
      profilePic: picture,
      isActive: true
    });

    await newUser.save();
    console.log('New user saved successfully:', newUser._id);

    // Send welcome email (optional - don't fail if email fails)
    try {
      const html = `
        <div style="font-family:Arial,sans-serif;padding:32px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
          <h2 style="color:#07be8a;text-align:center;margin-bottom:24px;">Welcome to Our Hotel!</h2>
          <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${name}</b>,</p>
          <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
            <p style="font-size:15px;color:#333;line-height:1.6;">Thank you for signing up with Google! Your account has been successfully created.</p>
            <p style="font-size:15px;color:#333;line-height:1.6;">You can now book rooms and manage your reservations through our platform.</p>
          </div>
          <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">We look forward to serving you!</p>
          <hr style="margin:24px 0;"/>
          <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Management System</p>
        </div>
      `;
      
      await EmailController.sendMail(email, 'Welcome to Our Hotel - Google Signup', html);
      console.log('Welcome email sent successfully');
    } catch (emailError) {
      console.log('Welcome email error (non-critical):', emailError);
    }

    console.log('Sending success response');
    res.status(201).json({
      message: 'User created successfully with Google',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        profilePic: newUser.profilePic,
        isActive: newUser.isActive
      }
    });
  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Error creating user with Google', error: error.message });
  }
};

const UserController = {addUser, LoginUser, auth, getAllUsers, deleteuser, deactivateAndActivateUser, editUser, getUserById, getAllMaintenanceUsers, updateUserProfile, forgotPassword, validateResetToken, resetPassword, googleSignup};
export default UserController;