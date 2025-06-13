import userModel from '../models/userss.model.js';
import * as  userService from '../services/user.service.js';
import {validationResult} from 'express-validator';


export const createUserController = async (req, res) =>{
    
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json ({ errors : errors.array() });
        
    }

    try{
        const user =await userService.createUser(req.body);

        const token = await user.generateJWT();
         
       
        const userObject = user.toObject(); // Convert to plain JS object
        delete userObject.password; // Remove password from response

        res.status(201).json({ user: userObject, token });
    }catch (error){
        res.status(400).send(error.message);
    }
}


export const loginController = async (req,res) =>{


    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json ({ errors : errors.array() });
    }

    try {
        const {email,password}=req.body;

        const user = await userModel.findOne({email}).select('+password');

        if(!user){
          return  res.status(401).json({
                errors:'Invalid credentials'
            });
        }
        const isMatch = await user.isValidPassword(password);

        if(!isMatch){
            console.log("hellowww");
            return res.status(401).json({message:err.message});
        }
        const token = await user.generateJWT();

       return  res.status(200).json({user,token});

    }catch(err){

        console.log(err);

       return  res.status(400).send(err.message);

    }

} 


export const profileController = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized user" });
    }
    console.log(req.user)
    res.status(200).json({ user: req.user });
};



export const logoutController = async (req, res) => {
    try {
        res.clearCookie("token"); // If using cookies
        console.log("hello");
        
        return res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.log("hello");
        console.error("Logout Error:", err);
        return res.status(400).json({ error: err.message });
    }
};

export const getAllUsersController =async (req,res) => {
    try{

        const loggedInUser = await userModel.findOne({
            email:req.user.email
        })
        const allUsers = await userService.getAllUsers({userId : loggedInUser._id});

        return res.status(200).json({
            users:allUsers
        })

    }catch(err){
        console.log (err)

    }
}
