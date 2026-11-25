
import Joi from 'joi';
import { Instructor } from '../models/Instructor.js';

// Only safe fields may appear in API responses
function publicProfile(doc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    username: doc.username,
    department: doc.department,
    role: doc.role
  };
}

// Validate login input
const loginSchema = Joi.object({
  username: Joi.string().trim().min(1).required(),
  password: Joi.string().min(1).required()
}).unknown(false);

// Allow only legitimate search fields
const searchSchema = Joi.object({
  name: Joi.string().trim().max(100),
  username: Joi.string().trim().max(100),
  department: Joi.string().trim().max(100),
  role: Joi.string().valid('instructor', 'superadmin')
}).unknown(false);

// Escape special regex characters in a normal search string
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// POST /api/instructors/login
export async function loginInstructor(req, res, next) {
  try {
    const { error, value } = loginSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        message: 'Invalid login input'
      });
    }

    const { username, password } = value;

    // Search using a validated username only
    const instructor = await Instructor.findOne({
      username
    }).select('+password');

    if (!instructor) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    // Compare against the stored bcrypt hash
    const passwordMatches =
      await instructor.comparePassword(password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid credentials'
      });
    }

    return res.status(200).json({
      instructor: publicProfile(instructor)
    });

  } catch (err) {
    next(err);
  }
}

// GET /api/instructors
export async function getDirectory(req, res, next) {
  try {
    const instructors = await Instructor.find()
      .select('name department role')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      instructors
    });

  } catch (err) {
    next(err);
  }
}

// GET /api/instructors/search
export async function searchInstructors(req, res, next) {
  try {
    const { error, value } = searchSchema.validate(req.query);

    if (error) {
      return res.status(400).json({
        message: 'Invalid search parameters'
      });
    }

    const filter = {};

    if (value.name) {
      filter.name = {
        $regex: escapeRegex(value.name),
        $options: 'i'
      };
    }

    if (value.username) {
      filter.username = value.username;
    }

    if (value.department) {
      filter.department = value.department;
    }

    if (value.role) {
      filter.role = value.role;
    }

    const instructors = await Instructor.find(filter)
      .select('name username department role')
      .sort({ name: 1 })
      .lean();

    return res.status(200).json({
      count: instructors.length,
      instructors
    });

  } catch (err) {
    next(err);
  }
}
