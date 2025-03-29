import mongoose from "mongoose";

export async function dbStartConnection() {
  mongoose.set("strictQuery", true);

  try {
    // const db = process.env.NODE_ENV === "production" ? process.env.DB_ATLAS : process.env.LOCAL_DB;
    const db: string = process.env.ATLAS_DB as string;
    // for connecting to MongoDB Atlas, TLS/SSL is enabled by default.
    await mongoose.connect(db);
    console.log("the db is connected...");
    
  } catch (error) {
    console.error("couldn't establish a connection with the db.", error);
  }
}
