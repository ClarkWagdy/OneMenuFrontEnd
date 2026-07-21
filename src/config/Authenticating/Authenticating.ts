
import { redirect } from 'next/navigation';
import { UserT } from '../Store/User/UserType';
import { UserEnum } from '../UserEnum/UserEnum';

export default function Authenticating() {

  if (typeof window !== 'undefined') {
    const user = window.localStorage.getItem('User');
    if (user !== "null" && user!==null) {
      let userdata = JSON.parse(user) as UserT;
    if (
        userdata.type === UserEnum.Admin &&
        !window.location.href.includes("dashboard")
      ) {
        redirect("/dashboard");
        // return;
      }
      else if (
    
        userdata.type === UserEnum.KitchenMan &&
         !window.location.href.includes("kitchen")
       ) {
        redirect(`/kitchen`);
      } else if (
    
        userdata.type === UserEnum.Owner &&
        userdata.RestaurantId &&
        !window.location.href.includes(`/menu/${userdata.RestaurantId}`)
      ) {
        redirect(`/menu/${userdata.RestaurantId}`);
      } else {
      return;
      }
    } else {
        
      if (!window.location.href.includes(`/login`))
         redirect("/login");

  }
  }

}