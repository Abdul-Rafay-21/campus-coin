import mongoose from "mongoose";

export const { Schema } = mongoose;

export const objectRef = (modelName, options = {}) => ({
  type: Schema.Types.ObjectId,
  ref: modelName,
  ...options,
});

export function cleanJson(_document, output) {
  delete output.__v;
  delete output.passwordHash;
  delete output.verifyTokenHash;
  delete output.verifyExpires;
  delete output.resetTokenHash;
  delete output.resetExpires;
  return output;
}

export const schemaOptions = {
  timestamps: true,
  toJSON: { transform: cleanJson },
};

export function defineModel(name, schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}
