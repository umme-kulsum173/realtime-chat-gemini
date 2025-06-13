import   'dotenv/config';
import http from 'http';
import app from './app.js';
import mongoose from 'mongoose';
// import Sentiment from 'sentiment';
import  { Server} from 'socket.io';
import jwt from 'jsonwebtoken';
import projectModel from './models/proj.model.js';
import { generateResult } from './services/ai.service.js';


const port = process.env.PORT || 3000;


const server = http.createServer(app);

// const server = require('http').createServer();
const io = new Server(server, {
    cors:{
        origin : '*',
    }
     
    
});

io.use( async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(' ')[1];

        const projectId = socket.handshake.query.projectId;

        if(!mongoose.Types.ObjectId.isValid(projectId)){
          return next(new Error('Invalid project'));
        }

        socket.project = await projectModel.findById(projectId);

  
      if (!token) {
        return next(new Error('Authentication error'));
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
      if (!decoded) {
        return next(new Error('Authorization error'));
      }
  
      socket.user = decoded; // Attach user info to socket
      next();
    } catch (error) {
      next(error);
    }
  });

  io.on('connection', socket => {
    socket.roomId = socket.project._id.toString();
    console.log(`${socket.user.email} connected to room ${socket.roomId}`);
  
    socket.join(socket.roomId);
  
    socket.on('project-message', async data => {

      const message = data.message;
      console.log ('message',data);

      const aiIsPresentInMessage = message.includes('@ai');
      socket.broadcast.to(socket.roomId).emit('project-message', data);


      if (aiIsPresentInMessage){
        const prompt = message.replace('@ai','');

        const result = await generateResult(prompt);

        io.to(socket.roomId).emit('project-message',{
          message:result,
          sender:{
            _id:'ai',
            email:'AI'
        }
      })
        return
      }
      

      console.log(`Message from ${socket.user.email}:`, data);
  
      // Check kitte users are connected to the room
      const socketsInRoom = await io.in(socket.roomId).fetchSockets();
      console.log(`Users in room ${socket.roomId}:`, socketsInRoom.length);
  
      // Emit the message to all users in the room
      // socket.broadcast.to(socket.roomId).emit('project-message', data);
    });
  
    socket.on('event', data => { /* … */ });
    socket.on('disconnect', () => { /* … */ });
  });
  
// server.listen(3000);


const connectDB = async()=>{
    try {
        await mongoose.connect("mongodb://localhost:27017/chatapp", {
            
        })
    } catch (error) {
        
    }
}

// const sentiment = new Sentiment();

// const comment = "This video is amazing! I love the content.";
// const result = sentiment.analyze(comment);

// console.log(result); 



server.listen(port,() => {
    console.log (`server is running on port ${port}`);
})