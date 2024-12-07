
const TeamMember = require('../model/team.members.model');

const getTeamMembers = async () => {
    return await TeamMember.find(); // Fetch all team members
};

const addTeamMember = async (memberData) => {
    return await TeamMember.create(memberData); // Add a new team member
};

const updateTeamMember = async (memberId, memberData) => {
    const member = await TeamMember.findById(memberId);
    if (!member) {
        throw new Error('Team member not found');
    }
    Object.assign(member, memberData);
    return await member.save();
};

const deleteTeamMember = async (memberId) => {
    return await TeamMember.findByIdAndDelete(memberId); // Delete team member
};

module.exports = {
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
};
