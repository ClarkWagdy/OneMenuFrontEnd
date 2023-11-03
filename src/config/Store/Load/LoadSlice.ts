
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { createSlice } from '@reduxjs/toolkit'
 



 export  const LoadSlicer=createSlice({
     name:"Load",
     initialState:true,
     reducers:{
         SetLoad(_state,action){ 
            return action.payload;
         }
     }
 })

export const SetLoad=LoadSlicer.actions.SetLoad;
export const LoadReducer=LoadSlicer.reducer;