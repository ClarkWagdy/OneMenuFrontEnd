import { productImagePath, url } from '@/config/Api/url';
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { ProductDTO } from '@/config/Store/Restaurant/RestaurantType';
import { UserType } from '@/config/Store/User/UserType';
import React, { FC, useState } from 'react'
import classes from '../Menu.module.css'; 
import AddorEditItemModal from './AddorEditItemModal';
 
interface Props{
  product:ProductDTO
  EditItem:Function
  DeleteItem:Function
}
 const ItemCard:FC<Props>=(props)=> {
    const User = useAppSelector((state) => state.User);
    const Restaurant = useAppSelector((state) => state.Restaurant);
    const _Lan = useAppSelector((state) => state.Lan)
    const [CreateOrEditItemModal,setCreateOrEditItemModal]=useState<boolean>(false);
    const dispatch = useAppDispatch();
    function HandleOpenModal(){
       
      setCreateOrEditItemModal(true)
    }
 
  return (
     <div className={classes.ProductCard}>
     

     {User.type===UserType.Admin||User.type===UserType.Owner&&(<>
 <div className= {classes.btnsEditCard + '    w-100 d-flex justify-content-between align-items-center'}>


         <button className={classes.AddIconCard }  
          onClick={()=>HandleOpenModal()}
           onMouseEnter={ele=>{ele.currentTarget.style.backgroundColor=`rgba(${Restaurant.color})`}}  onMouseLeave={ele=>{ele.currentTarget.style.backgroundColor='rgba(0, 0, 0,0.8)'}} >
           <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 492.493 492"   ><g><path d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>
          </button>

          <button className={classes.AddIconCard }  
          onClick={()=>props.DeleteItem(props.product.id)}
           onMouseEnter={ele=>{ele.currentTarget.style.backgroundColor=`tomato`}}  onMouseLeave={ele=>{ele.currentTarget.style.backgroundColor='rgba(0, 0, 0,0.8)'}} >
<svg xmlns="http://www.w3.org/2000/svg" version="1.1"   width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1ZM20 4h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" fill="#000000" data-original="#000000"></path><path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0ZM15 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" fill="#000000" data-original="#000000" ></path></g></svg>          </button>
          </div>
     </>)}


 <img
       className={classes.ProductImage}
       src={`${productImagePath}/${props.product.image}`}
      
       alt="" />
<h6 className={classes.textStart +"  p-0  m-0  mt-1 fw-bold"}>{_Lan===Languages.AR?props.product.nameAr:props.product.nameEn}</h6>
{props.product.descAR&&props.product.descEN&&(
<p className='p-0 m-0'>{_Lan===Languages.AR?props.product.descAR:props.product.descEN}</p>)}
<h5 className={classes.textStart +"  p-0  m-0  mt-1"}>{props.product.price} {strings.EGP}</h5>



<AddorEditItemModal CreateOrEditItemModal={CreateOrEditItemModal} setCreateOrEditItemModal={setCreateOrEditItemModal} product={props.product}   EditItem={props.EditItem}/>
 </div> 
  )
}
export default ItemCard;