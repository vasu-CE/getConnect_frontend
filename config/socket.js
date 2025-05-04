import { setOnlineUsers } from '@/redux/chatSlice';
import { io } from 'socket.io-client';

let projectSocket = null;
let userChatSocket = null;

const initializeProjectSocket = (projectId) => {
    // console.log(projectId)
    if (!projectSocket) {
      projectSocket = io(`${import.meta.env.VITE_SOCKET_URL}/project-chat`, {
        auth: { projectId }
      });
  
      projectSocket.on('connect', () => {
        console.log('Project socket connected with ID:', projectSocket.id);
      });
  
      projectSocket.on('connect_error', (error) => {
        console.error('Error connecting to project socket:', error);
      });
    }
  
    return projectSocket;
};

const initializeUserChatSocket = (userId , dispatch) => {
  if (!userChatSocket) {
    userChatSocket = io(`${import.meta.env.VITE_SOCKET_URL}/user-chat` , {
      auth : {userId}
    });

    userChatSocket.on('onlineUsers' , (users) => {
      dispatch(setOnlineUsers(users));
      // console.log("online : " , users)
    })

    userChatSocket.on('connection-updated' , ({userId , following}) => {
      console.log(following);
      console.log(userId);
    })

    userChatSocket.on('connect', () => {
        console.log('User chat socket connected');
    });

    userChatSocket.on('error', (error) => {
        console.error('Error in user chat:', error.message);
    });

    }
    return userChatSocket;
};

// Listen for events
const receiveMessage = (socket , eventName, cb) => {
    if (socket) {
      socket.on(eventName, cb);
    }
};

// Send messages
const sendMessage = (socket , eventName, data) => {
    if (socket) {
      socket.emit(eventName, data);
    }
};

const disconnectSocket = (socket) => {
  if (socket) {
    socket.disconnect();
    console.log('Socket disconnected');
  }
  userChatSocket = null;
};

export {
    initializeProjectSocket,
    receiveMessage,
    sendMessage,
    disconnectSocket,

    initializeUserChatSocket
};
