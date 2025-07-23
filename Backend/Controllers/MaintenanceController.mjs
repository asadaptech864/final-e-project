import Maintenance from '../Modals/MaintenanceModal.mjs';

    
const createMaintenanceRequest = async (req, res) => {
    const { room, description, urgency, location, allowAccess, issueType, reportedBy } = req.body;
    const maintenance = new Maintenance({ room, description, urgency, location, allowAccess, issueType, reportedBy });
    await maintenance.save();
    res.status(201).json(maintenance);
};

const getAllMaintenanceRequests = async (req, res) => {
  try {
    const { role, userId } = req.query;
    let query = {};
    if (role === 'guest' && userId) {
      query = { reportedBy: userId };
    }
    if (role === 'maintenance' && userId) {
      query = { assignedTo: userId };
    }
    const allRequestedMaintenance = await Maintenance.find(query)
      .populate('room')
      .populate('reportedBy')
      .populate('assignedTo');
    res.json({ allRequestedMaintenance });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch maintenance requests' });
  }
};

const assignMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const updated = await Maintenance.findByIdAndUpdate(
      id,
      { assignedTo: userId },
      { new: true }
    ).populate('room').populate('reportedBy').populate('assignedTo');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to assign maintenance request' });
  }
};

const updateMaintenanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Maintenance.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    ).populate('room').populate('reportedBy').populate('assignedTo');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

const MaintenanceController = { createMaintenanceRequest, getAllMaintenanceRequests, assignMaintenanceRequest, updateMaintenanceStatus };

export default MaintenanceController;