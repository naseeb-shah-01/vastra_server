import mongoose, { Schema, Document } from "mongoose";

export interface IRequest extends Document {
  fullName: string;
  workEmail: string;
  message: string;
  role: string;
  
  organization:string;
  createdAt?: Date;
  updatedAt?: Date;
  status:"New"|"Close"|"Progress"
  share:string[]
}

const RequestSchema = new Schema<IRequest>(
  {
    fullName: { type: String, required: true },
    workEmail: { type: String, required: true },
    organization:{type:String,required:true},
    message: { type: String ,required:true},
    role: { type: String ,required:true},
    status:{type:String,default:"New"},
    share:{
      type:[String] ,default:[]
    }
  },
  { timestamps: true } // Enable timestamps
);

export default mongoose.model<IRequest>("Request", RequestSchema);
