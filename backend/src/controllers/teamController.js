import TeamMember from '../models/TeamMember.js';

export const getTeamMembers = async (req, res) => {
  try {
    const members = await TeamMember.find().sort({ createdAt: -1 });
    res.json({ success: true, members });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeamMember = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const member = await TeamMember.create({ name, email, role });
    res.status(201).json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTeamMember = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const member = await TeamMember.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status },
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, member });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteTeamMember = async (req, res) => {
  try {
    const member = await TeamMember.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ success: false, message: 'Team member not found' });
    }
    res.json({ success: true, message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
