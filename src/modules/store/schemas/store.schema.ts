import { Schema, Document } from 'mongoose';

export const StoreSchema = new Schema(
  {
    storeID: { type: String, required: true, unique: true }, // Identificador único da loja
    storeName: { type: String, required: true }, // Nome da loja
    takeOutInStore: { type: Boolean, required: true }, // Se a loja oferece retirada no local
    shippingTimeInDays: { type: Number, required: true }, // Tempo de preparo do pedido (em dias)
    
    latitude: { type: String, required: true }, // Latitude da loja ou PDV
    longitude: { type: String, required: true }, // Longitude da loja ou PDV
    address: { type: String, required: true }, // Endereço da loja
    city: { type: String, required: true }, // Cidade
    district: { type: String, required: true }, // Bairro
    state: { type: String, required: true }, // Estado
    type: { type: String, enum: ['PDV', 'LOJA'], required: true }, // Tipo de loja: PDV ou LOJA
    country: { type: String, required: true }, // País
    postalCode: { type: String, required: true }, // Código postal (CEP)
    telephoneNumber: { type: String, required: true }, // Número de telefone
    emailAddress: { type: String, required: true }, // E-mail de contato da loja
    
    shippingMethods: {
      apac: {
        price: { type: Number },
        deliveryTime: { type: String },
      },
      sedex: {
        price: { type: Number },
        deliveryTime: { type: String },
      },
    },
    associatedPDV: { type: Schema.Types.ObjectId, ref: 'Store' }, // Referência à PDV associada para lojas online
  },
  { timestamps: true },
);

export interface Store extends Document {
  storeID: string;
  storeName: string;
  takeOutInStore: boolean;
  shippingTimeInDays: number;
  latitude: string;
  longitude: string;
  address: string;
  city: string;
  district: string;
  state: string;
  type: 'PDV' | 'LOJA';
  country: string;
  postalCode: string;
  telephoneNumber: string;
  emailAddress: string;
  shippingMethods?: {
    apac: { price: number; deliveryTime: string };
    sedex: { price: number; deliveryTime: string };
  };
  associatedPDV?: Store;
}
