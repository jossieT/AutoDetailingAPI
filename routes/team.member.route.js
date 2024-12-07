const express = require('express');
const {
    getMembers,
    addMember,
    updateMember,
    deleteMember,
} = require('../controller/team.member.controller');

const router = express.Router();

router.get('/', getMembers); // Get all team members
router.post('/', addMember); // Add a team member
router.put('/:memberId', updateMember); // Update a team member
router.delete('/:memberId', deleteMember); // Delete a team member

module.exports = router;
