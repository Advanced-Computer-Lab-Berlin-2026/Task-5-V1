
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { connectDB } from '../config/db.js';
import { Instructor } from '../models/Instructor.js';

// Sample instructor accounts for the security lab
const instructors = [
  {
    name: 'Prof. Alice Smith',
    username: 'prof.smith',
    password: 'password123',
    department: 'CS',
    role: 'instructor',
    privateEmail: 'alice.smith@university.edu',
    privatePhone: '+1-555-0101'
  },
  {
    name: 'Prof. Brian Jones',
    username: 'prof.jones',
    password: 'mathRules!',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'brian.jones@university.edu',
    privatePhone: '+1-555-0102'
  },
  {
    name: 'Prof. Chen Lee',
    username: 'prof.lee',
    password: 'linalg2024',
    department: 'Math',
    role: 'instructor',
    privateEmail: 'chen.lee@university.edu',
    privatePhone: '+1-555-0103'
  },
  {
    name: 'Portal Administrator',
    username: 'admin',
    password: 'S3cr3t-Admin-Pw!',
    department: 'IT',
    role: 'superadmin',
    apiKey: 'acl_live_9f3b2c7d8e4a1b6f0d5c2a9e',
    privateEmail: 'root@university.edu',
    privatePhone: '+1-555-0000'
  }
];

async function run() {
  try {
    await connectDB();

    // Hash every password before inserting into MongoDB
    const secureInstructors = await Promise.all(
      instructors.map(async (instructor) => ({
        ...instructor,
        password: await bcrypt.hash(instructor.password, 12)
      }))
    );

    // Replace the existing sample instructor accounts
    await Instructor.deleteMany({});

    // Insert accounts with hashed passwords
    const created = await Instructor.insertMany(secureInstructors);

    console.log(`Seeded ${created.length} instructor(s):`);

    for (const instructor of created) {
      console.log(
        `- ${instructor.username} (${instructor.role})`
      );
    }

    console.log('All instructor passwords are hashed.');

  } catch (err) {
    console.error('Seed failed:', err);
    process.exitCode = 1;

  } finally {
    await mongoose.disconnect();
  }
}

run();
