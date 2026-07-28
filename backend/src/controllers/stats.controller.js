const prisma = require('../prisma');

exports.getStats = async (req, res) => {
  try {
    const total = await prisma.complaint.count();

    const byStatus = await prisma.complaint.groupBy({
      by: ['status'],
      _count: true,
    });

    const byCategory = await prisma.complaint.groupBy({
      by: ['category'],
      _count: true,
    });

    res.json({ total, byStatus, byCategory });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};