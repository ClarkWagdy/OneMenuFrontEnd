import { Languages } from '@/config/localization/Languages';
import { useAppSelector } from '@/config/Store/hooks';
import React, { FC, useState } from 'react'
import { Modal } from 'react-bootstrap'
import classes from '../Menu.module.css';
import 'bootstrap/dist/css/bootstrap.min.css'; 
import { strings } from '@/config/localization/LocalizedStrings';
import itemImage from '../../../../public/Image/item.webp';
import translate from "translate";
import {
  Formik, 
  Form,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';
import * as Yup from 'yup';
import { ProductDTO } from '@/config/Store/Restaurant/RestaurantType';
import axios from 'axios';
import { productImagePath, url } from '@/config/Api/url';
import { toast } from 'react-toastify';
interface Props {
  CreateOrEditItemModal: boolean
  setCreateOrEditItemModal: Function
  EditItem?:Function
  setMenuItems?:Function

  product?: ProductDTO 
  categoryID?:string
}

const AddorEditItemModal: FC<Props> = (props) => {

  const _Lan = useAppSelector((state) => state.Lan);
  const User = useAppSelector((state) => state.User);
  const Restaurant = useAppSelector((state) => state.Restaurant);

  const [Load, setLoad] = useState<boolean>(false); 
  const [Image, setImage] = useState<any>(); 

  function onChangeImage(event: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
   setFieldValue('image',   URL.createObjectURL(event.target.files[0]))
    }


  }
  async function Translation(nameAr: string, nameEn: string, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
   
    if (nameAr&&nameAr!==' ') {
      const en = await translate(nameAr, { from: 'ar', to: 'en', engine: "google" });

      setFieldValue("nameEn", en)
    }
    else if (nameEn&&nameEn!==' ') {
      const ar = await translate(nameEn, { from: 'en', to: 'ar', engine: "google" });
      setFieldValue("nameAr", ar)

    }

  }
  async function TranslationDesc(descAR: string | undefined, descEN: string | undefined, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
    if (descAR&&descAR!==' ') {
      const en = await translate(descAR, { from: 'ar', to: 'en', engine: "google" });
      setFieldValue("descEN", en)
    }
    else if (descEN&&descEN!==' ') {
      const ar = await translate(descEN, { from: 'en', to: 'ar', engine: "google" });
      setFieldValue("descAR", ar)
    }

  }
  return (
    <Modal

      show={props.CreateOrEditItemModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      backdrop="static"
      centered
      contentClassName={classes.ModalClass}
      dir={_Lan === Languages.AR ? 'rtl' : 'ltr'}
    >

      {Load && (
        <div className={classes.ModalLoading}>
          <div className="spinner-border Name-light" role="status">
            <span className="sr-only"> </span>
          </div></div>
      )}

      <Modal.Body>

        <div className={classes.CloseContain}>
          <h4>{props.product ? `${strings.Edit}  ${_Lan === Languages.AR ? props.product.nameAr : props.product.nameEn}` : strings.CreateNewItem}</h4>
          <button className={classes.btn + " " + classes.btnClose} onClick={() => props.setCreateOrEditItemModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
          </button>
        </div>


 

        <Formik
          enableReinitialize={true}
          initialValues={{
            image: props.product ? `${productImagePath}/${props.product.image}` : itemImage.src,
            nameAr: props.product ? props.product.nameAr : "",
            nameEn: props.product ? props.product.nameEn : "",
            descAR: props.product ? props.product.descAR?props.product.descAR:"" : "",
            descEN: props.product ? props.product.descEN?props.product.descEN:"" : "",
            order: props.product ? props.product.order : "",
            price: props.product ? props.product.price : "",
          }}
          validationSchema={
            Yup.object().shape({
              image:Yup.string().required(strings.Required),
              nameAr: Yup.string().min(3, strings.TooShort).max(30, strings.TooLong).required(strings.Required),
              nameEn: Yup.string().min(3, strings.TooShort).max(30, strings.TooLong).required(strings.Required),
              descAR: Yup.string().min(20, strings.TooShort).max(100, strings.TooLong),
              descEN: Yup.string().min(20, strings.TooShort).max(100, strings.TooLong),
              order: Yup.number().required(strings.Required),
              price: Yup.number().required(strings.Required),
            })
          }
          onSubmit={(values, actions) => { 
           setLoad(true) 
            if(props.product ){
              var valuesData:any=new FormData();
              valuesData.append('nameAr',values.nameAr);
              valuesData.append('nameEn',values.nameEn);
              valuesData.append('descAR',values.descAR);
              valuesData.append('descEN',values.descEN);
              valuesData.append('price',values.price);
              valuesData.append('order',values.order);
              valuesData.append('isActive',true);

      
              valuesData.append('categoryID',props.categoryID);
              valuesData.append('productID',props.product.id);
              if(Image){
                valuesData.append('image',Image);
              }
             

           
           
              axios.post(`${url}/product/edit`,valuesData,{headers:{
                'Authorization':User.token
              }}).then(res=>{
 
                if(res.data.statusCode===202){
                  setLoad(false);
               
                  props.setCreateOrEditItemModal(false)
                  props.EditItem?props.EditItem(res.data.data):"";
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


                     
                }
             
              }).catch(err=>{
                console.log(err)
              }); 
            }
            else if(props.product===undefined){ 
              var valuesData:any=new FormData();
              valuesData.append('nameAr',values.nameAr);
              valuesData.append('nameEn',values.nameEn);
              valuesData.append('descAR',values.descAR);
              valuesData.append('descEN',values.descEN);
              valuesData.append('price',values.price);
              valuesData.append('order',values.order);
              valuesData.append('categoryID',props.categoryID);
              valuesData.append('image',Image);

             

           
           
              axios.post(`${url}/product/create`,valuesData,{headers:{
                'Authorization':User.token
              }}).then(res=>{
 
                if(res.data.statusCode===202){
                  setLoad(false);
               
                  props.setCreateOrEditItemModal(false)
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
                    props.setMenuItems? props.setMenuItems(res.data.data):'';
                }
             
              }).catch(err=>{
                console.log(err)
              }); 
            }

          }}
        >

          {({ errors, touched, values, setFieldValue ,isValid}) => (
            <Form className={classes.AddItemForm}>
              <div className={classes.AddItemImageForm}>
                <img src={values.image} alt="" />
 
                <label htmlFor='ItemProduct' style={{ backgroundColor: `rgb(${Restaurant.color})` }}>
                  {props.product && props.product.image ? (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 492.493 492"   ><g><path d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000" ></path></g></svg>

                  )}
                </label>
                <input id='ItemProduct' type="file" accept='image/*' onChange={($e) => onChangeImage($e,setFieldValue)} />
              </div>
              <div className='my-1 w-100'>
                <h5 className='p-0 m-0'>{strings.ItemName}</h5>
                <div className={classes.Inputsflexcenter}>
                  <div className='d-flex flex-column w-100'>
                    <Field name='nameAr' className={classes.AddInput} placeholder={strings.NameofthenewIteminArabic} style={errors.nameAr && touched.nameEn ? { borderColor: "tomato" } : {}} />
                    <ErrorMessage className={classes.ErrorMessage} component="span" name="nameAr" />
                  </div>
                  <button disabled={(!values.nameAr && !values.nameEn)} type='button' onClick={() => Translation(values.nameAr, values.nameEn, setFieldValue)} className={classes.btn + " " + classes.TranslatBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><clipPath id="a"><path d="M0 0h24v24H0z" fill="#000000" data-original="#000000"  ></path></clipPath><g clipPath="url(#a)"><path fill="#000000" d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99 0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7 1.62-4.33L19.12 17z" data-original="#000000" ></path></g></g></svg>
                  </button>

                  <div className='d-flex flex-column w-100'>
                    <Field name='nameEn' className={classes.AddInput} placeholder={strings.NameofthenewIteminEnglish} style={errors.nameEn && touched.nameEn ? { borderColor: "tomato" } : {}} />
                    <ErrorMessage className={classes.ErrorMessage} component="span" name="nameEn" />
                  </div>
                </div>
              </div>
              <div className='my-1 w-100'>
                <h5 className='p-0 m-0'>{strings.ItemDescription}</h5>
                <div className={classes.Inputsflexcenter}>
                  <div className='d-flex flex-column w-100'>
                    <Field name='descAR' className={classes.AddInput} placeholder={strings.NameofthenewIteminArabic} style={errors.descAR && touched.descAR ? { borderColor: "tomato" } : {}} />
                    <ErrorMessage className={classes.ErrorMessage} component="span" name="descAR" />
                  </div>
                  <button disabled={(!values.descAR && !values.descEN)} type='button' onClick={() => TranslationDesc(values.descAR, values.descEN, setFieldValue)} className={classes.btn + " " + classes.TranslatBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><clipPath id="a"><path d="M0 0h24v24H0z" fill="#000000" data-original="#000000"  ></path></clipPath><g clipPath="url(#a)"><path fill="#000000" d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99 0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7 1.62-4.33L19.12 17z" data-original="#000000" ></path></g></g></svg>
                  </button>
                  <div className='d-flex flex-column w-100'>
                    <Field name='descEN' className={classes.AddInput} placeholder={strings.NameofthenewIteminEnglish} style={errors.descEN && touched.descEN ? { borderColor: "tomato" } : {}} />
                    <ErrorMessage className={classes.ErrorMessage} component="span" name="descEN" />
                  </div>
                </div>
              </div>
              <div className='my-1 w-100'>
                <div className={classes.Inputsflexcenter}>
                  <div className='w-100'>
                    <h5 className='p-0 m-0'>{strings.Order}</h5>
                    <div className='d-flex flex-column w-100'>
                      <Field name='order' type="number" className={classes.AddInput + " " + classes.paddinginend} placeholder={strings.OrderplaceHolder}   style={errors.order && touched.order ? { borderColor: "tomato" } : {}} />
                      <ErrorMessage className={classes.ErrorMessage} component="span" name="order" />
                    </div>
                  </div>
                  <div className='w-100'>
                    <h5 className='p-0 m-0'>{strings.Price}</h5>
                    <div className='d-flex flex-column w-100'>
                      <Field name='price' type='number'  className={classes.AddInput + " " + classes.paddinginend} placeholder={strings.PriceplaceHolder} style={errors.price && touched.price ? { borderColor: "tomato" } : {}} />
                      <ErrorMessage className={classes.ErrorMessage} component="span" name="price" />
                    </div>
                  </div>
                </div>
              </div>

              <div className={classes.dCenter + "   w-100"}>
                
                <button disabled={!isValid} type='submit' className={classes.AddBtn + " " + classes.Save_Btn} >
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 512 512" ><g><path d="m507.606 100.794-96.4-96.4A15 15 0 0 0 400.6 0H55.166C24.748 0 0 24.748 0 55.167v401.666C0 487.252 24.748 512 55.166 512h401.666c30.42 0 55.168-24.748 55.168-55.167V111.4a15 15 0 0 0-4.394-10.606zM353.467 30v121.566c0 13.877-11.29 25.167-25.167 25.167H151.566c-13.877 0-25.167-11.29-25.167-25.167V30zM126.399 482V328.3c0-13.876 11.29-25.166 25.167-25.166h208.866c13.877 0 25.167 11.29 25.167 25.166V482zM482 456.833C482 470.71 470.71 482 456.833 482H415.6V328.3c0-30.418-24.748-55.166-55.167-55.166H151.566c-30.419 0-55.167 24.748-55.167 55.166V482H55.166C41.29 482 30 470.71 30 456.833V55.167C30 41.29 41.29 30 55.166 30h41.233v121.566c0 30.419 24.748 55.167 55.167 55.167H328.3c30.419 0 55.167-24.748 55.167-55.167V30h10.919L482 117.614z" fill="#000000" data-original="#000000" ></path><path d="M304.2 142.467c8.284 0 15-6.716 15-15v-48.2c0-8.284-6.716-15-15-15s-15 6.716-15 15v48.2c0 8.284 6.716 15 15 15z" fill="#000000" data-original="#000000" ></path></g></svg>
                  {strings.Save}
                </button>
              </div>
            </Form>
          )}

        </Formik>






      </Modal.Body>


    </Modal>
  )
}
export default AddorEditItemModal;