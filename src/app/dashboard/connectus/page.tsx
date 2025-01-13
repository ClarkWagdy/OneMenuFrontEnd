'use client'
import { url } from '@/config/Api/url';
import { HandleLogOut } from '@/config/HandleLogOut/HandleLogOut';
import { strings } from '@/config/localization/LocalizedStrings'
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react'
import classes from '../Dashboard.module.scss'
import { MessagesT } from './Type';
import NoItems from '@/Component/NoItems/NoItems';
import Loading from '@/Component/Loading/Loading';
import Modal from 'react-bootstrap/Modal';
import Moment from 'react-moment';
import 'moment/locale/ar';
// import 'bootstrap/dist/js/bootstrap.js';
import { Languages } from '@/config/localization/Languages';
import Swal from 'sweetalert2';

import { ToastContainer, toast } from 'react-toastify';
import { SetNonRead } from '@/config/Store/NonRead/NonRead';
import { Interval } from '@/config/Intervaltime/Intervaltime';
import HeadTag from '@/Component/Head/HeadTag';
import Sidebar from '../Sidebar';
import { toggleSidenav } from '@/config/toggleSide/toggleSidenav';
import Navbar from '../Navbar';
import Authenticating from '@/config/Authenticating/Authenticating';
export default function ConnectUs() {
  Authenticating();
 
    const [MessagesList, setMessagesList] = useState<MessagesT[]>([]);
    const User = useAppSelector((state) => state.User);
    const [Filter, setFilter] = useState<string>("");
    const [Load, SetLoad] = useState<boolean>(true);
    const [Count, setCount] = useState<number>(25);
    const [write, Setwrite] = useState<boolean>(false);
    const [done, Setdone] = useState<boolean>(false);
    const [Read, SetRead] = useState<boolean>(false);
    const [MessageIndex, SetMessageIndex] = useState<number>(-1);


    const dispatch = useAppDispatch();

    const [PageNumber, setPageNumber] = useState<number>(1);


    const handleGetAll = useCallback(() => {
        axios.get(`${url}/connect-us?${Filter ? `Filter=${Filter}&` : ""}Count=${Count}&PageNumber=${PageNumber}`, {
            headers: {
                'Authorization': User.token
            }
        })
            .then(function (response) {
                if (response.status === 200) {
                    setMessagesList(response.data.data)
                    dispatch(SetNonRead(`${new Date().getSeconds() + " " + new Date().getDay() + " " + new Date().getMinutes()}`))


                }
                SetLoad(false);

            })
            .catch(function (error) {
                // handle error
                SetLoad(false)
                if (error.request.status) {
                    HandleLogOut(dispatch);
                }

            })
    }, [Filter, Count, PageNumber]);

    const Intervaldata = setInterval(() => {
        handleGetAll()
    }, Interval)

    useEffect(() => {
        handleGetAll();
        return () => {
            clearInterval(Intervaldata);
        }
    }, [])


    function HandleDelete(id: string) {
        Swal.fire({
            title: strings.AreyousuredeletingtheItem,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            cancelButtonText: strings.cancel,
            confirmButtonText: strings.Yesdeleteit,

        }).then((result: any) => {
            if (result.isConfirmed) {
                return new Promise(function (resolve, reject) {

                    axios.delete(`${url}/connect-us?${id ? `id=${id}&` : ""}`, {
                        headers: {
                            'Authorization': User.token
                        }
                    })
                        .then(function (response) {
                            if (response.status === 200) {
                                dispatch(SetNonRead(id))

                                toast.success(strings.getLanguage() === Languages.AR ? response.data.messageAr : response.data.messageEn, {
                                    position: strings.getLanguage() === Languages.AR ? "bottom-left" : "bottom-right",
                                    autoClose: 1500,
                                    rtl: strings.getLanguage() === Languages.AR ? true : false,
                                    hideProgressBar: true,
                                    closeOnClick: true,
                                    pauseOnHover: true,
                                    draggable: true,
                                    progress: undefined,
                                    theme: "colored",
                                });


                                handleGetAll()
                                resolve(true);



                            }


                        })
                        .catch(function (error) {
                            // handle error

                            if (error.request.status) {
                                HandleLogOut(dispatch);
                            }

                        })









                });
            }
        }).catch(err => {

        })



    }
    function HandleView(id: string, index: number) {
        SetMessageIndex(index);
        SetRead(true);
        axios.post(`${url}/connect-us/editread/${id}`, {}, {
            headers: {
                'Authorization': User.token
            }
        })
            .then(function (response) {
                if (response.status === 200) {
                    dispatch(SetNonRead(id))
                    handleGetAll();
                }
            })
            .catch(function (error) {
                // handle error
                console.log(error)
                if (error.request.status) {
                    HandleLogOut(dispatch);
                }

            })
    }
    return (
        <>
            <ToastContainer />

            <HeadTag title={strings.Dashboard} description="All in one chip" keywords={"One card, NFC, nfc, chip"} />

            <section id="sidenavBody" className={`g-sidenav-show  bg-gray-100 mxh-100-ovh ${strings.getLanguage() === Languages.AR ? " rtl" : ""} `}>
                <Sidebar toggleSidenav={toggleSidenav} CurrentPage={3} />
                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <Navbar CurrentPage={3} toggleSidenav={toggleSidenav} />

                    <div className={classes.H100center + " animate__animated animate__fadeInUp"}>
                        <div className={"container-fluid py-4  "}>
                            <div className='row'>

                                <div className="col-12">
                                    <div className={Load ? "card m-0 min-h-40vh" : "card m-0"}>
                                        {Load ? (
                                            <Loading Card />
                                        ) :
                                            MessagesList && MessagesList.length > 0 || Filter ? (
                                                <>
                                                    <div className="card-header d-flex align-items-center justify-content-between pb-0">
                                                        <h6>{strings.Subscribers}</h6>
                                                        <div className=" d-flex align-items-center">
                                                            <div className="input-group">
                                                                <span className="input-group-text text-body">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 461.516 461.516"  ><g><path d="M185.746 371.332a185.294 185.294 0 0 0 113.866-39.11L422.39 455c9.172 8.858 23.787 8.604 32.645-.568 8.641-8.947 8.641-23.131 0-32.077L332.257 299.577c62.899-80.968 48.252-197.595-32.716-260.494S101.947-9.169 39.048 71.799-9.204 269.394 71.764 332.293a185.64 185.64 0 0 0 113.982 39.039zM87.095 87.059c54.484-54.485 142.82-54.486 197.305-.002s54.486 142.82.002 197.305-142.82 54.486-197.305.002l-.002-.002c-54.484-54.087-54.805-142.101-.718-196.585l.718-.718z" fill="#000000" opacity="1" data-original="#000000" ></path></g></svg>
                                                                </span>
                                                                <input type="text" className="form-control inputSearch" placeholder={strings.search} onChange={e => setFilter(e.target.value)} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="card-body px-0 pt-0 pb-2">
                                                        {MessagesList && MessagesList.length > 0 ? (
                                                            <>
                                                                <div className="table-responsive p-0"  >
                                                                    <table className=" table align-items-center mb-0">
                                                                        <thead>
                                                                            <tr>
                                                                                <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.Message}</th>

                                                                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.Email}</th>

                                                                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.phoneNumber}</th>


                                                                                <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.Time}</th>
                                                                                <th className="text-center  opacity-7"></th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            {MessagesList.map((ele, index) => {
                                                                                return (
                                                                                    <tr key={ele.id} className={ele.isRead ? " " : classes.bggray}>
                                                                                        <td className='align-middle text-center text-sm'>
                                                                                            <h6 className={"mb-0 text-sm " + classes.OVDots}>{ele.message}</h6>

                                                                                        </td>


                                                                                        <td className='align-middle text-center text-sm'>
                                                                                            <h6 className="mb-0 text-sm">{ele.email}</h6>

                                                                                        </td>
                                                                                        <td className='align-middle text-center text-sm'>
                                                                                            <h6 className="mb-0 text-sm">{ele.phoneNumber}</h6>

                                                                                        </td>
                                                                                        <td className='align-middle text-center text-sm'>
                                                                                            <h6 className="mb-0 text-sm">
                                                                                                <Moment fromNow date={ele.creationTime} locale={strings.getLanguage() === Languages.AR ? 'ar' : "en"} />
                                                                                            </h6>

                                                                                        </td>
                                                                                        <td className='text-center'>
                                                                                            <div className="dropdown  pe-4">
                                                                                                <a className="cursor-pointer" id="dropdownTable" data-bs-toggle="dropdown" aria-expanded="false">
                                                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 64 64"    ><g><g fill="#9b9b9b"><path d="M32 12c2.45 0 4.5 2.04 4.5 4.5 0 2.45-2.05 4.5-4.5 4.5s-4.5-2.05-4.5-4.5c0-2.46 2.05-4.5 4.5-4.5zM32 27.5c2.45 0 4.5 2.04 4.5 4.5 0 2.45-2.05 4.5-4.5 4.5s-4.5-2.05-4.5-4.5c0-2.46 2.05-4.5 4.5-4.5zM32 43c2.45 0 4.5 2.04 4.5 4.5 0 2.45-2.05 4.5-4.5 4.5s-4.5-2.05-4.5-4.5c0-2.46 2.05-4.5 4.5-4.5z" fill="#9b9b9b" opacity="1" data-original="#9b9b9b" ></path></g></g></svg>
                                                                                                </a>
                                                                                                <ul className="dropdown-menu px-2 py-3 ms-sm-n4 ms-n5" aria-labelledby="dropdownTable">
                                                                                                    <li><button className="dropdown-item border-radius-md" onClick={() => HandleView(ele.id, index)}>{strings.View}</button></li>
                                                                                                    <li><button className="dropdown-item border-radius-md" onClick={() => HandleDelete(ele.id)}>{strings.Delete}</button></li>



                                                                                                </ul>
                                                                                            </div>

                                                                                        </td>
                                                                                    </tr>
                                                                                )
                                                                            })}




                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </>) : (

                                                            <NoItems />)}
                                                    </div>
                                                </>
                                            ) : (
                                                <NoItems />
                                            )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Modal show={write} centered  >
                            <div className='modalNfc'>
                                {done ? (
                                    <img src="/done.gif" alt="" />
                                ) : (<img src="/nfc.gif" alt="" />)}


                            </div>
                        </Modal>


                    </div>
                </main>
            </section>
            <Modal show={Read} centered  >
                <div className='d-flex flex-column'>
                    <div className='d-flex w-100 justify-content-end p-3'>
                        <span style={{ cursor: 'pointer' }} onClick={() => SetRead(false)}>
                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
                        </span>
                    </div>

                    {MessageIndex >= 0 ? (

                        <div className={classes.messageCard}>
                            <div className='d-flex align-items-center mb-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24"  ><g><path d="M20 19.75H4A2.76 2.76 0 0 1 1.25 17V7A2.76 2.76 0 0 1 4 4.25h16A2.76 2.76 0 0 1 22.75 7v10A2.76 2.76 0 0 1 20 19.75Zm-16-14A1.25 1.25 0 0 0 2.75 7v10A1.25 1.25 0 0 0 4 18.25h16A1.25 1.25 0 0 0 21.25 17V7A1.25 1.25 0 0 0 20 5.75Z" fill="#344767" opacity="1" data-original="#000000" ></path><path d="M12 13.35a3.25 3.25 0 0 1-1.65-.45L1.62 7.71a.76.76 0 0 1-.27-1 .74.74 0 0 1 1-.26l8.74 5.18a1.69 1.69 0 0 0 1.76 0l8.74-5.18a.74.74 0 0 1 1 .26.76.76 0 0 1-.27 1l-8.67 5.19a3.25 3.25 0 0 1-1.65.45Z" fill="#000000" opacity="1" data-original="#344767" ></path></g></svg>
                                <p className='mx-2 p-0 m-0'>{strings.Message}</p>
                            </div>
                            <div className={classes.message}>

                                <h6> {MessagesList[MessageIndex].message}    </h6>
                            </div>

                            <div className='d-flex align-items-center my-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 32 32"  ><g><path d="M30.853 13.87a15 15 0 0 0-29.729 4.082A15.1 15.1 0 0 0 14 30.87a15.6 15.6 0 0 0 2.016.13 14.85 14.85 0 0 0 7.715-2.145 1 1 0 1 0-1.031-1.711 13.007 13.007 0 1 1 5.458-6.529A2.149 2.149 0 0 1 24 19.856V9a1 1 0 0 0-2 0v1.726a8 8 0 1 0 .2 10.325 4.135 4.135 0 0 0 7.83.274 15.2 15.2 0 0 0 .823-7.455zM16 22a6 6 0 1 1 6-6 6.006 6.006 0 0 1-6 6z" data-name="Layer 3" fill="#344767" opacity="1" data-original="#000000" ></path></g></svg>
                                <p className='mx-2 p-0 m-0'>{strings.Email}</p>
                            </div>
                            <div className={classes.message}>

                                <h6> {MessagesList[MessageIndex].email}    </h6>
                            </div>


                            <div className='d-flex align-items-center my-1'>
                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 482.6 482.6"   ><g><path d="M98.339 320.8c47.6 56.9 104.9 101.7 170.3 133.4 24.9 11.8 58.2 25.8 95.3 28.2 2.3.1 4.5.2 6.8.2 24.9 0 44.9-8.6 61.2-26.3.1-.1.3-.3.4-.5 5.8-7 12.4-13.3 19.3-20 4.7-4.5 9.5-9.2 14.1-14 21.3-22.2 21.3-50.4-.2-71.9l-60.1-60.1c-10.2-10.6-22.4-16.2-35.2-16.2-12.8 0-25.1 5.6-35.6 16.1l-35.8 35.8c-3.3-1.9-6.7-3.6-9.9-5.2-4-2-7.7-3.9-11-6-32.6-20.7-62.2-47.7-90.5-82.4-14.3-18.1-23.9-33.3-30.6-48.8 9.4-8.5 18.2-17.4 26.7-26.1 3-3.1 6.1-6.2 9.2-9.3 10.8-10.8 16.6-23.3 16.6-36s-5.7-25.2-16.6-36l-29.8-29.8c-3.5-3.5-6.8-6.9-10.2-10.4-6.6-6.8-13.5-13.8-20.3-20.1-10.3-10.1-22.4-15.4-35.2-15.4-12.7 0-24.9 5.3-35.6 15.5l-37.4 37.4c-13.6 13.6-21.3 30.1-22.9 49.2-1.9 23.9 2.5 49.3 13.9 80 17.5 47.5 43.9 91.6 83.1 138.7zm-72.6-216.6c1.2-13.3 6.3-24.4 15.9-34l37.2-37.2c5.8-5.6 12.2-8.5 18.4-8.5 6.1 0 12.3 2.9 18 8.7 6.7 6.2 13 12.7 19.8 19.6 3.4 3.5 6.9 7 10.4 10.6l29.8 29.8c6.2 6.2 9.4 12.5 9.4 18.7s-3.2 12.5-9.4 18.7c-3.1 3.1-6.2 6.3-9.3 9.4-9.3 9.4-18 18.3-27.6 26.8l-.5.5c-8.3 8.3-7 16.2-5 22.2.1.3.2.5.3.8 7.7 18.5 18.4 36.1 35.1 57.1 30 37 61.6 65.7 96.4 87.8 4.3 2.8 8.9 5 13.2 7.2 4 2 7.7 3.9 11 6 .4.2.7.4 1.1.6 3.3 1.7 6.5 2.5 9.7 2.5 8 0 13.2-5.1 14.9-6.8l37.4-37.4c5.8-5.8 12.1-8.9 18.3-8.9 7.6 0 13.8 4.7 17.7 8.9l60.3 60.2c12 12 11.9 25-.3 37.7-4.2 4.5-8.6 8.8-13.3 13.3-7 6.8-14.3 13.8-20.9 21.7-11.5 12.4-25.2 18.2-42.9 18.2-1.7 0-3.5-.1-5.2-.2-32.8-2.1-63.3-14.9-86.2-25.8-62.2-30.1-116.8-72.8-162.1-127-37.3-44.9-62.4-86.7-79-131.5-10.3-27.5-14.2-49.6-12.6-69.7z" fill="#344767" opacity="1" data-original="#000000" ></path></g></svg>
                                <p className='mx-2 p-0 m-0'>{strings.phoneNumber}</p>
                            </div>
                            <div className={classes.message}>

                                <h6> {MessagesList[MessageIndex].phoneNumber}    </h6>
                            </div>

                        </div>
                    ) : ""}
                </div>
            </Modal>


        </>

    )
}
