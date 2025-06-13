import userModel from '../models/userss.model.js';


export const createUser = async ({
    email, password
}) =>  {
    if (!email || !password){
        throw new Error('Email and password are required');
    }

    // const existingUser = await userModel.findOne({ email });
    // if (existingUser) {
    //     throw new Error('Email already exists. Please use another one.');
    // }


    const hashedPassword = await userModel.hashedPassword(password);

    const user = await userModel.create({
        email,
        password: hashedPassword
    });

    return user;
}


export const getAllUsers = async ({userId}) => {
    const users =await userModel.find({
        _id: { $ne: userId}
    });
    return users;
}