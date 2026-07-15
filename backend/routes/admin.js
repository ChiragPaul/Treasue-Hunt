const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Team = require('../models/Team');
const User = require('../models/User');

// Stored securely as bcrypt hashes. The plain text is never visible.
const READ_HASH = '$2b$10$4hz5z4ZXfGfms53P7bZRbuZ7LT8.AnsH76lUrDNcaucLTA/uPs.Ke'; // read access
const WRITE_HASH = '$2b$10$ZCYwhxK0d694RLyTNSt9M./3cEsPw9Mr6Fk5uM91KJsUexxnB4Qi.'; // write access

const JWT_SECRET = process.env.JWT_SECRET || 'treasure_hunt_super_secret_key_789';

// Middleware to verify JWT token
const verifyAdmin = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded.admin; // { role: 'read' | 'write' }
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

// @route   POST /api/admin/login
// @desc    Authenticate admin & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ msg: 'Please enter a password' });
  }

  try {
    // Check if it's a write password
    const isWrite = await bcrypt.compare(password, WRITE_HASH);
    if (isWrite) {
      const payload = { admin: { role: 'write' } };
      return jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, role: 'write' });
      });
    }

    // Check if it's a read password
    const isRead = await bcrypt.compare(password, READ_HASH);
    if (isRead) {
      const payload = { admin: { role: 'read' } };
      return jwt.sign(payload, JWT_SECRET, { expiresIn: '10h' }, (err, token) => {
        if (err) throw err;
        res.json({ token, role: 'read' });
      });
    }

    return res.status(400).json({ msg: 'Invalid credentials' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/admin/teams
// @desc    Get all registered teams
// @access  Private (Admin)
router.get('/teams', verifyAdmin, async (req, res) => {
  try {
    const teams = await Team.find().populate('members').sort({ createdAt: -1 });
    
    // Format to match what AdminDashboard expects
    const formattedTeams = teams.map(t => ({
      _id: t._id,
      teamName: t.name,
      teamNumber: t.teamNumber,
      members: t.members,
      createdAt: t.createdAt
    }));

    res.json(formattedTeams);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE /api/admin/teams/:id
// @desc    Delete a team
// @access  Private (Admin Write Only)
router.delete('/teams/:id', verifyAdmin, async (req, res) => {
  if (req.admin.role !== 'write') {
    return res.status(403).json({ msg: 'Access denied. Write permission required.' });
  }

  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    // Delete associated members first
    await User.deleteMany({ team: req.params.id });
    
    // Then delete the team
    await Team.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Team removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT /api/admin/teams/:id
// @desc    Update a team
// @access  Private (Admin Write Only)
router.put('/teams/:id', verifyAdmin, async (req, res) => {
  if (req.admin.role !== 'write') {
    return res.status(403).json({ msg: 'Access denied. Write permission required.' });
  }

  try {
    const { teamName, members } = req.body;
    const team = await Team.findById(req.params.id);
    
    if (!team) {
      return res.status(404).json({ msg: 'Team not found' });
    }

    if (teamName) team.name = teamName;
    
    if (members && Array.isArray(members)) {
      for (const member of members) {
        if (member._id) {
          await User.findByIdAndUpdate(member._id, member);
        }
      }
    }

    await team.save();
    
    const updatedTeam = await Team.findById(req.params.id).populate('members');
    
    res.json({
      _id: updatedTeam._id,
      teamName: updatedTeam.name,
      teamNumber: updatedTeam.teamNumber,
      members: updatedTeam.members,
      createdAt: updatedTeam.createdAt
    });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Team not found' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;
