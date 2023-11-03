import { url } from "@/config/Api/url";
import { useAppDispatch } from "@/config/Store/hooks";
import { SetLoad } from "@/config/Store/Load/LoadSlice";
import { SetRestaurant } from "@/config/Store/Restaurant/RestaurantSlice";
import { RestaurantT } from "@/config/Store/Restaurant/RestaurantType";
import axios from "axios";

export function GetRestaurant(id:string){
    const dispatch = useAppDispatch();

    var data=axios.get(`${url}/restaurant/by-id/${id}`)
    .then(function (response) {
      if(response.status===200){
        var restaurant:RestaurantT={...response.data.data.restaurant};
        
        
        dispatch(SetRestaurant(restaurant));              
        
      }
      
    
    })
    .catch(function (error) {
      // handle error
      dispatch(SetLoad(false));
      console.log(error);
    }) 

    return data;
} 