import mongoose, { Document, model, Schema } from 'mongoose';
import { Notification, NotificationSeverity, NotificationType } from '@interfaces/notifications.interface';

const notificationSchema: Schema = new Schema(
  {
    type: {
      type: String,
      enum: NotificationType,
      required: true,
    },
    severity: {
      type: String,
      enum: NotificationSeverity,
      required: true,
    },
    data: {
      type: Object,
      required: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: false,
    },
    contract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const notificationsModel = model<Notification & Document>('Notification', notificationSchema);

export default notificationsModel;
