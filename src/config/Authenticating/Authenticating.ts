
import { redirect } from 'next/navigation'; 
import { UserT } from '../Store/User/UserType';
import { UserEnum } from '../UserEnum/UserEnum';
 
 export default function Authenticating(){
 
    if (typeof window !== 'undefined'  ) { 
 const user = window.localStorage.getItem('User'); 
    if(user){ 
      let userdata=JSON.parse(user) as UserT;
      
      if(window.location.href.includes('dashboard') && userdata.type!=UserEnum.Admin){
        redirect('/login')
      }
      else if(userdata.type===UserEnum.Admin){
        redirect( '/dashboard' ); 
      }else if(userdata.type===UserEnum.Owner &&userdata.RestaurantId){
        redirect( `/menu/${userdata.RestaurantId}`); 
      }else{
        redirect('/')
      }       

    
    }
//     else{
//          redirect('/')
// }
} 

}