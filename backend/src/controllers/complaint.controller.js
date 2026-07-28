const prisma = require('../prisma');

exports.createComplaint = async (req, res) => {
  try {
    const { category, title, description } = req.body;
    const studentId = req.user.id;

    if (!category || !title || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const complaint = await prisma.complaint.create({
      data: { studentId, category, title, description, photoUrl },
    });

    await prisma.complaintStatusLog.create({
      data: { complaintId: complaint.id, status: 'PENDING', changedById: studentId },
    });

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { studentId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { worker: { select: { name: true } } },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        logs: { orderBy: { changedAt: 'asc' }, include: { changedBy: { select: { name: true, role: true } } } },
        worker: { select: { name: true, phone: true } },
      },
    });

    if (!complaint) return res.status(404).json({ error: 'Not found' });

    // students can only view their own complaint
    if (req.user.role === 'STUDENT' && complaint.studentId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category } = req.query;
    const where = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const complaints = await prisma.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        student: { select: { name: true, roomNo: true, phone: true } },
        worker: { select: { name: true } },
      },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.assignWorker = async (req, res) => {
  try {
    const { workerId } = req.body;
    const complaintId = Number(req.params.id);

    const worker = await prisma.user.findUnique({ where: { id: workerId } });
    if (!worker || worker.role !== 'WORKER') {
      return res.status(400).json({ error: 'Invalid worker' });
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { workerId, status: 'ASSIGNED' },
    });

    await prisma.complaintStatusLog.create({
      data: { complaintId, status: 'ASSIGNED', changedById: req.user.id },
    });

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaintId = Number(req.params.id);
    const validStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status },
    });

    await prisma.complaintStatusLog.create({
      data: { complaintId, status, changedById: req.user.id },
    });

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { workerId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { student: { select: { name: true, roomNo: true, phone: true } } },
    });
    res.json(complaints);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.completeComplaint = async (req, res) => {
  try {
    const complaintId = Number(req.params.id);

    const existing = await prisma.complaint.findUnique({ where: { id: complaintId } });
    if (!existing || existing.workerId !== req.user.id) {
      return res.status(403).json({ error: 'Not your assigned complaint' });
    }

    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: { status: 'COMPLETED' },
    });

    await prisma.complaintStatusLog.create({
      data: { complaintId, status: 'COMPLETED', changedById: req.user.id },
    });

    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};