import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
    name: 'post',
    initialState: {
        posts: [],
        selectedPost: null,
    },
    reducers: {
        setPosts: (state, action) => {
            state.posts = action.payload;
        },
        appendPost: (state, action) => {
            state.posts.push(action.payload);
            state.posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }
    },
});

export const { setPosts, appendPost } = postSlice.actions;
export default postSlice.reducer;
