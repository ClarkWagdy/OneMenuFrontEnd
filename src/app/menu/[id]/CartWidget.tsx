'use client'

import { FC, useState } from 'react';
import classes from '../Menu.module.scss';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { IncreaseQty, DecreaseQty, RemoveFromCart } from '@/config/Store/Cart/CartSlice';
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { productImagePath } from '@/config/Api/url';
import { extractRgb } from './ItemCard';
interface Props {
  onPlaceOrder: () => void;
}

const CartWidget: FC<Props> = ({ onPlaceOrder }) => {
  const dispatch = useAppDispatch();
  const Cart = useAppSelector((state) => state.Cart);
  const Restaurant = useAppSelector((state) => state.Restaurant);
  const _Lan = useAppSelector((state) => state.Lan);
  const [open, setOpen] = useState(false);

  const itemCount = Cart.reduce((sum, i) => sum + i.quantity, 0);
  const total = Cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (itemCount === 0) return null;

  return (
    <>
      {/* Floating cart button */}
      <button
        className={classes.CartFab}
        style={{ backgroundColor: `rgba(${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").r}, ${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").g}, ${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").b})` }}
        onClick={() => setOpen(true)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M3 3h2l.4 2M7 13h10l3-8H5.4M7 13 5.4 5M7 13l-2.293 2.293A1 1 0 0 0 5.414 17H17M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM19 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span className={classes.CartBadge}>{itemCount}</span>
        <span className={classes.CartTotalPreview}>{total} {strings.EGP}</span>
      </button>

      {/* Slide-in panel */}
      {open && (
        <div className={classes.CartOverlay} onClick={() => setOpen(false)}>
          <div className={classes.CartPanel} onClick={(e) => e.stopPropagation()}>
            <div className={classes.CartPanelHeader}>
              <h5 className="p-0 m-0">{strings.getLanguage() === Languages.AR ? 'السلة' : 'Your Cart'}</h5>
              <button className={classes.CloseBtn} onClick={() => setOpen(false)}>×</button>
            </div>

            <div className={classes.CartItemsList}>
              {Cart.map((item) => (
                <div key={item.id} className={classes.CartLineItem}>
                  <img src={`${productImagePath}/${item.image}`} alt="" className={classes.CartItemImg} />
                  <div className={classes.CartItemInfo}>
                    <span className={classes.CartItemName}>
                      {_Lan === Languages.AR ? item.nameAr : item.nameEn}
                    </span>
                    <span className={classes.CartItemPrice}>{item.price} {strings.EGP}</span>
                  </div>
                  <div className={classes.QtyStepper}>
                    <button onClick={() => dispatch(DecreaseQty(item.id))}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => dispatch(IncreaseQty(item.id))}>+</button>
                  </div>
                  <button
                    className={classes.RemoveBtn}
                    onClick={() => dispatch(RemoveFromCart(item.id))}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className={classes.CartPanelFooter}>
              <div className={classes.CartTotalRow}>
                <span>{strings.getLanguage() === Languages.AR ? 'الإجمالي' : 'Total'}</span>
                <span>{total} {strings.EGP}</span>
              </div>
              <button
                className={classes.PlaceOrderBtn}
                style={{ backgroundColor: `rgba(${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").r}, ${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").g}, ${extractRgb(Restaurant ? Restaurant.color : "63, 63, 63").b})` }}
                onClick={() => {
                  onPlaceOrder();
                  setOpen(false);
                }}
              >
                {strings.getLanguage() === Languages.AR ? 'إرسال الطلب' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CartWidget;