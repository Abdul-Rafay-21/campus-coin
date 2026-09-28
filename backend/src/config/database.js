import mongoose from "mongoose";

export function connectDatabase(mongoUri) 
{
  
  return mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

}
