

import { createSlice } from '@reduxjs/toolkit'
import { UserT } from './UserType';



const user: string = localStorage.getItem('User') as string;
const initialState: UserT = JSON.parse(user) as UserT;
export const UserSlicer = createSlice({
    name: "User",
    initialState,
    reducers: {



        SetUser(_state, action) {
            localStorage.clear();
            localStorage.setItem("User", JSON.stringify(action.payload));
            return action.payload;
        }
    }
})

export const SetUser = UserSlicer.actions.SetUser;
export const UserReducer = UserSlicer.reducer;