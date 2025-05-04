import {createSlice} from "@reduxjs/toolkit"

const authSlice = createSlice({
    name : 'auth',
    initialState : {
        user : null
    },
    reducers : {
        setAuthUser:(state , action) => {
            state.user = action.payload;
        },
        updateConnection:(state , action) => {
            state.user.connection = action.payload
        }
    },
    extraReducers: (builder) => {
        builder.addCase(updateConnection, (state, action) => {
            if (state.user) {
                state.user.connection = action.payload;
            }
        });
    }
});

export const {
    setAuthUser,
    updateConnection
} = authSlice.actions;

export default authSlice.reducer;