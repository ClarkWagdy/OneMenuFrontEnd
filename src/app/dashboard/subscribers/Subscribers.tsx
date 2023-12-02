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

export default function Subscribers() {
    const { Canvas } = useQRCode()
    const [ResturantList, setResturantList] = useState<ResturantT[]>([]);
    const User = useAppSelector((state) => state.User);
    const [Name, setName] = useState<string>("");
    const [Load, SetLoad] = useState<boolean>(true);
    const [Count, setCount] = useState<number>(25);

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
    return (
        <div className={classes.H100center + " animate__animated animate__fadeInUp"}>
            <div className={"container-fluid py-4  "}>
                <div className='row'>

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
                                                <input type="text" className="form-control inputSearch" placeholder={strings.search} />
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
                                                                        text={`${window.location.href}/menu/${ele.id}`}
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
                                                                <td>

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


                                                    <tr>
                                                        <td>
                                                            <div className="d-flex px-2 py-1">
                                                                <div>
                                                                    <img src="../assets/img/team-3.jpg" className="avatar avatar-sm me-3" alt="user2" />
                                                                </div>
                                                                <div className="d-flex flex-column justify-content-center">
                                                                    <h6 className="mb-0 text-sm">Alexa Liras</h6>
                                                                    <p className="text-xs text-secondary mb-0">alexa@creative-tim.com</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="align-middle text-center text-sm">
                                                            <span className="badge badge-sm bg-gradient-secondary">Offline</span>
                                                        </td>
                                                        <td className="align-middle text-center">
                                                            <span className="text-secondary text-xs font-weight-bold">11/01/19</span>
                                                        </td>
                                                        <td className="align-middle">
                                                            <a href="/" className="text-secondary font-weight-bold text-xs" data-toggle="tooltip" data-original-title="Edit user">
                                                                Edit
                                                            </a>
                                                        </td>
                                                    </tr>

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
        </div>
    )
}
