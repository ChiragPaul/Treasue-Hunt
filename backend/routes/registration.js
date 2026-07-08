const express = require('express');
const router = express.Router();
const Team = require('../models/Team');

// Validation regexes
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^\+?[\d\s-]{10,15}$/; 

// @route   POST /api/register
// @desc    Register a new team with members
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { teamName, teamNumber, members } = req.body;

    if (!teamName || !teamNumber || !members || !Array.isArray(members)) {
      return res.status(400).json({ msg: 'Please provide all required fields.' });
    }

    if (members.length < 3 || members.length > 5) {
      return res.status(400).json({ msg: 'Team must have between 3 and 5 members.' });
    }

    // Check if team name already exists
    const existingTeamName = await Team.findOne({ teamName: new RegExp(`^${teamName}$`, 'i') });
    if (existingTeamName) {
      return res.status(400).json({ msg: 'Team name is already taken.' });
    }

    // Check if team number already exists
    let existingTeam = await Team.findOne({ teamNumber });
    if (existingTeam) {
      return res.status(400).json({ msg: 'Team number already exists. Please generate a new one.' });
    }

    // Validate member fields, email, phone number, and check for duplicates within the request
    const registerNumbers = new Set();
    const emails = new Set();
    const phones = new Set();
    
    const reqRegNumbers = [];
    const reqEmails = [];
    const reqPhones = [];

    for (let i = 0; i < members.length; i++) {
      const member = members[i];
      
      // Basic check
      if (!member.registerNumber || !member.name || !member.email || !member.contactNumber) {
         return res.status(400).json({ msg: `Operative 0${i + 1} is missing required fields.` });
      }

      // Email validation
      if (!emailRegex.test(member.email)) {
        return res.status(400).json({ msg: `Invalid email address for Operative 0${i + 1}: ${member.email}` });
      }

      // Phone validation
      if (!phoneRegex.test(member.contactNumber)) {
        return res.status(400).json({ msg: `Invalid contact number for Operative 0${i + 1}: ${member.contactNumber}` });
      }

      // Duplicate within request
      if (registerNumbers.has(member.registerNumber.toLowerCase())) {
        return res.status(400).json({ msg: `Duplicate register number within the team: ${member.registerNumber}` });
      }
      registerNumbers.add(member.registerNumber.toLowerCase());
      reqRegNumbers.push(member.registerNumber);

      if (emails.has(member.email.toLowerCase())) {
        return res.status(400).json({ msg: `Duplicate email within the team: ${member.email}` });
      }
      emails.add(member.email.toLowerCase());
      reqEmails.push(member.email);

      if (phones.has(member.contactNumber)) {
        return res.status(400).json({ msg: `Duplicate contact number within the team: ${member.contactNumber}` });
      }
      phones.add(member.contactNumber);
      reqPhones.push(member.contactNumber);
    }

    // Check if any register number, email, or phone already exists in the database
    const regexRegNumbers = reqRegNumbers.map(num => new RegExp(`^${num}$`, 'i'));
    const regexEmails = reqEmails.map(e => new RegExp(`^${e}$`, 'i'));

    const teamWithExistingMember = await Team.findOne({
      $or: [
        { 'members.registerNumber': { $in: regexRegNumbers } },
        { 'members.email': { $in: regexEmails } },
        { 'members.contactNumber': { $in: reqPhones } }
      ]
    });

    if (teamWithExistingMember) {
      return res.status(400).json({ msg: `One or more members' register number, email, or contact number is already registered in another team.` });
    }

    const newTeam = new Team({
      teamName,
      teamNumber,
      members
    });

    await newTeam.save();

    res.status(201).json({ msg: 'Registration successful', team: newTeam });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/validate-team
// @desc    Validate team name for uniqueness
// @access  Public
router.post('/validate-team', async (req, res) => {
  try {
    const { teamName } = req.body;
    if (!teamName) {
      return res.status(400).json({ msg: 'Team name is required.' });
    }
    const existingTeam = await Team.findOne({ teamName: new RegExp(`^${teamName}$`, 'i') });
    if (existingTeam) {
      return res.status(400).json({ msg: 'Team name is already taken. Please choose another.' });
    }
    res.status(200).json({ msg: 'Team name is available.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST /api/validate-member
// @desc    Validate member email, contact number, and register number for uniqueness
// @access  Public
router.post('/validate-member', async (req, res) => {
  try {
    const { email, contactNumber, registerNumber } = req.body;
    
    if (!email || !contactNumber || !registerNumber) {
      return res.status(400).json({ msg: 'Missing fields for validation.' });
    }

    const existingMember = await Team.findOne({
      $or: [
        { 'members.email': new RegExp(`^${email}$`, 'i') },
        { 'members.contactNumber': contactNumber },
        { 'members.registerNumber': new RegExp(`^${registerNumber}$`, 'i') }
      ]
    });

    if (existingMember) {
      const conflict = existingMember.members.find(m => 
        m.email.toLowerCase() === email.toLowerCase() || 
        m.contactNumber === contactNumber ||
        m.registerNumber.toLowerCase() === registerNumber.toLowerCase()
      );
      
      if (conflict) {
        if (conflict.email.toLowerCase() === email.toLowerCase()) {
          return res.status(400).json({ msg: 'Email is already registered.' });
        }
        if (conflict.contactNumber === contactNumber) {
          return res.status(400).json({ msg: 'Contact number is already registered.' });
        }
        if (conflict.registerNumber.toLowerCase() === registerNumber.toLowerCase()) {
          return res.status(400).json({ msg: 'Register number is already registered.' });
        }
      }
      return res.status(400).json({ msg: 'Member details conflict with an existing registration.' });
    }

    res.status(200).json({ msg: 'Member details are valid.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
