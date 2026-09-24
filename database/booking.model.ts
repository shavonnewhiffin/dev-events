import { Schema, model, models, type HydratedDocument, type Model, type Types } from 'mongoose';
import Event from './event.model';

export interface IBooking {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingDocument = HydratedDocument<IBooking>;

// Practical email check: something@domain.tld with no spaces.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<IBooking>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: [true, 'Event ID is required'],
      // Bookings are usually looked up by event, so index this field.
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: 'Please provide a valid email address',
      },
    },
  },
  { timestamps: true }
);

// Reject bookings for events that don't exist. Skipped when eventId is unchanged.
BookingSchema.pre('save', async function (this: BookingDocument) {
  if (!this.isModified('eventId')) return;

  const eventExists = await Event.exists({ _id: this.eventId });
  if (!eventExists) {
    throw new Error(`Event with ID ${this.eventId.toString()} does not exist`);
  }
});

// Reuse the compiled model during hot reloads to avoid OverwriteModelError.
const Booking = (models.Booking as Model<IBooking> | undefined) ?? model<IBooking>('Booking', BookingSchema);

export default Booking;
