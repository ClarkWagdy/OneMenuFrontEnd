"use client";
import React, { useEffect, useState } from 'react'
import HeadTag from '@/Component/Head/HeadTag'
import { strings } from '@/config/localization/LocalizedStrings'
 import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Home from './Home';
import { Languages } from '@/config/localization/Languages';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { SetDashboardPages } from '@/config/Store/DashboardPages/DashboardPagesSlice';
import { UserEnum } from '@/config/UserEnum/UserEnum';
import { UserT } from '@/config/Store/User/UserType';

import '/public/Dashboard/css/nucleo-icons.css'
import '/public/Dashboard/css/nucleo-svg.css'
import '/public/Dashboard/css/nucleo-svg.css'
import '/public/Dashboard/scss/soft-ui-dashboard.scss';
import { toggleSidenav } from '@/config/toggleSide/toggleSidenav';
import Authenticating from '@/config/Authenticating/Authenticating';

export default function Dashboard() {

  Authenticating();
  const dispatch = useAppDispatch();
  const DashboardPage = useAppSelector((state) => state.DashboardPage)
  const [CurrentPage, setCurrentPage] = useState(DashboardPage);


  function handleChange(num: number) {
    dispatch(SetDashboardPages(num));
    setCurrentPage(num)
  }
  return (
    <>

      <HeadTag title={strings.Dashboard} description="All in one chip" keywords={"One card, NFC, nfc, chip"} />

      <section id="sidenavBody" className={`g-sidenav-show  bg-gray-100 mxh-100-ovh ${strings.getLanguage() === Languages.AR ? " rtl" : ""} `}>
        <Sidebar toggleSidenav={toggleSidenav} PageChange={handleChange} CurrentPage={CurrentPage} />
        <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
          {/* Navbar */}
          <Navbar CurrentPage={CurrentPage} toggleSidenav={toggleSidenav} />
          {/* End Navbar */}



          <Home />

          {/* {CurrentPage === DashboardPages.Subscribers && (
            <Subscribers />
          )}
          {CurrentPage === DashboardPages.ConnectUs && (
            <ConnectUs />
          )} */}
        </main>
      </section>

    </>

  )
}
