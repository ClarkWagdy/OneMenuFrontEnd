'use client'
import React, { FC, useState } from 'react'
import classes from "./login.module.css";
import Image from 'next/image'
import Copyright from "@/Component/Copyright/Copyright";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  Formik,
  Form,
  Field,
  ErrorMessage,
  FieldProps,
} from 'formik';
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
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { UserEnum } from '@/config/UserEnum/UserEnum';
import Authenticating from '@/config/Authenticating/Authenticating';
import HeadTag from '@/Component/Head/HeadTag';

export default function Login() {
  const [Load, setLoad] = useState<boolean>(false);

  const _Lan = useAppSelector((state) => state.Lan)
  const dispatch = useAppDispatch();

  function HandleLanChange() {
    if (_Lan === Languages.AR) {
      dispatch(SetLan(Languages.EN))


    } else {
      dispatch(SetLan(Languages.AR))

    }
  }


  Authenticating()


  return (<>
    <HeadTag title={strings.signin} description="All in one chip" keywords={"One card, NFC, nfc, chip"} />

    <ToastContainer rtl={strings.getLanguage() === Languages.AR ? true : false} />
    <div className={classes.LanguagePart}>
      <button className={classes.LanBtn} onClick={() => HandleLanChange()}>
        {_Lan === Languages.AR ? LanguagesTitle.EN : LanguagesTitle.AR}
      </button>
    </div>
    <div className={classes.main}>

      <section className={classes.Logodiv}>
        <div>
          <Image className={classes.Logo} src="/wlogo.svg" width={500} height={500} alt="All in One Chip" />

        </div>

      </section>

      <section className={"animate__animated  animate__fadeInUp " + classes.LoginForm}>

        <div>
          <h2>{strings.Welcomeback}</h2>
          <p>{strings.Menumanagementsystem} </p>
        </div>
        <Formik
          enableReinitialize={true}
          initialValues={{
            UserName: '',
            Password: '',
          }}
          validationSchema={
            Yup.object().shape({
              UserName: Yup.string().required(strings.Required),
              Password: Yup.string().min(3, strings.TooShort).max(30, strings.TooLong).required(strings.Required),

            })
          }
          onSubmit={async (values, actions) => {

            setLoad(true)
            axios.post(`${url}/user/login`, { ...values })
              .then(function (response) {




                if (response.data.statusCode === 200 || response.data.statusCode === 202) {
                  var user: UserT = { ...response.data.data.user };

                  console.log(response.data, user.type === UserEnum.Owner)
                  if (user.type === UserEnum.Admin) {

                    dispatch(SetUser(user));
                    redirect(`/dashboard`);
                  } else if (user.type === UserEnum.Owner) {
                    var restaurant: RestaurantT = { ...response.data.data.restaurant };

                    user.RestaurantId = restaurant.id;
                    dispatch(SetUser(user));
                    dispatch(SetRestaurant(restaurant));
                    redirect(`/menu/${restaurant.id}`);
                  }

                }
                else if (response.data.statusCode === 404) {
                  toast.error(strings.getLanguage() === Languages.AR ? response.data.messageAr : response.data.messageEn, {
                    position: "bottom-right",
                    autoClose: 25000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: "dark",
                  });
                }
                setLoad(false)
              })
              .catch(function (error) {
                // handle error
                setLoad(false)
                console.log(error);
              })


          }}
        >

          {({ errors, touched, values, setFieldValue }) => (
            <Form className={classes.LoginFormik}>
              <Field disabled={Load} className={classes.LoginField} autoComplete="off" name={"UserName"} placeholder={strings.CodeorEmail} />
              <ErrorMessage className={classes.ErrorMessage} component="span" name="UserName" />

              <Field disabled={Load} className={classes.LoginField} autoComplete="off" name={"Password"} type='password' placeholder={strings.Password} />
              <ErrorMessage className={classes.ErrorMessage} component="span" name="Password" />

              <div>
                <button disabled={Load} type='submit' >
                  {Load ? (<>
                    <div className="spinner-border spinner-border-sm" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </>) : (<>{strings.Login}</>)}

                </button>


              </div>




            </Form>
          )}

        </Formik>


        <div className='my-1'>
          {strings.Donthaveaccount} <Link href="/register">{strings.createanaccount}</Link>
        </div>

        <Copyright />
      </section>

    </div>

  </>)
}
