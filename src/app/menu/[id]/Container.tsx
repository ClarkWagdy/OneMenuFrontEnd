import { url } from '@/config/Api/url'
import { Languages } from '@/config/localization/Languages'
import { strings } from '@/config/localization/LocalizedStrings'


import { useAppDispatch, useAppSelector } from '@/config/Store/hooks'
import { SetRestaurant } from '@/config/Store/Restaurant/RestaurantSlice'
import { CategoryDTO, RestaurantT } from '@/config/Store/Restaurant/RestaurantType'
import axios from 'axios'
import update from 'immutability-helper'
import type { FC } from 'react'
import { useState, useEffect, useRef } from 'react'
import { ToastContainer, toast } from 'react-toastify';

import { Card } from './Card'
import { categoryT } from './typs'

interface Props {
  category: CategoryDTO[],
  setLoad: Function,
  Load: boolean,
  Deletecategory: Function,
  setcategoryNew: Function,
  setEditPointer: Function,
  setNewcategoryTextAR: Function,
  setNewCategoryTextEN: Function,
  Editcategory: Function,
  NewCategoryTextEN: string | undefined,
  NewCategoryTextAR: string | undefined,
  EditPointer: string | undefined,

  Translation: Function,

}
export const Container: FC<Props> = (props) => {
  {
    const User = useAppSelector((state) => state.User);
    const Restaurant = useAppSelector((state) => state.Restaurant);
    const dispatch = useAppDispatch();
    const [categories, setcategories] = useState<CategoryDTO[]>([...props.category]);

    // Guards a save in flight so overlapping drag events can never fire
    // two concurrent POSTs (that's what was causing the order conflict).
    const isSaving = useRef(false);
    // Remembers where the drag started, so we only persist once, on drop,
    // using indexes that are still valid.
    const dragStartIndex = useRef<number | null>(null);

    useEffect(() => {
      // Don't clobber local state while a save is in flight — otherwise
      // the prop update from a *previous* stale request can overwrite
      // an in-progress drag.
      if (isSaving.current) return;
      setcategories([...props.category])
    }, [props.category])

    // --- Purely visual reorder while dragging. Local only, no network call,
    // safe to fire on every hover tick. -------------------------------------
    const moveCard = (dragIndex: number, hoverIndex: number) => {
      if (dragStartIndex.current === null) {
        dragStartIndex.current = dragIndex;
      }
      setcategories((prev) =>
        update(prev, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prev[dragIndex] as CategoryDTO],
          ],
        })
      );
    }

    // --- Persist the new order. Called ONCE, on drop. -----------------------
    const dropCard = (hoverIndex: number) => {
      const dragIndex = dragStartIndex.current;
      dragStartIndex.current = null;

      if (dragIndex === null || dragIndex === hoverIndex) return;
      if (isSaving.current) return; // belt-and-braces: never overlap saves
      isSaving.current = true;
      props.setLoad(true);

      // Use the CURRENT categories state (post-drag, already reordered
      // visually) as the source of truth for order values — not a
      // separately-tracked ref that can go stale.
      const c1 = categories[dragIndex];
      const c2 = categories[hoverIndex];

      if (!c1 || !c2) {
        isSaving.current = false;
        props.setLoad(false);
        return;
      }

      const CategoryData = [
        { id: c2.id, order: c1.order, isActive: true },
        { id: c1.id, order: c2.order, isActive: true },
      ];

      axios.post(`${url}/categories/edit`, {
        RestaurantId: User.RestaurantId,
        Categories: CategoryData,
      }, {
        headers: { 'Authorization': User.token }
      }).then(res => {
        const restaurant: RestaurantT = { ...Restaurant };
        restaurant.categories = res.data.data;
        dispatch(SetRestaurant(restaurant));
        setcategories(res.data.data);

        toast.success(strings.Modified, {
          position: strings.getLanguage() === Languages.AR ? "bottom-left" : "bottom-right",
          autoClose: 2500,
          rtl: strings.getLanguage() === Languages.AR ? true : false,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "colored",
        });
      }).catch(err => {
        if (err?.response?.status === 401) {
          localStorage.clear()
          window.location.replace('/login')
        }
        // Revert the optimistic visual reorder on failure.
        setcategories([...props.category]);
      }).finally(() => {
        isSaving.current = false;
        props.setLoad(false);
      });
    }

    return (
      <>
        <ToastContainer />

        {categories.map((ele, i) => {
          return (
            <Card
              key={ele.id}
              index={i}
              categ={ele}
              moveCard={moveCard}
              dropCard={dropCard}
              setLoad={props.setLoad}
              Load={props.Load}
              Deletecategory={props.Deletecategory}
              setcategoryNew={props.setcategoryNew}
              setEditPointer={props.setEditPointer}
              setNewCategoryTextAR={props.setNewcategoryTextAR}
              setNewCategoryTextEN={props.setNewCategoryTextEN}
              Editcategory={props.Editcategory}
              NewCategoryTextEN={props.NewCategoryTextEN}
              NewCategoryTextAR={props.NewCategoryTextAR}
              EditPointer={props.EditPointer}
              Translation={props.Translation}

            />)
        })}
      </>
    )
  }
}