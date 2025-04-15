import { Document } from 'mongoose';

export interface ShippingMethods {
  apac: {
    price: number;
    deliveryTime: string;
  };
  sedex: {
    price: number;
    deliveryTime: string;
  };
}

export interface Store extends Document {
  storeID: string;
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;
  type: 'PDV' | 'loja';
  latitude: number;
  longitude: number;
  address: string;
  city: string;
  district: string;
  state: string;
  country: string;
  postalCode: string;
  telephoneNumber: string;
  emailAddress: string;
  shippingMethods?: ShippingMethods;
  associatedPDV?: Store;
}

export interface StoreResponse {
  price: number;
  deliveryTime: string;
  shippingMethods?: ShippingMethods;
  storeID: string;
}
