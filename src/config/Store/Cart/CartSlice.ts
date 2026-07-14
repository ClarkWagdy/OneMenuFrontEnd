import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductDTO } from '../Restaurant/RestaurantType';

export interface CartItem {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number;
  image: string;
  quantity: number;
}

const initialState: CartItem[] = [];

const CartSlice = createSlice({
  name: 'Cart',
  initialState,
  reducers: {
    AddToCart: (state, action: PayloadAction<ProductDTO>) => {
      const existing = state.find((i) => i.id === action.payload.id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.push({
          id: action.payload.id,
          nameAr: action.payload.nameAr,
          nameEn: action.payload.nameEn,
          price: +action.payload.price,
          image: action.payload.image,
          quantity: 1,
        });
      }
    },
    IncreaseQty: (state, action: PayloadAction<string>) => {
      const item = state.find((i) => i.id === action.payload);
      if (item) item.quantity += 1;
    },
    DecreaseQty: (state, action: PayloadAction<string>) => {
      const item = state.find((i) => i.id === action.payload);
      if (!item) return state;
      if (item.quantity <= 1) return state.filter((i) => i.id !== action.payload);
      item.quantity -= 1;
    },
    RemoveFromCart: (state, action: PayloadAction<string>) =>
      state.filter((i) => i.id !== action.payload),
    ClearCart: () => [],
  },
});

export const { AddToCart, IncreaseQty, DecreaseQty, RemoveFromCart, ClearCart } = CartSlice.actions;
export default CartSlice.reducer;