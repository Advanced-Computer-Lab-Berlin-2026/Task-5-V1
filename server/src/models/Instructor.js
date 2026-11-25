
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const instructorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    department: {
      type: String
    },

    role: {
      type: String,
      enum: ['instructor', 'superadmin'],
      default: 'instructor'
    },

    apiKey: {
      type: String,
      select: false
    },

    privateEmail: {
      type: String,
      select: false
    },

    privatePhone: {
      type: String,
      select: false
    }
  },
  { timestamps: true }
);

// Hash passwords before saving
instructorSchema.pre('save', async function (next) {
  try {
    if (!this.isModified('password')) {
      return next();
    }

    this.password = await bcrypt.hash(this.password, 12);
    next();
  } catch (error) {
    next(error);
  }
});

// Safely compare login passwords
instructorSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export const Instructor = mongoose.model(
  'Instructor',
  instructorSchema
);
