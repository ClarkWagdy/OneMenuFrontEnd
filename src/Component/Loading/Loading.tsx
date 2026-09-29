"use client";

import { RestaurantLogoPath } from "@/config/Api/url";
import { useAppSelector } from "@/config/Store/hooks";
import React, { useEffect, useState } from "react";
import classes from "./Loading.module.css";

interface Props {
  rtl?: boolean;
  Card?: boolean;
}

export default function Loading(props: Props) {
  const Restaurant = useAppSelector((state) => state.Restaurant);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and the first client render,
  // always use the same fallback logo.
  const logo =
    mounted && Restaurant.logo
      ? `${RestaurantLogoPath}/${Restaurant.logo}`
      : "/Ologo.svg";

  return (
    <div
      className={
        props.Card
          ? "d-flex w-100 h-100 align-items-center justify-content-center"
          : classes.ContainLoad
      }
    >
      <img
        className={classes.Logo}
        src={logo}
        alt="Restaurant Logo"
      />
    </div>
  );
}