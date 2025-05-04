import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
    name : 'chat',
    initialState :{
        onlineUsers : [],
        messages : []
    },
    reducers : {
        setOnlineUsers : (state , action) => {
            state.onlineUsers = action.payload;
        },
        setMessages : (state , action) => {
            const { userId, messages } = action.payload;
            state.messages[userId] = messages; 
        }
    }
})

export const {setOnlineUsers , setMessages} = chatSlice.actions;
export default chatSlice.reducer;