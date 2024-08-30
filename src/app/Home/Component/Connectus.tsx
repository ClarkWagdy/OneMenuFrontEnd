'use client'
import React, { useState } from 'react'
import { strings } from '@/config/localization/LocalizedStrings'

import {
    Formik,
    Form,
    Field,
    ErrorMessage,
    FieldProps,
} from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { url } from '@/config/Api/url';
import { toast } from 'react-toastify';
import { Languages } from '@/config/localization/Languages';


export default function Connectus() {
    const [Load, setLoad] = useState<boolean>(false);
    const [done, setdone] = useState<boolean>(false);

    const [Message, setMessage] = useState<string>();

    return (
        <section className="newsletter section text-light">
            <div className="container-sm">
                <div className="newsletter-inner section-inner">
                    <div className="newsletter-header text-center">
                        <h2 className="section-title mt-0">{strings.Connectus}</h2>
                        <p className="section-paragraph">
                            {strings.Leaveyourmessageandwewillgetbacktoyou}
                        </p>
                    </div>
                    {done && Message ? (
                        <div className='d-flex justify-content-center flex-column align-items-center'>
                            <img width={'150px'} src="/Connectus.gif" alt="" />
                            <p className="section-paragraph text-center">
                                {Message}
                            </p>
                        </div>
                    ) : (
                        <Formik
                            enableReinitialize={true}
                            initialValues={{
                                message: '',
                                email: '',
                                phoneNumber: ''

                            }}
                            validationSchema={
                                Yup.object().shape({
                                    message: Yup.string().required(strings.Enteryourmessageorinquiry),
                                    // email: Yup.string().email().required(strings.Enteryouremail),
                                    phoneNumber: Yup.string().matches(/^01[0125][0-9]{8}$/, strings.Enteravalidphonenumber).required(strings.Enteravalidphonenumber),


                                })
                            }
                            onSubmit={async (values, actions) => {

                                setLoad(true)
                                axios.post(`${url}/connect-us`, { ...values })
                                    .then(function (response) {


                                        if (response.data.statusCode === 200 || response.data.statusCode === 202) {
                                            setdone(true)
                                            setMessage(strings.getLanguage() === Languages.AR ? response.data.messageAr : response.data.messageEn);

                                        }
                                        else if (response.data.statusCode === 404) {
                                            setdone(false)
                                            setMessage(response.data.data)
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
                                <Form className="footer-form  flex-column gap-3 field field-grouped">
                                    <div className="control control-expanded w-100">
                                        <Field disabled={Load} as="textarea" className="input textarea" rows={5} name="message" placeholder={strings.YourMessage}></Field>
                                        <ErrorMessage className={"ErrorMessage"} component="span" name="message" />

                                    </div>
                                    <div className="control control-expanded w-100">
                                        <Field disabled={Load} className="input" name="email" placeholder={strings.Enteryouremail} />
                                        <ErrorMessage className={"ErrorMessage"} component="span" name="email" />
                                    </div>
                                    <div className="control control-expanded w-100">
                                        <Field disabled={Load} className="input" name="phoneNumber" placeholder={strings.EnterYourphonenumber} />
                                        <ErrorMessage className={"ErrorMessage"} component="span" name="phoneNumber" />
                                    </div>
                                    <div className="control w-100">
                                        <button className="button button-primary button-block button-shadow w-100" type='submit'>
                                            {Load ? (<>
                                                <div className="spinner-border spinner-border-sm" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </>) : (<>
                                                {strings.submit}</>)}</button>
                                    </div>
                                </Form>
                            )}

                        </Formik>

                    )}







                </div>
            </div>
        </section>
    )
}
