const express = require('express');
const router = express.Router();
const { GroupSusu, GroupMember, User, sequelize } = require('../models');

// Create a new Group Susu
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, contributionAmount, frequency } = req.body;

    const group = await GroupSusu.create({
      name,
      description,
      contributionAmount,
      frequency,
      status: 'OPEN'
    });

    // Add the creator as the first member and Admin
    await GroupMember.create({
      GroupSusuId: group.id,
      UserId: userId,
      role: 'ADMIN',
      status: 'ACTIVE'
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
});

// Join an existing group
router.post('/join', async (req, res) => {
  try {
    const { userId, groupId } = req.body;

    const group = await GroupSusu.findByPk(groupId);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.status !== 'OPEN') return res.status(400).json({ message: 'Group is no longer accepting members' });

    const existingMember = await GroupMember.findOne({ where: { GroupSusuId: groupId, UserId: userId } });
    if (existingMember) return res.status(400).json({ message: 'Already a member' });

    const member = await GroupMember.create({
      GroupSusuId: groupId,
      UserId: userId,
      status: 'ACTIVE'
    });

    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Failed to join group', error: error.message });
  }
});

// Get User Groups
router.get('/user/:userId', async (req, res) => {
  try {
    const groups = await GroupSusu.findAll({
      include: [{
        model: GroupMember,
        where: { UserId: req.params.userId }
      }, {
        model: User,
        attributes: ['id', 'fullName']
      }]
    });
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user groups', error: error.message });
  }
});

// Get Group Details
router.get('/:id', async (req, res) => {
  try {
    const group = await GroupSusu.findByPk(req.params.id, {
      include: [{
        model: GroupMember,
        include: [User]
      }]
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch group details' });
  }
});

module.exports = router;
