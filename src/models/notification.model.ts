import mongoose, { Document, Model } from "mongoose";

export interface INotification extends Document {
    title: string;
    message: string;
    status: string;
    userId: mongoose.Schema.Types.ObjectId;
}    

const notificationSchema: mongoose.Schema<INotification> = new mongoose.Schema<INotification>({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'unread'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
}, {
    timestamps: true
})


const Notification: Model<INotification> = mongoose.model<INotification>("Notification", notificationSchema)
export default Notification