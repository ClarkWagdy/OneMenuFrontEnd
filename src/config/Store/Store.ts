

import { configureStore } from '@reduxjs/toolkit'
import { LanReducer } from './Lan/LanSlice'
import { UserReducer } from './User/UserSlice'
import { LoadReducer } from './Load/LoadSlice'
import { RestaurantReducer } from './Restaurant/RestaurantSlice'
import { RestaurantT } from './Restaurant/RestaurantType'
import { DashboardPagesReducer } from './DashboardPages/DashboardPagesSlice'
import { NonReadReducer } from './NonRead/NonRead'
import CartReducer from './Cart/CartSlice';

export const store = configureStore({
  reducer: {
    Lan: LanReducer,
    User: UserReducer,
    Load: LoadReducer,
    Restaurant: RestaurantReducer,
    DashboardPage: DashboardPagesReducer,
    NonRead: NonReadReducer,
    Cart: CartReducer,


  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch