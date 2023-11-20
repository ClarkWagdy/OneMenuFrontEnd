import { Languages } from '@/config/localization/Languages';
import { strings } from '@/config/localization/LocalizedStrings';
import { useAppSelector } from '@/config/Store/hooks';
import { CategoryDTO } from '@/config/Store/Restaurant/RestaurantType';
import type { Identifier, XYCoord } from 'dnd-core'
import type { FC } from 'react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import Swal from 'sweetalert2';
import classes from '../Menu.module.scss';
import { toast } from 'react-toastify';

import { ItemTypes } from './typs';

export interface CardProps {

  index: number
  categ: CategoryDTO
  moveCard: (dragIndex: number, hoverIndex: number) => void
  setLoad: Function
  Load: boolean
  Deletecategory: Function
  setcategoryNew: Function
  setEditPointer: Function
  setNewCategoryTextAR: Function
  setNewCategoryTextEN: Function
  Editcategory: Function
  NewCategoryTextEN: string | undefined
  NewCategoryTextAR: string | undefined
  EditPointer: string | undefined
  Translation: Function


}

interface DragItem {
  index: number
  id: string
  type: string
}

export const Card: FC<CardProps> = ({ index, categ, moveCard, setLoad, Load, Deletecategory,
  setcategoryNew,
  setEditPointer,
  setNewCategoryTextAR,
  setNewCategoryTextEN,
  Editcategory,
  NewCategoryTextEN,
  NewCategoryTextAR, EditPointer,
  Translation }) => {
  const _Lan = useAppSelector((state) => state.Lan);
  const ref = useRef<HTMLDivElement>(null)
  const [{ handlerId }, drop] = useDrop<DragItem, void, { handlerId: Identifier | null }>({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item: DragItem, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    },
  })

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      let ID = categ.id;
      return { ID, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))

  function handleDelete(id: string) {
    Swal.fire({
      title: strings.Areyousuredeletingthecategory,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      cancelButtonText: strings.cancel,
      confirmButtonText: strings.Yesdeleteit,

    }).then((result: any) => {
      if (result.isConfirmed) {
        setLoad(true);
        Deletecategory(id).then((ele: any) => {

          setLoad(false);
          toast.success(strings.deleted, {
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

        })
      }
    }).catch(err => {

    })
  }

  function handleEdit(category: { id: string, nameAr: string, nameEn: string }) {
    setcategoryNew(false)
    setEditPointer(category.id)
    setNewCategoryTextAR(category.nameAr);
    setNewCategoryTextEN(category.nameEn);
  }
  function handleSaveEdit(id: string) {
    {
      if (NewCategoryTextAR && NewCategoryTextAR.length > 3 && NewCategoryTextEN && NewCategoryTextEN.length > 3) {
        setLoad(true);

        Editcategory(id, NewCategoryTextAR, NewCategoryTextEN).then((ele: any) => {

          setEditPointer(undefined)
          setNewCategoryTextAR(undefined)
          setNewCategoryTextEN(undefined)


          setLoad(false);
        })

      }
    }
  }

  return (

    <div ref={ref} style={{ opacity }} data-handler-id={handlerId} key={`${categ.id}-${categ.nameEn}`} className={isDragging ? "" : "animate__animated animate__fadeIn " + classes.Item}>
      <div className={classes.DragIcon}>

        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24"  ><g><path fill="#000000" fillRule="evenodd" d="M4 10a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1zm0 4a1 1 0 0 1 1-1h14a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1z" clipRule="evenodd" data-original="#000000"  ></path></g></svg>
        {categ.id != EditPointer ? (_Lan === Languages.AR ? categ.nameAr : categ.nameEn) : ""}
      </div>
      {categ.id === EditPointer && (
        <div className={classes.Inputs}>

          <input onChange={ele => setNewCategoryTextAR(ele.target.value)} value={NewCategoryTextAR} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinArabic} />
          <button onClick={() => Translation()} className={classes.btn + " " + classes.TranslatBtn}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><clipPath id="a"><path d="M0 0h24v24H0z" fill="#000000" data-original="#000000"  ></path></clipPath><g clipPath="url(#a)"><path fill="#000000" d="M12.65 15.67c.14-.36.05-.77-.23-1.05l-2.09-2.06.03-.03A17.52 17.52 0 0 0 14.07 6h1.94c.54 0 .99-.45.99-.99v-.02c0-.54-.45-.99-.99-.99H10V3c0-.55-.45-1-1-1s-1 .45-1 1v1H1.99c-.54 0-.99.45-.99.99 0 .55.45.99.99.99h10.18A15.66 15.66 0 0 1 9 11.35c-.81-.89-1.49-1.86-2.06-2.88A.885.885 0 0 0 6.16 8c-.69 0-1.13.75-.79 1.35.63 1.13 1.4 2.21 2.3 3.21L3.3 16.87a.99.99 0 0 0 0 1.42c.39.39 1.02.39 1.42 0L9 14l2.02 2.02c.51.51 1.38.32 1.63-.35zM17.5 10c-.6 0-1.14.37-1.35.94l-3.67 9.8c-.24.61.22 1.26.87 1.26.39 0 .74-.24.88-.61l.89-2.39h4.75l.9 2.39c.14.36.49.61.88.61.65 0 1.11-.65.88-1.26l-3.67-9.8c-.22-.57-.76-.94-1.36-.94zm-1.62 7 1.62-4.33L19.12 17z" data-original="#000000" ></path></g></g></svg>
          </button>
          <input onChange={ele => setNewCategoryTextEN(ele.target.value)} value={NewCategoryTextEN} className={classes.AddInput} placeholder={strings.NameofthenewcategoryinEnglish} />

        </div>
      )}

      <div className={classes.actions}>
        {categ.id === EditPointer ? (
          <button disabled={NewCategoryTextAR && NewCategoryTextAR.length > 3 && NewCategoryTextEN && NewCategoryTextEN.length > 3 ? false : true} onClick={() => handleSaveEdit(categ.id)} className={classes.btn + " " + classes.BtnSave} >
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="15" height="15" x="0" y="0" viewBox="0 0 24 24"><g><switch><g><path fill="#02bc7d" d="M9.8 18c-.3 0-.5-.1-.7-.3l-4.9-5.2c-.4-.4-.4-1 0-1.4s1-.4 1.4 0l4.1 4.4 8.4-9.2c.3-.4 1-.5 1.4-.2s.5 1 .2 1.4l-.1.1-9.1 10c-.1.3-.4.4-.7.4z" data-original="#02bc7d" ></path></g></switch></g></svg>
          </button>
        ) : (
          <button onClick={() => handleEdit(categ)} className={classes.btn + " " + classes.Editbtn}>
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 64 64"    ><g><path fill="#000000" fillRule="evenodd" d="M38.214 6.081C43.655.64 52.478.64 57.919 6.081c5.441 5.441 5.441 14.264 0 19.705L25.505 58.2a7.304 7.304 0 0 1-4.438 2.103L4.199 61.99a2 2 0 0 1-2.19-2.189l1.688-16.868A7.304 7.304 0 0 1 5.8 38.495zm-3.274 8.93L8.628 41.325a3.304 3.304 0 0 0-.951 2.007L6.233 57.767l14.436-1.444a3.303 3.303 0 0 0 2.007-.951L48.988 29.06zm16.877 11.22L37.769 12.183l3.274-3.274c3.879-3.879 10.168-3.879 14.048 0 3.879 3.88 3.879 10.17 0 14.049z"></path></g></svg>
          </button>)}
        <button className={classes.btn + " " + classes.Deletebtn} onClick={() => handleDelete(categ.id)}>
          <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="20" height="20" x="0" y="0" viewBox="0 0 24 24"   ><g><path d="M19 7a1 1 0 0 0-1 1v11.191A1.92 1.92 0 0 1 15.99 21H8.01A1.92 1.92 0 0 1 6 19.191V8a1 1 0 0 0-2 0v11.191A3.918 3.918 0 0 0 8.01 23h7.98A3.918 3.918 0 0 0 20 19.191V8a1 1 0 0 0-1-1ZM20 4h-4V2a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v2H4a1 1 0 0 0 0 2h16a1 1 0 0 0 0-2ZM10 4V3h4v1Z" fill="#000000"  ></path><path d="M11 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0ZM15 17v-7a1 1 0 0 0-2 0v7a1 1 0 0 0 2 0Z" fill="#000000"></path></g></svg>
        </button>

      </div>
    </div>








  )
}
