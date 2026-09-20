const { z } = require('zod');

exports.updateMeSchema = z.object({
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters')
    .regex(/^[A-Za-z\s]+$/, 'Name can only contain letters and spaces'),
  phone: z.string()
    .trim()
    .regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits')
    .optional()
    .or(z.literal('')),
  roomNo: z.string()
    .trim()
    .regex(/^[A-Za-z][0-9]{3}$/, 'Room No must be one letter followed by 3 digits (e.g. A303)')
    .optional()
    .or(z.literal('')),
});