
import { url } from '@/config/Api/url'
import { Languages } from '@/config/localization/Languages'
import { strings } from '@/config/localization/LocalizedStrings'
 

import { useAppDispatch, useAppSelector } from '@/config/Store/hooks'
import { SetRestaurant } from '@/config/Store/Restaurant/RestaurantSlice'
import { CategoryDTO, RestaurantT } from '@/config/Store/Restaurant/RestaurantType'
import axios from 'axios'
import update from 'immutability-helper'
import type { FC } from 'react'
import {  useState,useEffect } from 'react' 
import { ToastContainer, toast } from 'react-toastify';

import { Card } from './Card' 
import { categoryT } from './typs'

 interface Props{
  category:CategoryDTO[],
  setLoad:Function,
  Load:boolean,
  Deletecategory:Function,
  setcategoryNew:Function,
  setEditPointer:Function,
  setNewcategoryTextAR:Function,
  setNewCategoryTextEN:Function,
  Editcategory:Function,
  NewCategoryTextEN:string|undefined,
  NewCategoryTextAR:string|undefined,
  EditPointer:string|undefined,
 
  Translation:Function,

 }
export const Container: FC<Props> = (props) => {
  {
    const User = useAppSelector((state) => state.User);
    const Restaurant  = useAppSelector((state) => state.Restaurant);
    const dispatch = useAppDispatch();
    const [categories,setcategories]=useState<CategoryDTO[]>( [...props.category] );

 
    const [categoryRef,setcategoryRef]=useState<CategoryDTO[]|[]>(  props.category?[...props.category]:[] );


useEffect(() => {
 
  setcategories(  [...props.category])
  setcategoryRef( [...props.category])
}, [props.category])

 
   const moveCard =  (dragIndex: number, hoverIndex: number) => {
    var c1:CategoryDTO={...categories[dragIndex]};
    var c2:CategoryDTO={...categories[hoverIndex]} ; 
   let temp:number=c2.order;
   c2.order=c1.order;
   c1.order=temp; 
   categories[dragIndex]=c1;
   categories[hoverIndex]=c2;
   var CategoryData=[{
    id:categoryRef[hoverIndex].id,
    order:categoryRef[dragIndex].order,
    isActive:true,
    
   },{
    id:categoryRef[dragIndex].id,
    order:categoryRef[hoverIndex].order,
    isActive:true,
   }]

 
   axios.post(`${url}/categories/edit`,{
    RestaurantId:User.RestaurantId,
    Categories:CategoryData,
   },{headers:{
     'Authorization':User.token
   }}).then(res=>{ 

     setcategories((prevcategories: CategoryDTO[]) => 
     update(prevcategories, {
       $splice: [
         [dragIndex, 1],
         [hoverIndex, 0, prevcategories[dragIndex] as CategoryDTO],
       ],
     }),
   )
 
   var restaurant:RestaurantT={...Restaurant}
   restaurant.categories=res.data.data;
   dispatch(SetRestaurant(restaurant));
   setcategoryRef(res.data.data);
 
   toast.success(strings.Modified, {
    position: strings.getLanguage()===Languages.AR?"bottom-left":"bottom-right",
    autoClose: 2500,
    rtl:strings.getLanguage()===Languages.AR?true:false,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "colored",
    });


   }).catch(err=>{
   if(err.response.status===401){
     localStorage.clear()
     window.location.replace('/login')
   }
   });

 
    } 

 
    return (
      <>
      <ToastContainer />

    {categories.map((ele, i) =>{
          return( 
             <Card
            key={ele.id+ele.nameEn}
            index={i}
            categ={ele}
            moveCard={moveCard}
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
