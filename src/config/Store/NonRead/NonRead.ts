

import { createSlice } from '@reduxjs/toolkit'


export const NonReadSlicer = createSlice({
    name: "NonRead",
    initialState: null,
    reducers: {
        SetNonRead(_state, action) {
            return action.payload;
        }
    }
})

export const SetNonRead = NonReadSlicer.actions.SetNonRead;
export const NonReadReducer = NonReadSlicer.reducer;