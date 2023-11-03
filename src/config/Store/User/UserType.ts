export const UserType={
    User:0,
    Owner:1,
    Admin:2,

}
export interface UserT{
    name?:  string,
    token?:  string,
    type ?:  number,
    userName?:  string,
    RestaurantId?:  string,


}