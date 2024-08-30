'use client'
import { RestaurantLogoPath, url } from '@/config/Api/url';
import { HandleLogOut } from '@/config/HandleLogOut/HandleLogOut';
import { strings } from '@/config/localization/LocalizedStrings'
import { useAppSelector } from '@/config/Store/hooks';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import classes from '../Dashboard.module.scss'
import { ResturantT } from '../Type';
import Switch from "react-switch";
import NoItems from '@/Component/NoItems/NoItems';
import Loading from '@/Component/Loading/Loading';
import { useQRCode } from 'next-qrcode';
import { saveAs } from "file-saver";
import { onWrite } from "@/config/NFC/NFCFunction"
import Modal from 'react-bootstrap/Modal';
import HeadTag from '@/Component/Head/HeadTag';
import Sidebar from '../Sidebar';
import { toggleSidenav } from '@/config/toggleSide/toggleSidenav';
import { Languages } from '@/config/localization/Languages';
import Navbar from '../Navbar';
import ClientModal from './ClientModal/ClientModal';

export default function Subscribers() {
    const { Canvas } = useQRCode()
    const [ResturantList, setResturantList] = useState<ResturantT[]>([]);
    const User = useAppSelector((state) => state.User);
    const [Name, setName] = useState<string>("");
    const [Load, SetLoad] = useState<boolean>(true);
    const [Count, setCount] = useState<number>(25);
    const [write, Setwrite] = useState<boolean>(false);
    const [done, Setdone] = useState<boolean>(false);

    const [AddClientModal, SetAddClientModal] = useState<boolean>(false);

    const [PageNumber, setPageNumber] = useState<number>(1);

    function HandleChange(e: any) {
        console.log(e)
    }

    function HandleDownload(name: string, id: string) {
        const canva = document.getElementsByTagName("canvas")[0];
        canva.toBlob((blob: any) => {
            saveAs(blob, `${name}.png`);
        });
    }
    useEffect(() => {
        axios.get(`${url}/restaurant?${Name ? `Name=${Name}&` : ""}Count=${Count}&PageNumber=${PageNumber}`, {
            headers: {
                'Authorization': User.token
            }
        })
            .then(function (response) {
                if (response.status === 200) {
                    setResturantList(response.data.data)



                }
                SetLoad(false);

            })
            .catch(function (error) {
                // handle error
                SetLoad(false)
                if (error.request.status) {
                    HandleLogOut();
                }

            })
    }, [])

    // const onWrite = () => {
    //     try {
    //         if ('NDEFReader' in window) {
    //             const ndef = new window.NDEFReader();
    //             await ndef.write({
    //                 records: [{ recordType: "text", data: "Hellow World!" }],
    //             });
    //             console.log(`Value Saved!`);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //     }
    // };

    async function Handlewrite(url: string) {
        Setwrite(true)
        let data = await onWrite(url)
        if (data) {
            Setdone(true);
            setTimeout(() => {
                Setwrite(false)
            }, 1000);
        }
    }
    return (
        <>
            <HeadTag title={strings.Dashboard} description="All in one chip" keywords={"One card, NFC, nfc, chip"} />

            <section id="sidenavBody" className={`g-sidenav-show  bg-gray-100 mxh-100-ovh ${strings.getLanguage() === Languages.AR ? " rtl" : ""} `}>
                <Sidebar toggleSidenav={toggleSidenav} CurrentPage={2} />
                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <Navbar CurrentPage={2} toggleSidenav={toggleSidenav} />


                    <div className={classes.H100center + " animate__animated animate__fadeInUp"}>
                        <div className={"container-fluid py-4  "}>
                            <div className='row'>
                                <div className='col-12 mb-3'>
                                    <div className={"card  flex-row justify-content-between px-3 py-2"}>
                                        <div>
                                            <h6 className='p-0 m-0'>{strings.Subscribers}</h6>
                                            <p className="text-sm p-0 m-0 ">{strings.Allsubscribedcustomers}</p>
                                        </div>

                                        <button className='btn bg-gradient-dark mb-0' onClick={() => SetAddClientModal(true)}>

                                            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#fff" opacity="1" data-original="#000000" ></path></g></svg>
                                            &nbsp;&nbsp;&nbsp;
                                            {strings.AddNewClient}
                                        </button>
                                    </div>
                                </div>

                                <div className="col-12">
                                    <div className={Load ? "card m-0 min-h-40vh" : "card m-0"}>
                                        {Load ? (
                                            <Loading Card />
                                        ) : ResturantList && ResturantList.length > 0 ? (
                                            <>
                                                <div className="card-header d-flex align-items-center justify-content-between pb-0">
                                                    <h6>{strings.Subscribers}</h6>
                                                    <div className=" d-flex align-items-center">
                                                        <div className="input-group">
                                                            <span className="input-group-text text-body">
                                                                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 461.516 461.516"  ><g><path d="M185.746 371.332a185.294 185.294 0 0 0 113.866-39.11L422.39 455c9.172 8.858 23.787 8.604 32.645-.568 8.641-8.947 8.641-23.131 0-32.077L332.257 299.577c62.899-80.968 48.252-197.595-32.716-260.494S101.947-9.169 39.048 71.799-9.204 269.394 71.764 332.293a185.64 185.64 0 0 0 113.982 39.039zM87.095 87.059c54.484-54.485 142.82-54.486 197.305-.002s54.486 142.82.002 197.305-142.82 54.486-197.305.002l-.002-.002c-54.484-54.087-54.805-142.101-.718-196.585l.718-.718z" fill="#000000" opacity="1" data-original="#000000" ></path></g></svg>
                                                            </span>
                                                            <input type="text" className="form-control inputSearch" placeholder={strings.search} onChange={e => setName(e.target.value)} />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="card-body px-0 pt-0 pb-2">

                                                    <div className="table-responsive p-0">
                                                        <table className="table align-items-center mb-0">
                                                            <thead>
                                                                <tr>
                                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.PlaceName}</th>

                                                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.Status}</th>
                                                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">QR</th>
                                                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Write NfC</th>


                                                                    <th className="text-center text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">{strings.subscriptiontime}</th>
                                                                    <th className="text-secondary opacity-7"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {ResturantList.map(ele => {
                                                                    return (
                                                                        <tr key={ele.id}>
                                                                            <td>
                                                                                <div className="d-flex px-2 py-1">
                                                                                    <div>
                                                                                        <img src={`${RestaurantLogoPath}/${ele.logo}`} className="avatar avatar-sm me-3" alt="user1" />
                                                                                    </div>
                                                                                    <div className="d-flex flex-column justify-content-center">
                                                                                        <h6 className="mb-0 text-sm">{ele.name}</h6>
                                                                                        <p className="text-xs text-secondary mb-0">{ele.ownerEmail}</p>
                                                                                    </div>
                                                                                </div>
                                                                            </td>

                                                                            <td className="align-middle text-center text-sm">
                                                                                <Switch onChange={(e) => {
                                                                                    HandleChange(e)
                                                                                }} checked={ele.isActive ? true : false}
                                                                                    onColor="#68B984"
                                                                                    onHandleColor="#68B984"
                                                                                    handleDiameter={30}
                                                                                    uncheckedIcon={false}
                                                                                    checkedIcon={false}
                                                                                    boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                                                                                    activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                                                                                    height={20}
                                                                                    width={48}

                                                                                />
                                                                            </td>
                                                                            <td id={ele.id} className='  qr d-flex align-items-center justify-content-center'>
                                                                                <Canvas
                                                                                    text={`${window.location.host}/menu/${ele.id}`}
                                                                                    options={{
                                                                                        type: 'image/jpeg',

                                                                                        quality: 0.1,
                                                                                        errorCorrectionLevel: 'H',
                                                                                        margin: 3,
                                                                                        scale: 1,
                                                                                        width: 50,
                                                                                        color: {
                                                                                            dark: '#3f3f3f',
                                                                                            light: '#fff',
                                                                                        },
                                                                                    }}
                                                                                />
                                                                                <button className={'btn p-0 m-0 mx-2 p-1'} onClick={() => HandleDownload(ele.name, ele.id)}>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 515.283 515.283"    ><g><path d="M400.775 515.283H114.507c-30.584 0-59.339-11.911-80.968-33.54C11.911 460.117 0 431.361 0 400.775v-28.628c0-15.811 12.816-28.628 28.627-28.628s28.627 12.817 28.627 28.628v28.628c0 15.293 5.956 29.67 16.768 40.483 10.815 10.814 25.192 16.771 40.485 16.771h286.268c15.292 0 29.669-5.957 40.483-16.771 10.814-10.815 16.771-25.192 16.771-40.483v-28.628c0-15.811 12.816-28.628 28.626-28.628s28.628 12.817 28.628 28.628v28.628c0 30.584-11.911 59.338-33.54 80.968-21.629 21.629-50.384 33.54-80.968 33.54zM257.641 400.774a28.538 28.538 0 0 1-19.998-8.142l-.002-.002-.057-.056-.016-.016c-.016-.014-.03-.029-.045-.044l-.029-.029a.892.892 0 0 0-.032-.031l-.062-.062-114.508-114.509c-11.179-11.179-11.179-29.305 0-40.485 11.179-11.179 29.306-11.18 40.485 0l65.638 65.638V28.627C229.014 12.816 241.83 0 257.641 0s28.628 12.816 28.628 28.627v274.408l65.637-65.637c11.178-11.179 29.307-11.179 40.485 0 11.179 11.179 11.179 29.306 0 40.485L277.883 392.39l-.062.062-.032.031-.029.029c-.014.016-.03.03-.044.044l-.017.016a1.479 1.479 0 0 1-.056.056l-.002.002c-.315.307-.634.605-.96.895a28.441 28.441 0 0 1-7.89 4.995l-.028.012c-.011.004-.02.01-.031.013a28.5 28.5 0 0 1-11.091 2.229z" fill="#3f3f3f" opacity="1" data-original="#3f3f3f" ></path></g></svg>
                                                                                </button>
                                                                            </td>
                                                                            <td className='text-center'>
                                                                                <button className='btn p-0 m-0 p-2' onClick={() => Handlewrite(`${window.location.host}/menu/${ele.id}`)}>
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 512 512" ><g><path d="M504.5 316.61H310.55M504.5 346.91H310.55M390.02 124.68h-79.47M355.02 387.32h-44.47M425.02 124.68h59.28c11.16 0 20.2 9.04 20.2 20.2v222.24c0 11.16-9.04 20.2-20.2 20.2h-94.28M383.28 175.187h20.204M433.789 165.085l-20.204 60.61M464.094 215.593H443.89M7.5 142.18v321.91c0 22.32 18.09 40.41 40.41 40.41h222.23c22.32 0 40.41-18.09 40.41-40.41V47.91c0-22.32-18.09-40.41-40.41-40.41H47.91C25.59 7.5 7.5 25.59 7.5 47.91v59.27M138.821 37.805h40.407" fill="none" stroke="#000000" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" data-original="#000000" ></path><path d="M103.465 147.022c61.271 0 111.118 49.847 111.118 111.118" fill="none" stroke="#000000" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" data-original="#000000" ></path><path d="M103.465 177.327c44.561 0 80.813 36.252 80.813 80.813M103.465 207.631c27.851 0 50.508 22.658 50.508 50.508M103.465 237.936c11.158 0 20.203 9.045 20.203 20.203M73.533 364.978v-60.496l42.472 60.496v-60.609M170.875 304.369H146.31v60.609M146.31 334.099h22.614M242.368 309.544a30.161 30.161 0 0 0-16.944-5.176c-16.737 0-30.305 13.568-30.305 30.305 0 16.737 13.568 30.305 30.305 30.305 6.797 0 12.389-2.238 16.632-6.017a24.386 24.386 0 0 0 2.46-2.538" fill="none" stroke="#000000" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round" strokeMiterlimit="10" data-original="#000000" ></path></g></svg>                                                                    </button>
                                                                            </td>
                                                                            <td className="align-middle text-center">
                                                                                <span className="text-secondary text-xs font-weight-bold">{new Date(ele.creationTime).toISOString().slice(0, 10)}</span>
                                                                            </td>
                                                                            <td className="align-middle">
                                                                                <a href="/" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                                                                    Edit
                                                                                </a>
                                                                            </td>
                                                                        </tr>
                                                                    )
                                                                })}




                                                            </tbody>
                                                        </table>
                                                    </div>
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


                            <div className='modalNfc flex-column'>
                                <div className='d-flex w-100 justify-content-end p-3'>
                                    <span style={{ cursor: 'pointer' }} onClick={() => Setwrite(false)}>
                                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
                                    </span>
                                </div>


                                {done ? (
                                    <img src="/done.gif" alt="" />
                                ) : (<img src="/nfc.gif" alt="" />)}


                            </div>
                        </Modal>

                        <ClientModal show={AddClientModal} SetAddClientModal={SetAddClientModal} />


                    </div>
                </main>
            </section >
        </>
    )
}
