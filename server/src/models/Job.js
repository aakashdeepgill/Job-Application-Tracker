import mongoose from 'mongoose';

export const JOB_STATUSES = ['Applied', 'Interviewing', 'Offer', 'Rejected', 'Withdrawn'];

const jobSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Company name is required.'],
      trim: true,
      maxlength: [120, 'Company names must be 120 characters or fewer.'],
    },
    role: {
      type: String,
      required: [true, 'Role is required.'],
      trim: true,
      maxlength: [120, 'Role names must be 120 characters or fewer.'],
    },
    status: {
      type: String,
      enum: JOB_STATUSES,
      default: 'Applied',
    },
    dateApplied: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [120, 'Locations must be 120 characters or fewer.'],
      default: '',
    },
    jobUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Job URLs must be 500 characters or fewer.'],
      default: '',
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes must be 2,000 characters or fewer.'],
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);