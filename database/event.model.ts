import { Schema, model, models, type HydratedDocument, type Model } from 'mongoose';

export interface IEvent {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: 'online' | 'offline' | 'hybrid';
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type EventDocument = HydratedDocument<IEvent>;

// `required` alone accepts an empty array, so arrays need an explicit length check.
const nonEmptyStringArray = {
  validator: (value: string[]): boolean =>
    Array.isArray(value) && value.length > 0 && value.every((item) => item.trim().length > 0),
  message: '{PATH} must contain at least one non-empty item',
};

// `trim` runs before `required`, so whitespace-only strings are rejected as empty.
const requiredString = (field: string) => ({
  type: String,
  required: [true, `${field} is required`] as [boolean, string],
  trim: true,
});

const EventSchema = new Schema<IEvent>(
  {
    title: requiredString('Title'),
    // Not marked required: it is generated in the pre-save hook, which runs after validation.
    slug: { type: String, unique: true, lowercase: true, trim: true },
    description: requiredString('Description'),
    overview: requiredString('Overview'),
    image: requiredString('Image'),
    venue: requiredString('Venue'),
    location: requiredString('Location'),
    date: requiredString('Date'),
    time: requiredString('Time'),
    mode: {
      type: String,
      required: [true, 'Mode is required'],
      enum: { values: ['online', 'offline', 'hybrid'], message: 'Mode must be online, offline or hybrid' },
      lowercase: true,
      trim: true,
    },
    audience: requiredString('Audience'),
    agenda: { type: [String], required: true, validate: nonEmptyStringArray },
    organizer: requiredString('Organizer'),
    tags: { type: [String], required: true, validate: nonEmptyStringArray },
  },
  { timestamps: true }
);

// "Next.js Conf 2026!" -> "nextjs-conf-2026"
function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip accents
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}

// Normalizes any parseable date to "YYYY-MM-DD" (ISO calendar date).
function normalizeDate(value: string): string {
  const isoMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const parsed = new Date(isoMatch ? `${value}T00:00:00` : value);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: "${value}"`);
  }

  // Build from local parts; toISOString() would shift to UTC and could change the day.
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalizes "9:00 am", "09:00 AM" or "21:30" to 24-hour "HH:mm".
function normalizeTime(value: string): string {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)?$/i);
  if (!match) {
    throw new Error(`Invalid time: "${value}". Use "HH:mm" or "h:mm AM/PM"`);
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3]?.toLowerCase();

  if (period) {
    if (hours < 1 || hours > 12) throw new Error(`Invalid time: "${value}"`);
    if (period === 'pm' && hours !== 12) hours += 12;
    if (period === 'am' && hours === 12) hours = 0;
  }

  if (hours > 23 || minutes > 59) {
    throw new Error(`Invalid time: "${value}"`);
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

EventSchema.pre('save', function (this: EventDocument) {
  // Only regenerate the slug when the title changes, so existing URLs stay stable.
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title);
  }

  if (this.isModified('date')) {
    this.date = normalizeDate(this.date);
  }

  if (this.isModified('time')) {
    this.time = normalizeTime(this.time);
  }
});

// Reuse the compiled model during hot reloads to avoid OverwriteModelError.
const Event = (models.Event as Model<IEvent> | undefined) ?? model<IEvent>('Event', EventSchema);

export default Event;
