

import { createSlice } from '@reduxjs/toolkit'
import { RestaurantT } from './RestaurantType';




export const RestaurantSlicer = createSlice({
    name: "Restaurant",
    initialState: JSON.parse(localStorage.getItem('Restaurant') || '{}') as RestaurantT,
    reducers: {
        SetRestaurant(_state, action) {
            localStorage.setItem("Restaurant", JSON.stringify(action.payload))

            return action.payload;
        }
    }
})

export const SetRestaurant = RestaurantSlicer.actions.SetRestaurant;
export const RestaurantReducer = RestaurantSlicer.reducer;