 
 export interface AdvertisingMediaDTO{
     id: string,
     fileName:string ,
     isActive: boolean,
     type: number,
 }
 export interface CategoryDTO{
    id :string,
     nameAr :string,
      nameEn :string,
      order :number,
      isActive:boolean,
 }
 
 export interface  ProductDTO
 {
      id :string,
     nameAr :string,
     nameEn :string,
      descAR :string,
      descEN :string,
      order :number,
     image :string,
     price :string,



 }
export interface RestaurantT{
    id :string,
    categories?:CategoryDTO[],
    changeLanguageStatus?: boolean,
    color?:string,
    defaultLanguage?:number,
    
    logo?:string,
    name?:string,
    offerStatus?: boolean,
    offers ?: AdvertisingMediaDTO[],
    products ?:  ProductDTO[],
    video ?: AdvertisingMediaDTO,
    videoStatus?:boolean,

}