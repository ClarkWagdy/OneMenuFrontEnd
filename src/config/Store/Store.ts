 

import { configureStore } from '@reduxjs/toolkit'
 import { LanReducer } from './Lan/LanSlice'
import { UserReducer } from './User/UserSlice'
import { LoadReducer } from './Load/LoadSlice'
import { RestaurantReducer } from './Restaurant/RestaurantSlice'
import { RestaurantT } from './Restaurant/RestaurantType'

export const store = configureStore({
  reducer: {
    Lan: LanReducer, 
    User: UserReducer, 
    Load: LoadReducer, 
    Restaurant: RestaurantReducer , 



  },
})
 
export type RootState = ReturnType<typeof store.getState> 
export type AppDispatch = typeof store.dispatch