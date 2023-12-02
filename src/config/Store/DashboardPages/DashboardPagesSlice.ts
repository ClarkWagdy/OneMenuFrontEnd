

import { DashboardPages } from '@/config/Dashboard/DashboardPages';
import { createSlice } from '@reduxjs/toolkit'




export const DashboardPagesSlicer = createSlice({
    name: "DashboardPages",
    initialState: DashboardPages.Home,
    reducers: {
        SetDashboardPages(_state, action) {


            return action.payload;
        }
    }
})

export const SetDashboardPages = DashboardPagesSlicer.actions.SetDashboardPages;
export const DashboardPagesReducer = DashboardPagesSlicer.reducer;