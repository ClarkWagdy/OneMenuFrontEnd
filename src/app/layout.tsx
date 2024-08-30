
'use client'
import './globals.css'
import 'animate.css';
import { Provider } from 'react-redux';
import { store } from '@/config/Store/Store';
import React, { useEffect } from 'react'
import Layout from './_layout';
// add bootstrap css 
import 'bootstrap/dist/css/bootstrap.css'
import 'react-toastify/dist/ReactToastify.css';
import { NextUIProvider } from "@nextui-org/react";

export interface RootLayoutProps {
  children: React.ReactNode

}
export default function RootLayout({ children }: RootLayoutProps) {



  return (
    <Provider store={store}>

      <Layout>
        <NextUIProvider>
          {children}
        </NextUIProvider>
      </Layout>

    </Provider>
  )
}
