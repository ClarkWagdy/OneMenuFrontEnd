
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { createSlice } from '@reduxjs/toolkit'
 



 export  const LanSlicer=createSlice({
     name:"Language",
     initialState:Languages.EN,
     reducers:{
         SetLan(_state,action){
            strings.setLanguage(action.payload);
         
            return action.payload;
         }
     }
 })

export const SetLan=LanSlicer.actions.SetLan;
export const LanReducer=LanSlicer.reducer;