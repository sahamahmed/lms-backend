import mongoose, { Document, Model } from "mongoose";

export interface IOrder extends Document {
    courseId: mongoose.Schema.Types.ObjectId;
    userId: mongoose.Schema.Types.ObjectId;
    paymentInfo: object;
}    

const orderSchema: mongoose.Schema<IOrder> = new mongoose.Schema<IOrder>({
    courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',
        required: true
    },
    paymentInfo: {
       type: Object
    }
}, {
    timestamps: true
})

const Order: Model<IOrder> = mongoose.model<IOrder>("Order", orderSchema)

export default Order
