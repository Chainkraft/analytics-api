import mongoose, { Document, model, Schema } from 'mongoose';
import { Notification, NotificationSeverity, NotificationSubscription, NotificationType } from '@interfaces/notifications.interface';

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
    liquidityPool: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LiquidityPoolHistory',
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

const notificationSubscriptionSchema: Schema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    token: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Token',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const notificationsModel = model<Notification & Document>('Notification', notificationSchema);
export const notificationSubscriptionsModel = model<NotificationSubscription & Document>('NotificationSubscription', notificationSubscriptionSchema);
