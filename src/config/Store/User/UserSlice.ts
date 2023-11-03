
 
import { createSlice } from '@reduxjs/toolkit'
import { UserT } from './UserType';
 

const initialState:UserT={

};

 export  const UserSlicer=createSlice({
     name:"User",
     initialState,
     reducers:{

      

         SetUser(_state,action){
    
            localStorage.setItem("User", JSON.stringify(action.payload) );
            return action.payload;
         }
     }
 })

export const SetUser=UserSlicer.actions.SetUser;
export const UserReducer=UserSlicer.reducer;