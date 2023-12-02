"use client";
import React, { useEffect, useState } from 'react'
import Script from "next/script";
import classes from './Dashboard.module.scss'
import Authenticating from '@/config/Authenticating/Authenticating'
import HeadTag from '@/Component/Head/HeadTag'
import { strings } from '@/config/localization/LocalizedStrings'
import Image from 'next/image'


import '/public/Dashboard/css/nucleo-icons.css'
import '/public/Dashboard/css/nucleo-svg.css'
import '/public/Dashboard/css/nucleo-svg.css'
import '/public/Dashboard/scss/soft-ui-dashboard.scss'
import { redirect } from 'next/navigation';


import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Home from './Home';
import { Languages } from '@/config/localization/Languages';
import { DashboardPages } from '@/config/Dashboard/DashboardPages';
import Subscribers from './subscribers/Subscribers';
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks';
import { SetDashboardPages } from '@/config/Store/DashboardPages/DashboardPagesSlice';
import { UserEnum } from '@/config/UserEnum/UserEnum';
import { UserT } from '@/config/Store/User/UserType';
export default function Dashboard() {
  const user = window.localStorage.getItem('User');

  if (user) {
    let userdata = JSON.parse(user) as UserT;
    if (!userdata.type || userdata.type != UserEnum.Admin) {
      redirect('/login')
    }
  } else {
    redirect('/login')
  }

  const iconSidenav = document.getElementById('iconSidenav');
  const dispatch = useAppDispatch();
  const DashboardPage = useAppSelector((state) => state.DashboardPage)
  const [CurrentPage, setCurrentPage] = useState(DashboardPage);
  function toggleSidenav() {
    if (document.getElementById('sidenavBody')?.classList.contains('g-sidenav-pinned')) {
      document.getElementById('sidenavBody')?.classList.remove('g-sidenav-pinned');
      setTimeout(function () {
        document.getElementById('sidenav-main')?.classList.remove('bg-white');
      }, 100);
      document.getElementById('sidenav-main')?.classList.remove('bg-transparent');

    } else {
      document.getElementById('sidenavBody')?.classList.add('g-sidenav-pinned');
      document.getElementById('sidenav-main')?.classList.add('bg-white');
      document.getElementById('sidenav-main')?.classList.remove('bg-transparent');
      iconSidenav?.classList.remove('d-none');
    }
  }

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


          {CurrentPage === DashboardPages.Home && (
            <Home />
          )}

          {CurrentPage === DashboardPages.Subscribers && (
            <Subscribers />
          )}
        </main>
      </section>

    </>

  )
}
