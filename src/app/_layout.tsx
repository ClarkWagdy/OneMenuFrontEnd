import { Languages } from '@/config/localization/Languages'
import { strings } from '@/config/localization/LocalizedStrings'
import React, { useEffect  } from 'react'
import { RootLayoutProps } from './layout'
import { redirect, useRouter } from 'next/navigation'
import { Cairo } from 'next/font/google'
import { useAppDispatch, useAppSelector } from '@/config/Store/hooks'
import Loading from '@/Component/Loading/Loading'
import { SetLoad } from '@/config/Store/Load/LoadSlice'
import { SetUser } from '@/config/Store/User/UserSlice' 
import { UserT } from '@/config/Store/User/UserType' 
import 'animate.css';
import { UserEnum } from '@/config/UserEnum/UserEnum'
const cairo = Cairo({ subsets: ['arabic','latin','latin-ext'] });



export default function Layout({ children}:RootLayoutProps) {

      const _Lan = useAppSelector((state) => state.Lan)
      const Load = useAppSelector((state) => state.Load)
 
      const dispatch = useAppDispatch();

 
  useEffect(()=>{
 
    dispatch(SetLoad(true));
    setTimeout(()=>{
      dispatch(SetLoad(false));
   
    },500)
   },[_Lan ])


 
   if (typeof window !== 'undefined' && window.localStorage) {
 
   const user = localStorage.getItem('User'); 
   if(user){ 
     let userdata=JSON.parse(user) as UserT;
      dispatch(SetUser(userdata)); 
     }
 
    }
    
  return (
    <html lang={strings.getLanguage()} dir={strings.getLanguage()===Languages.AR?"rtl":"ltr"} >
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body  suppressHydrationWarning={true} >
       
       <main className={cairo.className}>
   {Load?(
   <Loading rtl={strings.getLanguage()===Languages.AR?true:false}/>
   ):(<>
   {children}</>)}
        
      
        </main>
        </body>
    </html>
  )
}
