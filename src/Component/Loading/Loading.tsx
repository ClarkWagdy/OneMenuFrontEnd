import { RestaurantLogoPath } from '@/config/Api/url'
import { useAppSelector } from '@/config/Store/hooks'
import { RestaurantT } from '@/config/Store/Restaurant/RestaurantType'
import React from 'react'
import classes from './Loading.module.css'

interface Props {
  rtl?: boolean,
  Card?: boolean,
}
export default function Loading(props: Props) {
  const Restaurant = useAppSelector((state) => state.Restaurant);

  return (
    <div className={props.Card ? "d-flex w-100 h-100 align-items-center justify-content-center " : classes.ContainLoad}>

      <img className={classes.Logo} src={Restaurant.logo ? `${RestaurantLogoPath}/${Restaurant.logo}` : props.Card ? "/Ologo.svg" : "/Ologo.svg"} alt="" />
    </div>
  )
}

