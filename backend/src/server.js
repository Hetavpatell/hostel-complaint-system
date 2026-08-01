require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('src/uploads'));

const complaintRoutes = require('./routes/complaint.routes');
app.use('/api/complaints', complaintRoutes);

const statsRoutes = require('./routes/stats.routes');
app.use('/api/stats', statsRoutes);

const userRoutes = require('./routes/user.routes');
app.use('/api/users', userRoutes);

app.use(express.static(path.join(__dirname, '../../frontend/dist')));
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));