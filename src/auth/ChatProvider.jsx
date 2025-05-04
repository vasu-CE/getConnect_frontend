// src/contexts/ChatProvider.jsx
import { useEffect, useRef, createContext, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { initializeUserChatSocket, disconnectSocket } from '../../config/socket';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user); 
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id || socketRef.current) return;

    // initialize once
    const socket = initializeUserChatSocket(user._id, dispatch);
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected for user:', user._id);
    });

    return () => {
      // only run on full app teardown (e.g. logout or unmount of provider)
      disconnectSocket(socket);
      socketRef.current = null;
    };
  }, [user?._id, dispatch]);

  return (
    <ChatContext.Provider value={socketRef.current}>
      {children}
    </ChatContext.Provider>
  );
}

// // optional helper hook
export function useChatSocket() {
  return useContext(ChatContext);
}
