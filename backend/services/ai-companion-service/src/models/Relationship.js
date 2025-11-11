const mongoose = require('mongoose');

// Relationships Schema
// Links senior users with family members or caregivers
const RelationshipSchema = new mongoose.Schema({
  seniorId: { 
    type: String, 
    required: true,
    index: true
  },
  linkAccId: { 
    type: String, 
    required: true,
    index: true
  },
  relation: { 
    type: String, 
    required: true 
  }, // e.g., "Son", "Daughter", "Caregiver"
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Create compound index for efficient lookups
RelationshipSchema.index({ seniorId: 1, linkAccId: 1 });

// Static method to get family members for a senior
RelationshipSchema.statics.getFamilyMembers = async function(seniorId) {
  return await this.find({ seniorId }).populate('linkAccId');
};

// Static method to find relationship by relation type
RelationshipSchema.statics.findByRelation = async function(seniorId, relation) {
  return await this.findOne({ 
    seniorId, 
    relation: new RegExp(relation, 'i') 
  });
};

module.exports = mongoose.models.Relationship || mongoose.model('Relationship', RelationshipSchema);
