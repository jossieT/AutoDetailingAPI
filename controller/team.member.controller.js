const {
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
} = require('../services/team.member.service');
const catchAsync = require('../utils/catchAsync');

const getMembers = catchAsync(async (req, res) => {
    const members = await getTeamMembers();
    res.status(200).json(members);
});

const addMember = catchAsync(async (req, res) => {
    const newMember = await addTeamMember(req.body);
    res.status(201).json(newMember);
});

const updateMember = catchAsync(async (req, res) => {
    const updatedMember = await updateTeamMember(req.params.memberId, req.body);
    res.status(200).json(updatedMember);
});

const deleteMember = catchAsync(async (req, res) => {
    await deleteTeamMember(req.params.memberId);
    res.status(204).send();
});

module.exports = {
    getMembers,
    addMember,
    updateMember,
    deleteMember,
};
