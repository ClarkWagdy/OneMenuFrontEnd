'use client'

import { FC, useState ,useEffect} from 'react'
import classes from '../Menu.module.css';
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Languages, LanguagesTitle } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { SetLan } from '@/config/Store/Lan/LanSlice';
import AddorEditcategoryModal from './AddorEditcategoryModal';
 
import ItemCard from './ItemCard';
import { UserT, UserType } from '@/config/Store/User/UserType';
import AddorEditItemModal from './AddorEditItemModal';
import SettingsModal from './SettingsModal';
import NoItems from '@/Component/NoItems/NoItems'; 
import { SetLoad } from '@/config/Store/Load/LoadSlice';
import { CategoryDTO, ProductDTO, RestaurantT } from '@/config/Store/Restaurant/RestaurantType';
import axios from 'axios';
import { useParams } from 'next/navigation'
import { SetRestaurant } from '@/config/Store/Restaurant/RestaurantSlice';
import { OffersImagePath, url, VideoPath } from '@/config/Api/url'; 
import Swal from 'sweetalert2';
 
import {  toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
 


export default function Page(){ 
  const params = useParams()
  const _Lan = useAppSelector((state) => state.Lan) 
  const [CreateOrEditcategoryModal, setCreateOrEditcategoryModal] = useState<boolean>(false);
  const [CreateOrEditItemModal, setCreateOrEditItemModal] = useState<boolean>(false);
  const [SettingModal, setSettingModal] = useState<boolean>(false);
  const User = useAppSelector((state) => state.User);
  const Restaurant  = useAppSelector((state) => state.Restaurant);
  const dispatch = useAppDispatch();


  useEffect(()=>{  
      if(Object.keys(Restaurant).length===0 && params?.id){
        dispatch(SetLoad(true));
        axios.get(`${url}/restaurant/by-id/${params?.id}`)
    .then(  function (response) {
     
      if(response.status===200){ 
        var restaurant:RestaurantT={...response.data.data}; 
         dispatch(SetRestaurant(restaurant));
 
         dispatch(SetLan(restaurant.defaultLanguage===0?Languages.AR:Languages.EN))              
         
      }
      dispatch(SetLoad(false));
  
    })
    .catch(function (error) {
      // handle error
      dispatch(SetLoad(false));
      console.log(error);
    }) 
      } 

  
 
  },[])
  useEffect(()=>{ 
 
if(Restaurant.categories){
  setcategory(Restaurant.categories)
}
 


},[Restaurant.categories])
  function HandleLanChange() {
    if (_Lan === Languages.AR) {
      dispatch(SetLan(Languages.EN))


    } else {
      dispatch(SetLan(Languages.AR))

    }
  }

  const categoryRef: CategoryDTO[] =  Restaurant.categories?[...Restaurant.categories]:[];

  const [category, setcategory] = useState<CategoryDTO[]>(categoryRef);

  const [MenuItems, setMenuItems] = useState<ProductDTO[]>( Restaurant.products?[ ...Restaurant.products]:[])
  const [MenuItemsLoad, setMenuItemsLoad] = useState<boolean>(false)


  function CloseOpen(flag: boolean) {

 
      setCreateOrEditcategoryModal(flag)


  }

  function Addcategory(categoryNameAR: string, categoryNameEN: string) {
    return new Promise(function (resolve, reject) {
   
      axios.post(`${url}/categories/create`,{ restaurantId: Restaurant?.id, nameAr: categoryNameAR, nameEn: categoryNameEN  },{headers:{
        'Authorization':User.token
      }}).then(res=>{
        if(res.status===200){
          setcategory(res.data.data); 
          var restaurant:RestaurantT={...Restaurant}
          restaurant.categories=res.data.data;
          dispatch(SetRestaurant(restaurant));
          resolve(true);
        } 
      }).catch(err=>{
        console.log(err)
      });
   

      


    });


  }
  function Deletecategory(id: string) {
    return new Promise(function (resolve, reject) {
 
          axios.delete(`${url}/categories/delete?Id=${id}&RestaurantId=${Restaurant.id}`,{headers:{
            'Authorization':User.token
          }}).then(res=>{
            if(res.status===200){
              setcategory(res.data.data); 
              var restaurant:RestaurantT={...Restaurant}
              restaurant.categories=res.data.data;
              dispatch(SetRestaurant(restaurant));
              resolve(true);
            } 
          }).catch(err=>{
            
              localStorage.clear()
              window.location.replace('/login')
            
          });
        }
    );

  }
  function Editcategory(id: string, ArName: string, EnName: string) {
    return new Promise(function (resolve, reject) {
   
      var newcategory=[{
        id:id,
        nameAr:ArName,
        nameEn:EnName,
        isActive:true
      }];
 
      axios.post(`${url}/categories/edit`,{
        RestaurantId:User.RestaurantId,
        Categories:newcategory,
       },{headers:{
         'Authorization':User.token
       }}).then(res=>{ 
    
     
     
       var restaurant:RestaurantT={...Restaurant}
       restaurant.categories=res.data.data;
       dispatch(SetRestaurant(restaurant)); 
       setcategory(res.data.data);
       resolve(true)
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



  


    });
  }


  const [categoryActive, secategoryActive] = useState<string>(categoryRef.length>0?categoryRef[0].id:'');

useEffect(()=>{
  setMenuItemsLoad(true)
  axios.get(`${url}/product/bycategory/${categoryActive}`)
  .then(  function (response) {
    if(response.status===200){ 
       setMenuItems(response.data.data?response.data.data:[])
                  
       setMenuItemsLoad(false)
    }
   

  })
  .catch(function (error) {
    // handle error
    setMenuItemsLoad(false)
    console.log(error);
  }) 
},[categoryActive])
  function EditItem(Item: ProductDTO) { 
    return new Promise(function (resolve, reject) {
      let _MenuItems = [...MenuItems];
 
      let Index = _MenuItems.findIndex(ele => ele.id === Item.id);
 
      _MenuItems[Index]  = Item;
 
      setMenuItems(_MenuItems)

      resolve(true);


    });
  }
 
  function DeleteItem(id: string) {
    Swal.fire({
      title: strings.AreyousuredeletingtheItem, 
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText:strings.cancel,
      confirmButtonText: strings.Yesdeleteit,
    
    }).then((result:any) => {
      if (result.isConfirmed) {
        return new Promise(function (resolve, reject) {
          axios.delete(`${url}/product/delete?Id=${id}&CategoryId=${categoryActive}`,{headers:{
            'Authorization':User.token
          }}).then(res=>{
            if(res.data.statusCode===202){
           
           
              setCreateOrEditItemModal(false)
              toast.success(strings.getLanguage()===Languages.AR?res.data.messageAr:res.data.messageEn, {
                position: strings.getLanguage()===Languages.AR?"bottom-left":"bottom-right",
                autoClose: 1500,
                rtl:strings.getLanguage()===Languages.AR?true:false,
                hideProgressBar: true,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "colored",
                });
             
    
                setMenuItems(res.data.data)
                
          resolve(true);
    
            }
         
          }).catch(err=>{
            console.log(err)
          })
    
    
       
    
    
        });
  }}).catch(err=>{
          
  })




   
  }
  return (

    <section className={classes.body}>

      {/* Media section */}
      <div className={classes.Mediasection}>
        <div className={classes.LanguagePart} style={{background:` linear-gradient(180deg, rgba(${'63,63,63'},0.6) 0%, rgba(0,212,255,0) 100%)`}}>
<div>
{Restaurant.changeLanguageStatus?(
          <button className={classes.LanBtn} onClick={() => HandleLanChange()}>
            {_Lan === Languages.AR ? LanguagesTitle.EN : LanguagesTitle.AR}
          </button>
):""}
</div>
          {User.type === UserType.Admin ||User.type === UserType.Owner && (
            <button onClick={() => { setSettingModal(true) }} className={classes.btn + " " + classes.btnSettings}>

              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 32 32"  ><g><path d="M29.21 11.84a3.92 3.92 0 0 1-3.09-5.3 1.84 1.84 0 0 0-.55-2.07 14.75 14.75 0 0 0-4.4-2.55 1.85 1.85 0 0 0-2.09.58 3.91 3.91 0 0 1-6.16 0 1.85 1.85 0 0 0-2.09-.58 14.82 14.82 0 0 0-4.1 2.3 1.86 1.86 0 0 0-.58 2.13 3.9 3.9 0 0 1-3.25 5.36 1.85 1.85 0 0 0-1.62 1.49A14.14 14.14 0 0 0 1 16a14.32 14.32 0 0 0 .19 2.35 1.85 1.85 0 0 0 1.63 1.55A3.9 3.9 0 0 1 6 25.41a1.82 1.82 0 0 0 .51 2.18 14.86 14.86 0 0 0 4.36 2.51 2 2 0 0 0 .63.11 1.84 1.84 0 0 0 1.5-.78 3.87 3.87 0 0 1 3.2-1.68 3.92 3.92 0 0 1 3.14 1.58 1.84 1.84 0 0 0 2.16.61 15 15 0 0 0 4-2.39 1.85 1.85 0 0 0 .54-2.11 3.9 3.9 0 0 1 3.13-5.39 1.85 1.85 0 0 0 1.57-1.52A14.5 14.5 0 0 0 31 16a14.35 14.35 0 0 0-.25-2.67 1.83 1.83 0 0 0-1.54-1.49zM21 16a5 5 0 1 1-5-5 5 5 0 0 1 5 5z" data-name="Layer 2" fill="#000000" data-original="#000000" ></path></g></svg>
            </button>
          )}

        </div>

        {/* video */}
        {Restaurant.videoStatus && (
          <div className={classes.MediaVideosection}>
            <div className={classes.restaurantDetails} style={{ backgroundColor: `rgba(${Restaurant?Restaurant.color:'63, 63, 63'},0.2)` }}>
              <img
                className={classes.LogoImg}
                src={Restaurant?Restaurant.logo:''}

                alt="" />
            </div>
            <video autoPlay loop muted src={`${VideoPath}/${Restaurant.video?.fileName}`} >
              <source src={`${VideoPath}/${Restaurant.video?.fileName}`} type="video/mp4" />
            </video>
          </div>)}
        {/*End video */}


        {/* offer */}
        {Restaurant.offerStatus && (
          <Swiper
            dir={strings.getLanguage() === Languages.AR ? "rtl" : "ltr"}


            centeredSlides={true}
            autoplay={{
              delay: 8000,
              disableOnInteraction: false,
            }}

            pagination={false}
            navigation={false}
            modules={[Autoplay, Pagination, Navigation]}



          >
            {Restaurant.offers&&Restaurant.offers.length>0?Restaurant.offers.map(ele=>{
              return(   <SwiperSlide key={ele.id}>
                <img
                  className={classes.SwiperImage}
                  src={`${OffersImagePath}/${ele.fileName}`}
  
                  alt="" />
              </SwiperSlide>)
            }):""}
         
          

          </Swiper>
        )}
        {/* End offer */}


      </div>
      {/*End Media section */}

      {/* Menu Section */}
      <div className={classes.MenuCard}>
 
        <div className={classes.MenuLisrCard}>
           
          {category.length > 0 && (
            <Swiper
              dir={strings.getLanguage() === Languages.AR ? "rtl" : "ltr"}
              slidesPerView={'auto'}

              pagination={false}
              navigation={false}

              modules={[Pagination]}
              className={classes.SwiperMenuList + `    ${User.type === UserType.Admin ||User.type === UserType.Owner ? classes.PadInEnd40px : " "}`}
            >
              {category.map(Categ => {
               
                return (
                  <SwiperSlide key={`${Categ.id}${Categ.nameEn}`}
                    className={classes.MenuList + `   mx-3 ${Categ.id === categoryActive ? classes.active : ""}`} >
                    <div onClick={()=>secategoryActive(Categ.id)} style={Categ.id === categoryActive ? { borderBottomColor: `rgba(${Restaurant?Restaurant.color:'63, 63, 63'})` } : {}}
                      onMouseEnter={ele => { Categ.id != categoryActive ? ele.currentTarget.style.borderBottomColor = `rgba(${Restaurant?Restaurant.color:'63, 63, 63'})` : null }}
                      onMouseLeave={ele => { Categ.id != categoryActive ? ele.currentTarget.style.borderBottomColor = 'transparent' : null }} >
                      {strings.getLanguage() === Languages.AR ? Categ.nameAr : Categ.nameEn}
                    </div>
                  </SwiperSlide>
                )
              })}
            </Swiper>)}

          {User.type === UserType.Admin ||User.type === UserType.Owner && (
            <>
              {category.length === 0 && (
                <div>
                  <h4 className='p-0 m-0'>{strings.Categories}</h4>
                </div>)}
              <div className={classes.AddCategory}>


                <button className={classes.AddIcon}
                  onClick={() => { setCreateOrEditcategoryModal(true) }}
                  onMouseEnter={ele => { ele.currentTarget.style.backgroundColor = `rgba(${Restaurant?Restaurant.color:'63, 63, 63'})` }} onMouseLeave={ele => { ele.currentTarget.style.backgroundColor = 'rgba(0, 0, 0,0.9)' }} >
                  {category.length === 0 ? (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000" ></path></g></svg>

                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 492.493 492"   ><g><path d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>)}
                </button>
              </div>
            </>
          )}
        </div>
<div className={classes.AllProductContainer}>
 

        <div className={classes.AllProductCard}>


          {MenuItemsLoad?(<>
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </>):MenuItems.length > 0 ? MenuItems.map((product, i) => {
            return ( 
              <ItemCard key={i + product.nameEn} product={product} DeleteItem={DeleteItem} EditItem={EditItem} />
            )
          }) : (<NoItems/>)}

          {User.type === UserType.Admin ||User.type === UserType.Owner && (
            <div onClick={() => { setCreateOrEditItemModal(true) }} className={`${MenuItems.length > 0?`${classes.ProductCard + " " + classes.AddProductCard}`: classes.AddBtn }`} 
            style={MenuItems.length > 0?{ backgroundColor: `rgba(${Restaurant?Restaurant.color:'63, 63, 63'},0.1)`, borderColor: `rgba(${Restaurant?Restaurant.color:'63, 63, 63'})` }:{}}>

              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill={`rgba(${Restaurant?Restaurant.color:'63, 63, 63'})`} data-original="#000000" ></path></g></svg>

            </div>
          )}
        </div>
        <div>
</div>
        </div>
      </div>

      {/* End Menu Section */}




      {/* Modals */}




      <AddorEditcategoryModal CreateOrEditModal={CreateOrEditcategoryModal} setCreateOrEditModal={CloseOpen} category={category} Addcategory={Addcategory} Deletecategory={Deletecategory} Editcategory={Editcategory} />


      <AddorEditItemModal CreateOrEditItemModal={CreateOrEditItemModal} setCreateOrEditItemModal={setCreateOrEditItemModal} EditItem={EditItem}  categoryID={categoryActive} setMenuItems={setMenuItems} />
      <SettingsModal SettingModal={SettingModal} setSettingModal={setSettingModal} />

      {/* End Modals */}



      <ToastContainer />
    </section>



  )
}
 