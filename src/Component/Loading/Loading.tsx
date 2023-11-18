import { RestaurantLogoPath } from '@/config/Api/url'
import { useAppSelector } from '@/config/Store/hooks'
import { RestaurantT } from '@/config/Store/Restaurant/RestaurantType'
import React from 'react'
import classes from './Loading.module.css'

interface Props {
  rtl?: boolean
}
export default function Loading(props: Props) {
  const Restaurant = useAppSelector((state) => state.Restaurant);

  return (
    <div className={classes.ContainLoad}>

      <img className={classes.Logo} src={Restaurant ? `${RestaurantLogoPath}/${Restaurant.logo}` : "/wlogo.svg"} alt="" />
    </div>
  )
}

