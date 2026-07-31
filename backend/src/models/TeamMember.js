import mongoose from 'mongoose';

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    role: {
      type: String,
      enum: ['Admin', 'Manager', 'Team', 'Viewer'],
      default: 'Viewer',
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Inactive'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
export default TeamMember;
