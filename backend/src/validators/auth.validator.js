const { z } = require('zod');

exports.registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
  roomNo: z.string().trim().max(20).optional().nullable(),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, 'Invalid phone number').optional().nullable().or(z.literal('')),
});

exports.loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});