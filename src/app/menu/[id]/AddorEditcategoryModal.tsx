'use client'
import React, { useState, FC, useEffect, useCallback } from 'react'
import { Modal } from 'react-bootstrap'
import classes from '../Menu.module.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAppSelector } from '@/config/Store/hooks';
import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import translate from "translate";
import NoItems from '@/Component/NoItems/NoItems';
import { HTML5Backend } from 'react-dnd-html5-backend'
import { Container } from './Container';
import { categoryT } from './typs';
import { TouchBackend } from 'react-dnd-touch-backend'
import { DndProvider, TouchTransition, MouseTransition } from 'react-dnd-multi-backend'
import { CategoryDTO } from '@/config/Store/Restaurant/RestaurantType';

export const HTML5toTouch = {
  backends: [
    {
      id: 'html5',
      backend: HTML5Backend,
      transition: MouseTransition,
    },
    {
      id: 'touch',
      backend: TouchBackend,

      preview: true,
      transition: TouchTransition,
    },
  ],
}
interface Props {
  CreateOrEditModal?: boolean,
  setCreateOrEditModal: Function,
  category: CategoryDTO[],
  Addcategory: Function,
  Deletecategory: Function,
  Editcategory: Function,
}

const AddorEditcategoryModal: FC<Props> = (props) => {



  const _Lan = useAppSelector((state) => state.Lan);

  const [NewcategoryTextAR, setNewcategoryTextAR] = useState<string>();
  const [NewcategoryTextEN, setNewcategoryTextEN] = useState<string>();

  const [EditPointer, setEditPointer] = useState<string>();
  const [categoryNew, setcategoryNew] = useState<boolean>(false);
  const [Load, setLoad] = useState<boolean>(false);

  async function Translation() {
    if (NewcategoryTextAR && NewcategoryTextAR.length > 2) {
      const en = await translate(NewcategoryTextAR, { from: 'ar', to: 'en', engine: "google" });
      setNewcategoryTextEN(en)
    }
    else if (NewcategoryTextEN && NewcategoryTextEN.length > 2) {
      const en = await translate(NewcategoryTextEN, { from: 'en', to: 'ar', engine: "google" });
      setNewcategoryTextAR(en)
    }

  }
  function HandleAdd() {

    {
      if (NewcategoryTextAR && NewcategoryTextAR.length > 2 && NewcategoryTextEN && NewcategoryTextEN.length > 2) {
        setLoad(true);

        props.Addcategory(NewcategoryTextAR, NewcategoryTextEN).then((ele: any) => {

          setcategoryNew(false)
          setNewcategoryTextAR(undefined)
          setNewcategoryTextEN(undefined)


          setLoad(false);
        })

      }
    }
  }

  return (
    <Modal
      show={props.CreateOrEditModal}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      backdrop="static"
      centered
      contentClassName={classes.ModalClass}
      dir={_Lan === Languages.AR ? 'rtl' : 'ltr'}
    >

      {Load && (
        <div className={classes.ModalLoading}>
          <div className="spinner-border text-light" role="status">
            <span className="sr-only"> </span>
          </div></div>
      )}

      <Modal.Body>

        <div className={classes.CloseContain}>
          <h4>{strings.Categories}</h4>
          <button className={classes.btn + " " + classes.btnClose} onClick={() => props.setCreateOrEditModal(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 320.591 320.591"  ><g><path d="M30.391 318.583a30.37 30.37 0 0 1-21.56-7.288c-11.774-11.844-11.774-30.973 0-42.817L266.643 10.665c12.246-11.459 31.462-10.822 42.921 1.424 10.362 11.074 10.966 28.095 1.414 39.875L51.647 311.295a30.366 30.366 0 0 1-21.256 7.288z" fill="#000000" data-original="#000000"  ></path><path d="M287.9 318.583a30.37 30.37 0 0 1-21.257-8.806L8.83 51.963C-2.078 39.225-.595 20.055 12.143 9.146c11.369-9.736 28.136-9.736 39.504 0l259.331 257.813c12.243 11.462 12.876 30.679 1.414 42.922-.456.487-.927.958-1.414 1.414a30.368 30.368 0 0 1-23.078 7.288z" fill="#000000" data-original="#000000" ></path></g></svg>
          </button>
        </div>


        {props.category.length > 0 || categoryNew ? (


          <div className={classes.CategoList}>
            <DndProvider options={HTML5toTouch}>
              <Container
                category={props.category}
                setLoad={setLoad}
                Load={Load}
                Deletecategory={props.Deletecategory}
                setNewCategoryTextEN={setNewcategoryTextEN}
                setNewcategoryTextAR={setNewcategoryTextAR}
                setEditPointer={setEditPointer}
                setcategoryNew={setcategoryNew}
                Editcategory={props.Editcategory}
                NewCategoryTextEN={NewcategoryTextEN}
                NewCategoryTextAR={NewcategoryTextAR}
                EditPointer={EditPointer}
                Translation={Translation}

              />
            </DndProvider>



            {/* {props.category.map(ele=>{
           return(
               <div key={`${ele.id}-${ele.EnName}`}  className={ "animate__animated animate__fadeIn "+classes.Item}>
                 <div className={classes.DragIcon}>
            
                  <svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="20" height="20" x="0" y="0" viewBox="0 0 24 24"  ><g><path fill="#000000" fillRule="evenodd" d="M4 10a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z" clipRule="evenodd" data-original="#000000"  ></path></g></svg>
                   {ele.id!=EditPointer?(_Lan===Languages.AR?ele.ArName:ele.EnName):""}
      </div>
                    {ele.id===EditPointer&&(
                      <div className={classes.Inputs}>

                      <input onChange={ele=>setNewcategoryTextAR(ele.target.value)} value={NewcategoryTextAR} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinArabic}/>
                      <button onClick={()=>Translation()} className={classes.btn+" "+classes.TranslatBtn}>
                      <svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><clipPath id="a"><path d="M0 0h24v24H0z" fill="#000000" data-original="#000000"  ></path></clipPath><g clipPath="url(#a)"><path fill="#000000" d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99 0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7 1.62-4.33L19.12 17z" data-original="#000000" ></path></g></g></svg>
                      </button>
                      <input onChange={ele=>setNewcategoryTextEN(ele.target.value)} value={NewcategoryTextEN} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinEnglish}/>
                      
                      </div>
                    )}

                   <div className={classes.actions}>
                    {ele.id===EditPointer?(
                      <button disabled={NewcategoryTextAR&&NewcategoryTextAR.length>3&&NewcategoryTextEN&&NewcategoryTextEN.length>3?false:true} onClick={()=>handleSaveEdit(ele.id)} className={classes.btn+" "+classes.BtnSave} >
                       <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><switch><g><path fill="#02bc7d" d="M9.8 18c-.3 0-.5-.1-.7-.3l-4.9-5.2c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l4.1 4.4 8.4-9.2c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-.1.1-9.1 10c-.1.3-.4.4-.7.4z" data-original="#02bc7d" ></path></g></switch></g></svg>
                      </button>
                    ):(
                       <button onClick={()=>handleEdit(ele)} className={classes.btn+" "+classes.Editbtn}>
                       <svg xmlns="http://www.w3.org/2000/svg" version="1.1"  width="20" height="20" x="0" y="0" viewBox="0 0 64 64"    ><g><path fill="#000000" fillRule="evenodd" d="M38.214 6.081C43.655.64 52.478.64 57.919 6.081c5.441 5.441 5.441 14.264 0 19.705L25.505 58.2a7.304 7.304 0 0 1-4.438 2.103L4.199 61.99a2 2 0 0 1-2.19-2.189l1.688-16.868A7.304 7.304 0 0 1 5.8 38.495zm-3.274 8.93L8.628 41.325a3.304 3.304 0 0 0-.951 2.007L6.233 57.767l14.436-1.444a3.303 3.303 0 0 0 2.007-.951L48.988 29.06zm16.877 11.22L37.769 12.183l3.274-3.274c3.879-3.879 10.168-3.879 14.048 0 3.879 3.88 3.879 10.17 0 14.049z"></path></g></svg>
                       </button>)}
                       <button className={classes.btn+" "+classes.Deletebtn} onClick={()=>handleDelete(ele.id)}>
                       <svg xmlns="http://www.w3.org/2000/svg" version="1.1"   width="20" height="20" x="0" y="0" viewBox="0 0 24 24"   ><g><path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1ZM20 4h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" fill="#000000"  ></path><path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0ZM15 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" fill="#000000"></path></g></svg>
                       </button>

                   </div>
               </div>
           )
       })} */}

            {categoryNew && (
              <div className={"animate__animated animate__fadeIn " + classes.Item + "  " + classes.NewItem}>


                <div className={classes.Inputs}>

                  <input onChange={ele => setNewcategoryTextAR(ele.target.value)} value={NewcategoryTextAR} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinArabic} />
                  <button onClick={() => Translation()} className={classes.btn + " " + classes.TranslatBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><clipPath id="a"><path d="M0 0h24v24H0z" fill="#000000" data-original="#000000"  ></path></clipPath><g clipPath="url(#a)"><path fill="#000000" d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99 0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7 1.62-4.33L19.12 17z" data-original="#000000" ></path></g></g></svg>
                  </button>
                  <input onChange={ele => setNewcategoryTextEN(ele.target.value)} value={NewcategoryTextEN} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinEnglish} />

                </div>

                <div className={classes.actions + " " + classes.AddCancelActions}>

                  <button onClick={() => HandleAdd()} disabled={NewcategoryTextAR && NewcategoryTextAR.length > 2 && NewcategoryTextEN && NewcategoryTextEN.length > 2 ? false : true} className={classes.btn + " " + classes.SaveBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><switch><g><path fill="#02bc7d" d="M9.8 18c-.3 0-.5-.1-.7-.3l-4.9-5.2c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l4.1 4.4 8.4-9.2c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-.1.1-9.1 10c-.1.3-.4.4-.7.4z" data-original="#02bc7d" ></path></g></switch></g></svg>
                  </button>
                  <button onClick={() => setcategoryNew(false)} className={classes.btn + " " + classes.CancelBtn}>
                    <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 329.269 329"  ><g><g fill="#f44336"><path d="M21.34 329.398c-5.461 0-10.926-2.09-15.082-6.25-8.344-8.34-8.344-21.824 0-30.164L292.848 6.391c8.34-8.34 21.824-8.34 30.164 0 8.343 8.34 8.343 21.824 0 30.164L36.422 323.148a21.231 21.231 0 0 1-15.082 6.25zm0 0" fill="#f44336" data-original="#f44336" ></path><path d="M307.93 329.398c-5.461 0-10.922-2.09-15.082-6.25L6.258 36.555c-8.344-8.34-8.344-21.825 0-30.164 8.34-8.34 21.82-8.34 30.164 0l286.59 286.593c8.343 8.34 8.343 21.825 0 30.164-4.16 4.18-9.621 6.25-15.082 6.25zm0 0" fill="#f44336" data-original="#f44336" ></path></g></g></svg>                       </button>
                </div>
              </div>
            )}

            <button className={classes.AddBtn} disabled={categoryNew}
              onClick={() => {
                setEditPointer(undefined)
                setNewcategoryTextAR(undefined)
                setNewcategoryTextEN(undefined)
                setcategoryNew(true)
              }}>
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000" ></path></g></svg>
              {strings.Add}
            </button>
          </div>


        ) : (
          <div className={classes.dCenter}>
            <NoItems />
            <button className={classes.AddBtn}
              onClick={() => { setcategoryNew(true) }}>
              <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 448 448"   ><g><path d="M408 184H272a8 8 0 0 1-8-8V40c0-22.09-17.91-40-40-40s-40 17.91-40 40v136a8 8 0 0 1-8 8H40c-22.09 0-40 17.91-40 40s17.91 40 40 40h136a8 8 0 0 1 8 8v136c0 22.09 17.91 40 40 40s40-17.91 40-40V272a8 8 0 0 1 8-8h136c22.09 0 40-17.91 40-40s-17.91-40-40-40zm0 0" fill="#000000" data-original="#000000" ></path></g></svg>
              {strings.Add}
            </button>
          </div>

        )}

      </Modal.Body>

    </Modal>
  )
}

export default AddorEditcategoryModal;