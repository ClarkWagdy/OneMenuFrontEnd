export interface categoryT {
  id: string;
  ArName: string;
  EnName: string;
  Order: number;
}
export const ItemTypes = {
  CARD: "card",
};

export interface MenuItemT {
  id: string;
  ArName: string;
  EnName: string;
  ArDescription?: string;
  EnDescription?: string;
  Picture: string;
  Order?: number;
  Price: string;
}
export interface OwnerSettingsT {
  Language: boolean;
}

export interface ProductSizeDTO {
  id?: string;
  size: string;
  price: number | string;
}

export interface ProductDTO {
 
  sizes?: ProductSizeDTO[];
}