import mongoose from "mongoose";

export type Address = {
  country:string,
  province:string,
  city:string,
  district:string,
  street:string,
  nearestLandmark:string,
  addressType: "home" | "work",
  default:boolean
}

export type AddressDocument = Address & mongoose.Document;