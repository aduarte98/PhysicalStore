import { Schema, Document } from 'mongoose';

export const StoreSchema = new Schema(
  {
    storeID: { type: String, required: true, unique: true },
    storeName: { type: String, required: true },
    takeOutInStore: { type: Boolean, required: true },
    shippingTimeInDays: { type: Number, required: true },
    latitude: { type: String, required: true },
    longitude: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    state: { type: String, required: true },
    type: { type: String, enum: ['PDV', 'LOJA'], required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    telephoneNumber: { type: String, required: true },
    emailAddress: { type: String, required: true },
    
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
    associatedPDV: { type: Schema.Types.ObjectId, ref: 'Store' },
  },
  { timestamps: true },
);