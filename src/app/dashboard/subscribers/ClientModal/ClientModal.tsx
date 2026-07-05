import { strings } from '@/config/localization/LocalizedStrings';
import React, { useEffect, useState } from 'react'
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
import { RestaurantLogoPath, url } from '@/config/Api/url';
import { useRouter } from 'next/navigation';
import { HandleLogOut } from '@/config/HandleLogOut/HandleLogOut';
import { useAppSelector } from '@/config/Store/hooks';
import Image from 'next/image';
import { RestaurantDataDTO } from './types';
import { set } from 'animejs';
 
interface Props {
 AddClientModal: {state:boolean,id:string},
    SetAddClientModal: Function,
  
}


  export function hexToRgb(hex: any): string {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }
  export  function rgbToHex(r: string): string {
  return (
    "#" +
    [r.split(',')[0], r.split(',')[1], r.split(',')[2]]
      .map((x) => {
        const hex = Number(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

export default function ClientModal(props: Props) {

    const [Load, setLoad] = useState<boolean>(false);
    const [Done, setDone] = useState<boolean>(false);
    const [image, setImage] = useState<any>();
    const [RestaurantData, setRestaurantData] = useState<RestaurantDataDTO>();

 
  const User = useAppSelector((state) => state.User);

    function onChangeImage(event: any, setFieldValue: (field: string, value: any, shouldValidate?: boolean) => void) {
        if (event.target.files && event.target.files[0]) {
            setImage(event.target.files[0]);
            setFieldValue('restaurantLogo', URL.createObjectURL(event.target.files[0]))
        }


    }
    useEffect(() => {
      console.log(props.AddClientModal);
      if (props.AddClientModal.id) {
        axios
          .get(`${url}/restaurant/for-edit-by-id/${props.AddClientModal.id}`, {
            headers: {
              Authorization: User.token,
            },
          })
          .then((response) => {
            if(response.data.statusCode === 202){
            setRestaurantData(response.data.data);
 
            }
            
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }, [props.AddClientModal.id]);
    return (
      <Modal show={props.AddClientModal.state ? true : false} centered>
        <Modal.Header className="pb-0">
          <div className="d-flex w-100 justify-content-between  ">
            <h4 className="m-0 p-0">{strings.AddNewClient}</h4>
            <span
              style={{ cursor: "pointer" }}
              onClick={() =>
             {
              
                props.SetAddClientModal((prev:any)=>{return {...prev,state:false,id:""}})
                setImage(undefined);
                setRestaurantData(undefined);
                setDone(false); 
                setLoad(false);
             }
                }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                version="1.1"
                width="15"
                height="15"
                x="0"
                y="0"
                viewBox="0 0 320.591 320.591"
              >
                <g>
                  <path
                    d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z"
                    fill="#000000"
                    data-original="#000000"
                  ></path>
                  <path
                    d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z"
                    fill="#000000"
                    data-original="#000000"
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </Modal.Header>
 
        <Formik
          enableReinitialize={true}
          initialValues={{
            id:RestaurantData?.id,
             offerStatus: RestaurantData?.offerStatus,
    videoStatus : RestaurantData?.videoStatus,
    isActive : RestaurantData?.isActive,
            name: RestaurantData?.ownerName,
            phoneNumber: RestaurantData?.ownerPhoneNumber,
            email: RestaurantData?.ownerEmail,
            userName: RestaurantData?.ownerUserName,
            password: "",
            restaurantName: RestaurantData?.name,
            restaurantLogo: RestaurantData?.logo,
            restaurantColor: RestaurantData?.color,
          }}
          validationSchema={Yup.object().shape({
            restaurantLogo: Yup.string().required(strings.chooseClientlogo),
            restaurantName: Yup.string().required(strings.EnterplaceName),
            name: Yup.string().required(strings.EnterClientName),

            phoneNumber: Yup.string().required(strings.EnterPhoneNumber),
            userName: Yup.string().required(strings.userName),
            email: Yup.string().email().required(strings.EnterEmailAddress),
            password: Yup.string()
              .min(3, strings.TooShort)
              .max(30, strings.TooLong)
              .required(strings.Password),
            cpassword: Yup.string()
              .oneOf([Yup.ref("password"), ""], strings.Passwordsmustmatch)
              .required(strings.cPassword),
          })}
          onSubmit={async (values, actions) => {
            setLoad(true);
 
            var valuesData: any = new FormData();
            valuesData.append("id", values.id); 
            valuesData.append("offerStatus", values.offerStatus);
            valuesData.append("videoStatus", values.videoStatus);
            valuesData.append("isActive", values.isActive); 

            valuesData.append("name", values.name);
            valuesData.append("phoneNumber", values.phoneNumber);
            valuesData.append("email", values.email);
            valuesData.append("userName", values.userName);
            valuesData.append("password", values.password);
            valuesData.append("restaurantName", values.restaurantName);
            valuesData.append(
              "restaurantColor",
              hexToRgb(values.restaurantColor),
            );
            if (image) {
              valuesData.append("restaurantLogo", image);
            } else if(values.restaurantLogo) {
              valuesData.append("restaurantLogo", values.restaurantLogo);

            }
              axios
                .post(`${url}/user/owner-restaurant`, valuesData, {
                  headers: {
                    Authorization: User.token,
                  },
                })
                .then(function (response) {
                  console.log(response.data);
                  if (response.data.statusCode === 202) {
                    setDone(true);
                    setTimeout(() => {
                      props.SetAddClientModal((prev:any)=>{return {...prev,state:false,id:""}})
                    }, 850);
                  }
                })
                .catch(function (error) {
                  console.log(error);
                  // handle error
                  setLoad(false);
                  if (
                    error.response.data.error.message
                      .toLowerCase()
                      .includes("duplicate")
                  ) {
                    toast.error(strings.Thisuseralreadyexists, {
                      position: "bottom-right",
                      autoClose: 25000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    });
                    actions.resetForm();
                  } else if (error.request.status === 401) {
                    toast.error(strings.Anerroroccurred, {
                      position: "bottom-right",
                      autoClose: 25000,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                      theme: "dark",
                    });
                    localStorage.clear();
                    window.location.replace("/login");
                  }
                });
          }}
        >
          {({ errors, touched, values, setFieldValue }) => (
            <>
              <Form className={"row p-3"}>
                {Done && (
                  <div className={classes.DoneImage}>
                    <Image
                      className={"animate__backInUp animate__animated  "}
                      src="/Image/done.png"
                      width={250}
                      height={250}
                      alt="done"
                    />
                  </div>
                )}
                <div className="col-12 d-flex justify-content-center ">
                  <div className={classes.AddItemImageForm}>
                    <img
                      src={
                        values.restaurantLogo
                          ? `${values.restaurantLogo}
`
                          : itemImage.src
                      }
                      alt=""
                    />

                    <label
                      htmlFor="ItemProduct"
                      style={{
                        backgroundColor: `rgb(${values.restaurantColor})`,
                      }}
                    >
                      {values.restaurantLogo ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="15"
                          height="15"
                          x="0"
                          y="0"
                          viewBox="0 0 492.493 492"
                        >
                          <g>
                            <path
                              d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0"
                              fill="#000000"
                              data-original="#000000"
                            ></path>
                          </g>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          version="1.1"
                          width="15"
                          height="15"
                          x="0"
                          y="0"
                          viewBox="0 0 448 448"
                        >
                          <g>
                            <path
                              d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0"
                              fill="#000000"
                              data-original="#000000"
                            ></path>
                          </g>
                        </svg>
                      )}
                    </label>
                    <input
                      id="ItemProduct"
                      type="file"
                      accept="image/*"
                      onChange={($e) => onChangeImage($e, setFieldValue)}
                    />

                    <div className="w-100 my-2 d-flex justify-content-center">
                      <ErrorMessage
                        className={classes.ErrorMessage}
                        component="span"
                        name="restaurantLogo"
                      />
                    </div>
                  </div>
                </div>
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"name"}
                    placeholder={strings.ClientName}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="name"
                  />
                </div>
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"restaurantName"}
                    placeholder={strings.placeName}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="restaurantName"
                  />
                </div>
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"email"}
                    placeholder={strings.EmailAddress}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="email"
                  />
                </div>
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"phoneNumber"}
                    placeholder={strings.PhoneNumber}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="phoneNumber"
                  />
                </div>{" "}
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"userName"}
                    placeholder={strings.userName}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="userName"
                  />
                </div>{" "}
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"password"}
                    type="password"
                    placeholder={strings.Password}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="password"
                  />
                </div>{" "}
                <div className="col-12 col-md-6 p-1">
                  <Field
                    disabled={Load}
                    className={"form-control"}
                    autoComplete="off"
                    name={"cpassword"}
                    type="password"
                    placeholder={strings.cPassword}
                  />
                  <ErrorMessage
                    className={classes.ErrorMessage}
                    component="span"
                    name="cpassword"
                  />
                </div>
                <div className="col-12 col-md-6 p-1 d-flex align-items-center justify-content-between">
                  <label className="m-0 p-0" htmlFor="restaurantColor">
                    {strings.chooseClientcolor}
                  </label>
                  <Field
                    id="restaurantColor"
                    disabled={Load}
                    className={""}
                    autoComplete="off"
                    value={rgbToHex(values.restaurantColor?values.restaurantColor:"#000000")}
                    type="color"
                    name={"restaurantColor"}
                  />
                </div>
                <div className="d-flex justify-content-center w-100">
                  <button
                    className="btn bg-gradient-dark mb-0 w-80"
                    disabled={Load}
                    type="submit"
                  >
                    {Load ? (
                      <>
                        <div
                          className="spinner-border spinner-border-sm "
                          role="status"
                        >
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </>
                    ) : (
                      <>{strings.register}</>
                    )}
                  </button>
                </div>
              </Form>
            </>
          )}
        </Formik>
      </Modal>
    );
}
