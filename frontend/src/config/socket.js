import socket from 'socket.io-client';

let socketInstance = null;

// initailizeSocket is from proj.jsx to establish frontend and backend con

export const initializeSocket = (projectId) =>{


    socketInstance = socket(import.meta.env.VITE_API_URL,{
        auth :{
            token: localStorage.getItem('token')
        },
        query :{
            projectId
        }
    });

    return socketInstance;
}

export const receiveMessage = (eventName, cb) => {
  console.log(`Listening to ${eventName}`);
  socketInstance.on(eventName, cb);
};


// export const removeMessageListener = (eventName) => {
//     if (socketInstance) {
//       socketInstance.off(eventName); // removes all listeners for that event
//     }
//   };
  

// export const sendMessage = (eventName,cb) =>{

//     socketInstance.on(eventName,cb);
// }
export const sendMessage = (eventName, data) => {
    socketInstance.emit(eventName, data); // ← 💥 THIS IS WHAT YOU'RE MISSING
}