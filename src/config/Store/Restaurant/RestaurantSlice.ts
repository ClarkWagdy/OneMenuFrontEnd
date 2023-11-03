
 
import { createSlice } from '@reduxjs/toolkit'
import { RestaurantT } from './RestaurantType';
 

 

 export  const RestaurantSlicer=createSlice({
     name:"Restaurant",
     initialState:{} as RestaurantT ,
     reducers:{
         SetRestaurant(_state,action){
    
         
            return action.payload;
         }
     }
 })

export const SetRestaurant=RestaurantSlicer.actions.SetRestaurant;
export const RestaurantReducer=RestaurantSlicer.reducer;