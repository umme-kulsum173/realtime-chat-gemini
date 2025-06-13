import mongoose from 'mongoose';
import ProjectModel from '../models/proj.model.js';



export const createProject = async ({ name, userId }) => {
    if (!name) {
        throw new Error('Name is required');
    }
    if (!userId) {
        throw new Error('User is required');
    }

    try {
        const project = await ProjectModel.create({
            name,
            users: [userId]
        });

        return project;
    } catch (error) {
        if (error.code === 11000) {
            throw new Error('Project name already exists');
        }
        console.error("Error while creating project:", error);
        throw new Error('Something went wrong while creating the project');

    }
};



export const getAllProjectByUserId = async ({userId}) =>{
    if(!userId){
        throw new Error('UserId is required')

    }
    const allUserProjects =await ProjectModel.find({
        users:userId
    })
    // console.log(allUserProjects, "ummme")
    return allUserProjects
    
}

export const addUserToProject = async({projectId ,users,userId}) =>{

    if(!projectId){
     
        throw new Error("projectId is required")
    }

    if(!users){
        throw new Error("users are required")
    }

    if(!Array.isArray(users) || users.some(userId =>
        !mongoose.Types.ObjectId.isValid(userId))) {
            throw new Error("Invalid userId(s) in users array")
        }

    if(!userId){
        throw new Error("userId is required")
    }    

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new Error("Invalid userId")
    }

        const project = await ProjectModel.findOne({
            _id: projectId,
            users:userId
        })

        if(!project){
            throw new Error("user not belong to this project")
        }

        const updatedProject = await ProjectModel.findOneAndUpdate(
            {_id: projectId },
            {
            $addToSet:{
                users:{
                    $each:users
                }
            }
        },{
            new:true
        })

        return updatedProject
}

export const getProjectById = async({ projectId }) => {
    if(!projectId){
        throw new Error("projectId  is required")
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new Error("Invalid projectId")
    }

    const project = await ProjectModel.findOne({
        _id: projectId
    }).populate('users')
    
    return project;
}
