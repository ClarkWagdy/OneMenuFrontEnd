'use client'
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { useAppSelector } from '@/config/Store/hooks';
import React, { FC, useState } from 'react'
import { Modal } from 'react-bootstrap'
import classes from '../Menu.module.scss';
import axios from 'axios';
import Switch from "react-switch";

import { OffersImagePath, url, VideoPath } from '@/config/Api/url';
import { useRouter } from 'next/navigation';
interface Props {
  SettingModal: boolean
  setSettingModal: Function

}
const SettingsModal: FC<Props> = (props: Props) => {
  const _Lan = useAppSelector((state) => state.Lan);
  const Restaurant = useAppSelector((state) => state.Restaurant)
  const User = useAppSelector((state) => state.User)
  const router = useRouter();

  const [Load, setLoad] = useState<boolean>(false);
  const [ChangeLan, setChangeLan] = useState<boolean>(Restaurant.changeLanguageStatus ? Restaurant.changeLanguageStatus : false);

  const [Offers, setOffers] = useState<boolean>(Restaurant.offerStatus ? Restaurant.offerStatus : false);
  const [Video, setVideo] = useState<boolean>(Restaurant.videoStatus ? Restaurant.videoStatus : false);
  const [defaultLanguage, setdefaultLanguage] = useState<number>(Restaurant.defaultLanguage ? Restaurant.defaultLanguage : 1);

  const [Images, setImages] = useState<any>(Restaurant.offers && Restaurant.offers.length > 0 ? Restaurant.offers : []);
  const [Videofile, setVideofile] = useState<any>();

  const [VideoUrl, setVideoUrl] = useState<any>(Restaurant.video ? Restaurant.video : "");




  function onChangeImage(event: any) {
    if (event.target.files && event.target.files[0]) {
      setImages([...Images, ...event.target.files]);

    }


  }
  function HandleDelete(image: any, index: number) {
    var _Images = [...Images];
    _Images.splice(index, 1);
    setImages(_Images)

  }
  function onChangevideo(event: any) {
    if (event.target.files && event.target.files[0]) {
      setVideofile(event.target.files[0]);
      setVideoUrl(URL.createObjectURL(event.target.files[0]))
    }

  }
  function HandleSave() {
    setLoad(true)
    var formData: any = new FormData();

    formData.append("restaurantId", Restaurant.id);
    formData.append("changeLanguageStatus", ChangeLan);
    formData.append("defaultLanguage", defaultLanguage);
    formData.append("offerStatus", Offers);


    for (const image of Images) {
      console.log(image)
      formData.append("offers", image);
    }

    formData.append("videoStatus", Video);
    formData.append("video", Videofile);
    formData.append("isActive", true);

    axios.post(`${url}/restaurant/edit`, formData, {
      headers: {
        'Authorization': User.token
      }
    }).then(res => {
      setLoad(false)
      console.log(res)
      if (res.data.statusCode === 202) {
        window.location.reload();
      }
      //props.setSettingModal(false)
    }).catch(err => {
      console.log(err)
      // props.setSettingModal(false)
    })


  }
  return (
    <Modal
      show={props.SettingModal}
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
          <h4> {strings.Settings}</h4>
          <button className={classes.btn + " " + classes.btnClose} onClick={() => props.setSettingModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
          </button>
        </div>

        <div className='mb-4'>
          <div className='d-flex align-items-center'>
            <svg style={{ opacity: '0.5' }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 512 512"><g><path d="M256 0C114.848 0 0 114.848 0 256s114.848 256 256 256 256-114.848 256-256S397.152 0 256 0zm181.248 124.896c-27.584 10.944-55.936 19.616-85.024 25.312A361.934 361.934 0 0 0 293.312 35.36c59.008 9.984 110.144 42.976 143.936 89.536zm-108.8 200.864a533.523 533.523 0 0 0-144.928 0 332.338 332.338 0 0 1-.064-139.296c23.872 3.264 48 5.536 72.544 5.536s48.64-2.272 72.512-5.536a332.338 332.338 0 0 1-.064 139.296zm-8.288-170.592a500.92 500.92 0 0 1-128.352 0c13.12-41.152 34.56-80.16 64.192-114.72 29.632 34.56 51.04 73.568 64.16 114.72zM218.624 35.36c-26.944 35.232-46.528 74.176-58.88 114.848-29.056-5.696-57.408-14.368-84.992-25.312 33.76-46.56 84.896-79.552 143.872-89.536zM32 256c0-37.312 9.312-72.448 25.504-103.424 30.592 12.576 61.984 22.464 94.272 28.96a364.405 364.405 0 0 0 .032 149.184c-32.256 6.432-63.776 16.256-94.304 28.8C41.312 328.48 32 293.344 32 256zm42.752 131.104c27.584-10.944 55.936-19.616 84.992-25.312a361.934 361.934 0 0 0 58.912 114.848c-59.008-9.984-110.144-42.976-143.904-89.536zm117.088-30.272a500.672 500.672 0 0 1 128.32 0c-13.12 41.152-34.56 80.16-64.16 114.72-29.632-34.56-51.04-73.568-64.16-114.72zM293.312 476.64a361.934 361.934 0 0 0 58.912-114.848c29.056 5.696 57.44 14.4 85.024 25.312-33.792 46.56-84.928 79.552-143.936 89.536zm66.848-145.984c10.304-49.184 10.336-99.968.032-149.152 32.288-6.496 63.712-16.352 94.304-28.96C470.688 183.552 480 218.688 480 256c0 37.344-9.312 72.48-25.504 103.456-30.528-12.512-62.048-22.336-94.336-28.8z" fill="#000000" data-original="#000000"></path></g></svg>

            <h5 className='p-0 m-0 mx-2 fw-bold'>
              {strings.LanguageSettings}</h5>
          </div>

          <div className='w-100 d-flex justify-content-between align-items-center px-3 mt-2'>
            <label htmlFor="allowChangeLan" className='fw-bold color-gray'>{strings.Allowuserstochangethelanguage}</label>
            <Switch onChange={(e) => {
              setChangeLan(e)
            }} checked={ChangeLan}

              onColor="#68B984"
              onHandleColor="#68B984"
              handleDiameter={30}
              uncheckedIcon={false}
              checkedIcon={false}
              boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
              activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
              height={20}
              width={48}
              id="allowChangeLan"
            />
          </div>

          <div className='w-100 d-flex justify-content-between align-items-center px-3 mt-2'>
            <label className='fw-bold color-gray'  >{strings.defaultlanguage}</label>
            <select onChange={(e) => setdefaultLanguage(+e.target.value)} className={classes.Languagesselect} name="Languages" value={defaultLanguage}>
              <option value={0}>{strings.Arabic}</option>
              <option value={1}>{strings.English}</option>
            </select>
          </div>
        </div>


        <div  >
          <div className='d-flex align-items-center'>
            <svg style={{ opacity: '0.5' }} xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" ><g><path d="M136.965 308.234c4.781-2.757 6.418-8.879 3.66-13.66-2.762-4.777-8.879-6.418-13.66-3.66-4.781 2.762-6.422 8.883-3.66 13.66 2.757 4.781 8.879 6.422 13.66 3.66zm0 0" fill="#000000" data-original="#000000" ></path><path d="m95.984 377.254 50.36 87.23c10.867 18.844 35.312 25.82 54.644 14.645 19.13-11.055 25.703-35.496 14.637-54.64l-30-51.97 25.98-15c4.782-2.765 6.422-8.878 3.66-13.66l-13.003-22.523c1.55-.3 11.746-2.3 191.539-37.57 22.226-1.207 35.543-25.516 24.316-44.95l-33.234-57.562 21.238-32.168a10.004 10.004 0 0 0 .317-10.512l-20-34.64a10.02 10.02 0 0 0-9.262-4.98l-38.473 2.308-36.894-63.907c-5.344-9.257-14.918-14.863-25.606-14.996-.129-.004-.254-.004-.383-.004-10.328 0-19.703 5.141-25.257 13.832L119.93 202.602l-84.926 49.03C1.602 270.91-9.97 313.763 9.383 347.255c17.68 30.625 54.953 42.672 86.601 30zm102.325 57.238c5.523 9.555 2.254 21.781-7.329 27.317-9.613 5.558-21.855 2.144-27.316-7.32l-50-86.614 34.64-20c57.868 100.242 49.075 85.012 50.005 86.617zm-22.684-79.297-10-17.32 17.32-10 10 17.32zm196.582-235.91 13.82 23.938-12.324 18.664-23.82-41.262zM267.289 47.152c2.684-4.39 6.941-4.843 8.668-4.797 1.707.02 5.961.551 8.527 4.997l116.313 201.464c3.789 6.559-.817 14.805-8.414 14.993-1.363.03-1.992.277-5.485.93L263.863 51.632c2.582-3.32 2.914-3.64 3.426-4.48zm-16.734 21.434 115.597 200.223-174.46 34.218-53.047-91.879zM26.703 337.254a49.933 49.933 0 0 1-6.71-24.95c0-17.835 9.585-34.445 25.01-43.35l77.942-45 50 86.6-77.941 45.005c-23.879 13.78-54.516 5.57-68.3-18.305zm0 0" fill="#000000" data-original="#000000"  ></path><path d="M105.984 314.574c-2.761-4.781-8.879-6.422-13.66-3.66l-17.32 10c-4.774 2.758-10.902 1.113-13.66-3.66-2.762-4.781-8.88-6.422-13.66-3.66s-6.422 8.879-3.66 13.66c8.23 14.258 26.59 19.285 40.98 10.98l17.32-10c4.781-2.761 6.422-8.875 3.66-13.66zM497.137 43.746l-55.723 31.008c-4.824 2.687-6.562 8.777-3.875 13.601 2.68 4.82 8.766 6.567 13.602 3.875l55.718-31.007c4.829-2.688 6.563-8.778 3.875-13.602-2.683-4.828-8.773-6.562-13.597-3.875zM491.293 147.316l-38.637-10.351c-5.336-1.43-10.82 1.734-12.25 7.07-1.43 5.336 1.739 10.817 7.074 12.246l38.641 10.352c5.367 1.441 10.824-1.774 12.246-7.07 1.43-5.336-1.738-10.82-7.074-12.247zM394.2 7.414l-10.364 38.64c-1.43 5.337 1.734 10.817 7.07 12.25 5.332 1.426 10.817-1.73 12.25-7.07l10.36-38.64c1.43-5.336-1.735-10.82-7.07-12.25-5.333-1.43-10.817 1.734-12.247 7.07zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>

            <h5 className='p-0 m-0 mx-2 fw-bold'>
              {strings.Advertisingmedia}
            </h5>
          </div>

          <div className='w-100 d-flex  flex-column px-3 mt-2'>
            <div className='d-flex align-items-center w-100 justify-content-between'>
              <div className='d-flex'>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 512.003 512.003" ><g><path d="M477.958 262.633a15.004 15.004 0 0 1 0-13.263l19.096-39.065c10.632-21.751 2.208-47.676-19.178-59.023l-38.41-20.38a15.005 15.005 0 0 1-7.796-10.729l-7.512-42.829c-4.183-23.846-26.241-39.87-50.208-36.479l-43.053 6.09a15.004 15.004 0 0 1-12.613-4.099l-31.251-30.232c-17.401-16.834-44.661-16.835-62.061 0L193.72 42.859a15.01 15.01 0 0 1-12.613 4.099l-43.053-6.09c-23.975-3.393-46.025 12.633-50.208 36.479l-7.512 42.827a15.008 15.008 0 0 1-7.795 10.73l-38.41 20.38c-21.386 11.346-29.81 37.273-19.178 59.024l19.095 39.064a15.004 15.004 0 0 1 0 13.263L14.95 301.699c-10.632 21.751-2.208 47.676 19.178 59.023l38.41 20.38a15.005 15.005 0 0 1 7.796 10.729l7.512 42.829c3.808 21.708 22.422 36.932 43.815 36.93 2.107 0 4.245-.148 6.394-.452l43.053-6.09a15 15 0 0 1 12.613 4.099l31.251 30.232c8.702 8.418 19.864 12.626 31.03 12.625 11.163-.001 22.332-4.209 31.03-12.625l31.252-30.232c3.372-3.261 7.968-4.751 12.613-4.099l43.053 6.09c23.978 3.392 46.025-12.633 50.208-36.479l7.513-42.827a15.008 15.008 0 0 1 7.795-10.73l38.41-20.38c21.386-11.346 29.81-37.273 19.178-59.024l-19.096-39.065zm-13.923 72.002-38.41 20.38c-12.246 6.499-20.645 18.057-23.04 31.713l-7.512 42.828a15.038 15.038 0 0 1-16.987 12.342l-43.053-6.09c-13.73-1.945-27.316 2.474-37.281 12.113L266.5 478.152a15.04 15.04 0 0 1-20.997 0l-31.251-30.232c-8.422-8.147-19.432-12.562-30.926-12.562-2.106 0-4.229.148-6.355.449l-43.053 6.09a15.042 15.042 0 0 1-16.987-12.342l-7.513-42.829c-2.396-13.656-10.794-25.215-23.041-31.712l-38.41-20.38a15.037 15.037 0 0 1-6.489-19.969L60.574 275.6c6.088-12.456 6.088-26.742 0-39.198l-19.096-39.065a15.037 15.037 0 0 1 6.489-19.969l38.41-20.38c12.246-6.499 20.645-18.057 23.04-31.713l7.512-42.828a15.038 15.038 0 0 1 16.987-12.342l43.053 6.09c13.725 1.943 27.316-2.474 37.281-12.113l31.252-30.232a15.04 15.04 0 0 1 20.997 0l31.251 30.232c9.965 9.64 23.554 14.056 37.281 12.113l43.053-6.09a15.04 15.04 0 0 1 16.987 12.342l7.512 42.829c2.396 13.656 10.794 25.215 23.041 31.712l38.41 20.38a15.037 15.037 0 0 1 6.489 19.969l-19.096 39.064c-6.088 12.455-6.088 26.743 0 39.198l19.096 39.064a15.039 15.039 0 0 1-6.488 19.972z" fill="#000000" data-original="#000000"  ></path><path d="M363.886 148.116c-5.765-5.766-15.115-5.766-20.881 0l-194.889 194.89c-5.766 5.766-5.766 15.115 0 20.881a14.72 14.72 0 0 0 10.44 4.325c3.778 0 7.558-1.441 10.44-4.325l194.889-194.889c5.768-5.767 5.768-15.115.001-20.882zM196.941 123.116c-29.852 0-54.139 24.287-54.139 54.139s24.287 54.139 54.139 54.139 54.139-24.287 54.139-54.139-24.287-54.139-54.139-54.139zm0 78.747c-13.569 0-24.608-11.039-24.608-24.609 0-13.569 11.039-24.608 24.608-24.608s24.609 11.039 24.609 24.608c-.001 13.57-11.04 24.609-24.609 24.609zM315.061 280.61c-29.852 0-54.139 24.287-54.139 54.139s24.287 54.139 54.139 54.139c29.852 0 54.139-24.287 54.139-54.139s-24.287-54.139-54.139-54.139zm0 78.747c-13.569 0-24.609-11.039-24.609-24.608s11.039-24.608 24.609-24.608c13.569 0 24.608 11.039 24.608 24.608s-11.039 24.608-24.608 24.608z" fill="#000000" data-original="#000000"></path></g></svg>

                <label htmlFor="allowOffers" className='p-0 m-0 mx-2 fw-bold'>
                  {strings.offers}
                </label>
              </div>
              <div>
                <Switch
                  onChange={(e) => {
                    setVideo(!e)
                    setOffers(e)
                  }}
                  checked={Offers}
                  onColor="#68B984"
                  onHandleColor="#68B984"
                  handleDiameter={30}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={48}
                  id="allowOffers"
                />

              </div>
            </div>
            <div className={classes.OffersImag + ` px-3 py-2 d-flex flex-wrap ${Images.length > 0 ? "justify-content-center" : ""} `}>


              {Images.length > 0 ? Images.map((image: any, i: number) => {
                return (
                  <div key={i + image.name} className={classes.offerImg + "   animate__animated animate__fadeIn "}>



                    <svg onClick={() => HandleDelete(image, i)} className={classes.ImageDelete} xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" x="0" y="0" viewBox="0 0 24 24"    ><g><g data-name="Flat Color"><path fill="#e63946" d="M15 4H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2zM15 22H9a4 4 0 0 1-4-4V6h14v12a4 4 0 0 1-4 4z" data-original="#e63946"  ></path><path fill="#c9273a" d="M20 8H4a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2z" data-original="#c9273a"></path><g fill="#edebea"><path d="M10 18a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1zM14 18a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1z" fill="#edebea" data-original="#edebea"></path></g></g></g></svg>
                    <img src={image.fileName ? `${OffersImagePath}/${image.fileName}` : URL.createObjectURL(image)} alt="" />
                  </div>
                )
              }) : ""}

              <label htmlFor="offerImage" className={classes.offerCard}>
                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 448 448"><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000"></path></g></svg>
              </label>



              <input id="offerImage" onChange={(e) => onChangeImage(e)} className={classes.OfferInput} type={"file"} multiple accept="image/*" />
            </div>
          </div>

          <div className='w-100 d-flex  flex-column px-3 mt-2'>
            <div className='d-flex align-items-center w-100 justify-content-between'>
              <div className='d-flex'>

                <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 512 512" ><g><path d="m338.95 243.28-120-75A15.002 15.002 0 0 0 195.999 181v150a15 15 0 0 0 22.95 12.72l120-75a15 15 0 0 0 .001-25.44zM226 303.936v-95.873L302.698 256z" fill="#000000" data-original="#000000"  ></path><path d="M437 61H75C33.645 61 0 94.645 0 136v240c0 41.355 33.645 75 75 75h362c41.355 0 75-33.645 75-75V136c0-41.355-33.645-75-75-75zm45 315c0 24.813-20.187 45-45 45H75c-24.813 0-45-20.187-45-45V136c0-24.813 20.187-45 45-45h362c24.813 0 45 20.187 45 45z" fill="#000000" data-original="#000000" ></path></g></svg>
                <label htmlFor="allowOffers" className='p-0 m-0 mx-2 fw-bold'>
                  {strings.Promotionalvideo}
                </label>
              </div>
              <div>
                <Switch
                  onChange={(e) => {
                    setOffers(!e)
                    setVideo(e)
                  }}
                  checked={Video}
                  onColor="#68B984"
                  onHandleColor="#68B984"
                  handleDiameter={30}
                  uncheckedIcon={false}
                  checkedIcon={false}
                  boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
                  activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
                  height={20}
                  width={48}
                  id="allowVideo"
                />


              </div>
            </div>
            <div className={classes.OffersImag + ` px-3 py-2 d-flex align-items-center ${Images.length > 0 ? "justify-content-center" : ""} `}>


              {VideoUrl ? (
                <div className={classes.offerImg + "   animate__animated animate__fadeIn "}>
                  {/* <svg onClick={()=>HandleDelete(image,i)} className={classes.ImageDelete} xmlns="http://www.w3.org/2000/svg" version="1.1" width="30" height="30" x="0" y="0" viewBox="0 0 24 24"    ><g><g data-name="Flat Color"><path fill="#e63946" d="M15 4H9a1 1 0 0 1 0-2h6a1 1 0 0 1 0 2zM15 22H9a4 4 0 0 1-4-4V6h14v12a4 4 0 0 1-4 4z" data-original="#e63946"  ></path><path fill="#c9273a" d="M20 8H4a1 1 0 0 1 0-2h16a1 1 0 0 1 0 2z" data-original="#c9273a"></path><g fill="#edebea"><path d="M10 18a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1zM14 18a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1z" fill="#edebea" data-original="#edebea"></path></g></g></g></svg> */}
                  {/* <img src={URL.createObjectURL(image)}   alt="" /> */}

                  <video controls src={VideoUrl.fileName ? `${VideoPath}/${VideoUrl.fileName}` : VideoUrl} >
                    <source src={VideoUrl.fileName ? `${VideoPath}/${VideoUrl.fileName}` : VideoUrl} />
                  </video>
                </div>
              ) : ""}

              <label htmlFor="Promotionalvideo" className={classes.offerCard}>
                {VideoUrl ? (
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 492.493 492"   ><g><path d="M304.14 82.473 33.165 353.469a10.799 10.799 0 0 0-2.816 4.949L.313 478.973a10.716 10.716 0 0 0 2.816 10.136 10.675 10.675 0 0 0 7.527 3.114 10.6 10.6 0 0 0 2.582-.32l120.555-30.04a10.655 10.655 0 0 0 4.95-2.812l271-270.977zM476.875 45.523 446.711 15.36c-20.16-20.16-55.297-20.14-75.434 0l-36.949 36.95 105.598 105.597 36.949-36.949c10.07-10.066 15.617-23.465 15.617-37.715s-5.547-27.648-15.617-37.719zm0 0" fill="#000000" data-original="#000000"  ></path></g></svg>

                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="25" height="25" x="0" y="0" viewBox="0 0 448 448"><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000"></path></g></svg>
                )}
              </label>



              <input id="Promotionalvideo" onChange={(e) => onChangevideo(e)} className={classes.OfferInput} type={"file"} accept="video/*" />
            </div>
          </div>
        </div>
        <div className={classes.dCenter + "   w-100"}>
          <button type='submit' className={classes.AddBtn + " " + classes.Save_Btn}
            onClick={() => HandleSave()}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 512 512" ><g><path d="m507.606 100.794-96.4-96.4A15 15 0 0 0 400.6 0H55.166C24.748 0 0 24.748 0 55.167v401.666C0 487.252 24.748 512 55.166 512h401.666c30.42 0 55.168-24.748 55.168-55.167V111.4a15 15 0 0 0-4.394-10.606zM353.467 30v121.566c0 13.877-11.29 25.167-25.167 25.167H151.566c-13.877 0-25.167-11.29-25.167-25.167V30zM126.399 482V328.3c0-13.876 11.29-25.166 25.167-25.166h208.866c13.877 0 25.167 11.29 25.167 25.166V482zM482 456.833C482 470.71 470.71 482 456.833 482H415.6V328.3c0-30.418-24.748-55.166-55.167-55.166H151.566c-30.419 0-55.167 24.748-55.167 55.166V482H55.166C41.29 482 30 470.71 30 456.833V55.167C30 41.29 41.29 30 55.166 30h41.233v121.566c0 30.419 24.748 55.167 55.167 55.167H328.3c30.419 0 55.167-24.748 55.167-55.167V30h10.919L482 117.614z" fill="#000000" data-original="#000000" ></path><path d="M304.2 142.467c8.284 0 15-6.716 15-15v-48.2c0-8.284-6.716-15-15-15s-15 6.716-15 15v48.2c0 8.284 6.716 15 15 15z" fill="#000000" data-original="#000000" ></path></g></svg>
            {strings.Save}
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
export default SettingsModal;