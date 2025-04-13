import { Document } from 'mongoose';

export interface ShippingMethods {
  apac: {
    price: number; // Preço do frete via APAC
    deliveryTime: string; // Prazo de entrega via APAC
  };
  sedex: {
    price: number; // Preço do frete via SEDEX
    deliveryTime: string; // Prazo de entrega via SEDEX
  };
}

export interface Store extends Document {
  storeID: string; // Identificador único da loja (PDV ou loja online)
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;

  type: 'PDV' | 'loja'; // Tipo de loja: PDV ou loja online

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

  shippingMethods?: ShippingMethods; // Métodos de envio, apenas para lojas online (não PDV)
  associatedPDV?: Store; // Referência à PDV associada para lojas online
}

export interface StoreResponse {
  price: number; // Preço do frete
  deliveryTime: string; // Prazo de entrega
  shippingMethods?: ShippingMethods; // Métodos de envio para loja online com mais de 50km
  storeID: string; // Identificador único da loja associado ao frete
}
