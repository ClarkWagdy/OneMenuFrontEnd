import { strings } from '@/config/localization/LocalizedStrings';
import React, { useState } from 'react'
import classes from '../../Dashboard.module.scss'
import Modal from 'react-bootstrap/Modal';
import itemImage from '../../../../../public/Image/item.webp';

import {
    Formik,
    Form,
    Field,
    ErrorMessage,
    FieldProps,
} from 'formik';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Yup from 'yup';
import axios from 'axios';
import { url } from '@/config/Api/url';

interface Props {
    show: Boolean,
    SetAddClientModal: Function,
}
export default function ClientModal(props: Props) {
    const [Load, setLoad] = useState<boolean>(false);
    const [Done, setDone] = useState<boolean>(false);
    const [Image, setImage] = useState<any>();
    function onChangeImage(event: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
            setFieldValue('restaurantLogo', URL.createObjectURL(event.target.files[0]))
        }


    }
    return (
        <Modal show={props.show ? true : false} centered  >
            <Modal.Header className='pb-0'>
                <div className='d-flex w-100 justify-content-between  '>
                    <h4 className='m-0 p-0'>{strings.AddNewClient}</h4>
                    <span style={{ cursor: 'pointer' }} onClick={() => props.SetAddClientModal(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
                    </span>
                </div>
            </Modal.Header>

            <Formik
                enableReinitialize={true}
                initialValues={{
                    name: '',
                    phoneNumber: '',
                    email: '',
                    userName: '',
                    password: '',
                    restaurantName: "",
                    restaurantLogo: "",
                    restaurantColor: "",
                }}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required(strings.Name),
                        phoneNumber: Yup.string().required(strings.EnterYourphonenumber),
                        userName: Yup.string().required(strings.userName),
                        email: Yup.string().email().required(strings.Enteryouremail),
                        password: Yup.string().min(3, strings.TooShort).max(30, strings.TooLong).required(strings.Password),
                        cpassword: Yup.string().oneOf([Yup.ref('password'), ''], strings.Passwordsmustmatch).required(strings.cPassword)
                    })
                }
                onSubmit={async (values, actions) => {

                    setLoad(true)
                    // axios.post(`${url}/user/register`, { ...values })
                    //     .then(function (response) {
                    //         console.log(response.data)
                    //         if (response.data.statusCode === 202) {
                    //             setDone(true)
                    //             setTimeout(() => {
                    //                 router.replace(`/`);
                    //             }, 8000);

                    //         }


                    //     })
                    //     .catch(function (error) {
                    //         // handle error
                    //         setLoad(false)
                    //         if (error.response.data.error.message.toLowerCase().includes('duplicate')) {

                    //             toast.error(strings.Thisuseralreadyexists, {
                    //                 position: "bottom-right",
                    //                 autoClose: 25000,
                    //                 hideProgressBar: false,
                    //                 closeOnClick: true,
                    //                 pauseOnHover: true,
                    //                 draggable: true,
                    //                 progress: undefined,
                    //                 theme: "dark",
                    //             });
                    //             actions.resetForm();
                    //         }
                    //     })


                }}
            >

                {({ errors, touched, values, setFieldValue }) => (
                    <Form className={'row p-3'}>
                        <div className="col-12 d-flex justify-content-center " >
                            <div className={classes.AddItemImageForm}>
                                <img src={values.restaurantLogo ? values.restaurantLogo : itemImage.src} alt="" />

                                <label htmlFor='ItemProduct' style={{ backgroundColor: `rgb(${values.restaurantColor})` }}>
                                    {values.restaurantLogo ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 492.493 492"   ><g><path d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000" ></path></g></svg>

                                    )}
                                </label>
                                <input id='ItemProduct' type="file" accept='image/*' onChange={($e) => onChangeImage($e, setFieldValue)} />

                                <div className='w-100 my-2 d-flex justify-content-center'>
                                    <ErrorMessage className={classes.ErrorMessage} component="span" name="image" />

                                </div>

                            </div>
                        </div>



                        <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"name"} placeholder={strings.Name} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="name" />

                        </div>

                        <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"email"} placeholder={strings.Enteryouremail} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="email" />
                        </div>
                        <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"phoneNumber"} placeholder={strings.EnterYourphonenumber} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="phoneNumber" />
                        </div>       <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"userName"} placeholder={strings.userName} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="userName" />
                        </div>       <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"password"} type='password' placeholder={strings.Password} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="password" />
                        </div>            <div className='col-12 col-md-6 p-1'>
                            <Field disabled={Load} className={"form-control"} autoComplete="off" name={"cpassword"} type='password' placeholder={strings.cPassword} />
                            <ErrorMessage className={classes.ErrorMessage} component="span" name="cpassword" />
                        </div>
                        <button disabled={Load} type='submit' >
                            {Load ? (<>
                                <div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </>) : (<>{strings.register}</>)}

                        </button>
                    </Form>
                )}

            </Formik>


        </Modal>
    )
}
