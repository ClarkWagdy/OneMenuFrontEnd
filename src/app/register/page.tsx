'use client'
import React, { FC, useState } from 'react'
import classes from "./Register.module.css";
import Image from 'next/image'
import Copyright from "@/Component/Copyright/Copyright";
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
import { strings } from '@/config/localization/LocalizedStrings';
import { Languages, LanguagesTitle } from '@/config/localization/Languages';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { SetLan } from '@/config/Store/Lan/LanSlice';
import { SetLoad } from '@/config/Store/Load/LoadSlice';
import axios from 'axios';
import { url } from '@/config/Api/url';
import { SetUser } from '@/config/Store/User/UserSlice';
import { UserT } from '@/config/Store/User/UserType';
import { SetRestaurant } from '@/config/Store/Restaurant/RestaurantSlice';
import { RestaurantT } from '@/config/Store/Restaurant/RestaurantType';
import { redirect, useRouter } from 'next/navigation'
import Link from 'next/link';
import Head from './head';
import Authenticating from '@/config/Authenticating/Authenticating';

export default function Register() {
  const [Load, setLoad] = useState<boolean>(false);
  const [Done, setDone] = useState<boolean>(false);

  const _Lan = useAppSelector((state) => state.Lan)
  const dispatch = useAppDispatch();
  const router = useRouter();
  function HandleLanChange() {
    if (_Lan === Languages.AR) {
      dispatch(SetLan(Languages.EN))


    } else {
      dispatch(SetLan(Languages.AR))

    }
  }

  Authenticating()
  return (<>

    <Head />
    <ToastContainer rtl={strings.getLanguage() === Languages.AR ? true : false} />


    <div className={classes.LanguagePart}>
      <button className={classes.LanBtn} onClick={() => HandleLanChange()}>
        {_Lan === Languages.AR ? LanguagesTitle.EN : LanguagesTitle.AR}
      </button>
    </div>
    <div className={classes.main}>

      <section className={classes.Logodiv}>
        <div>
          
          <Image className={classes.Logo} onClick={()=>{
            router.replace('/')
          }} src="/wlogo.svg" width={500} height={500} alt="All in One Chip" />

        </div>

      </section>


      {Done ? (
        <section className={"animate__animated  animate__fadeInUp " + classes.RegisterForm}>







          <Image className={"animate__backInUp animate__animated  " + classes.Logo} src="/Image/done.png" width={250} height={250} alt="done" />


          <div className="animate__backInUp animate__animated ">

            <h2>{strings.Anewaccounthasbeencreated}</h2>
            <p>{strings.Wewillcallyousoon} </p>

            <Copyright />
          </div>




        </section>
      ) : (

        <section className={"animate__animated  animate__fadeInUp " + classes.RegisterForm}>


          <div>
            <h2>{strings.Welcomeback}</h2>
            <p>{strings.Menumanagementsystem} </p>
          </div>

          <Formik
            enableReinitialize={true}
            initialValues={{
              name: '',
              phoneNumber: '',
              email: '',
              userName: '',
              password: '',
              type: 0
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
              axios.post(`${url}/user/register`, { ...values })
                .then(function (response) {
                  console.log(response.data)
                  if (response.data.statusCode === 202) {
                    setDone(true)
                    setTimeout(() => {
                      router.replace(`/`);
                    }, 8000);

                  }


                })
                .catch(function (error) {
                  // handle error
                  setLoad(false)
                  if (error.response.data.error.message.toLowerCase().includes('duplicate')) {

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
                  }
                })


            }}
          >

            {({ errors, touched, values, setFieldValue }) => (
              <Form className={classes.RegisterFormik}>
                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"name"} placeholder={strings.Name} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="name" />

                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"email"} placeholder={strings.Enteryouremail} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="email" />

                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"phoneNumber"} placeholder={strings.EnterYourphonenumber} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="phoneNumber" />

                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"userName"} placeholder={strings.userName} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="userName" />

                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"password"} type='password' placeholder={strings.Password} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="password" />

                <Field disabled={Load} className={classes.RegisterField} autoComplete="off" name={"cpassword"} type='password' placeholder={strings.cPassword} />
                <ErrorMessage className={classes.ErrorMessage} component="span" name="cpassword" />
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



          <div className='my-1'>
            {strings.haveaccount} <Link href="/login">{strings.signin}</Link>
          </div>

          <Copyright />
        </section>
      )}
    </div>

  </>)
}
