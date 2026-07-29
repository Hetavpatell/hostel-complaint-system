const { z } = require('zod');

const CATEGORIES = ['Electrical', 'Plumbing', 'Wifi/Internet', 'Furniture', 'Cleanliness', 'Other'];

exports.createComplaintSchema = z.object({
  category: z.enum(CATEGORIES, { errorMap: () => ({ message: 'Invalid category' }) }),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
});

exports.assignWorkerSchema = z.object({
  workerId: z.coerce.number().int().positive(),
});

exports.updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED']),
});