import Maintenance from '../Modals/MaintenanceModal.mjs';
import Users from '../Modals/UsersModal.mjs';
import Rooms from '../Modals/RoomsModal.mjs';
import EmailController from './EmailController.mjs';
import Notification from '../Modals/NotificationModal.mjs';

    
const createMaintenanceRequest = async (req, res) => {
    try {
        const { room, description, urgency, location, allowAccess, issueType, reportedBy } = req.body;
        const maintenance = new Maintenance({ room, description, urgency, location, allowAccess, issueType, reportedBy });
        await maintenance.save();
        
        // Populate the maintenance request with room and reporter details for email
        const populatedMaintenance = await Maintenance.findById(maintenance._id)
            .populate('room')
            .populate('reportedBy');
        
        // Send email to the reporter
        if (populatedMaintenance.reportedBy && populatedMaintenance.reportedBy.email) {
            const html = `
                <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
                    <h2 style="color:#2563eb;text-align:center;margin-bottom:24px;">Maintenance Request Submitted</h2>
                    <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${populatedMaintenance.reportedBy.name}</b>,<br>Your maintenance request has been successfully submitted. Here are the details:</p>
                    <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
                        <h3 style="color:#333;margin-bottom:8px;">Room Details</h3>
                        <ul style="list-style:none;padding:0;font-size:15px;">
                            <li><b>Room Name:</b> ${populatedMaintenance.room.name}</li>
                            <li><b>Type:</b> ${populatedMaintenance.room.roomType}</li>
                            <li><b>Beds:</b> ${populatedMaintenance.room.beds}</li>
                            <li><b>Baths:</b> ${populatedMaintenance.room.baths}</li>
                            <li><b>Area:</b> ${populatedMaintenance.room.area} m²</li>
                        </ul>
                    </div>
                    <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
                        <h3 style="color:#333;margin-bottom:8px;">Maintenance Request Details</h3>
                        <ul style="list-style:none;padding:0;font-size:15px;">
                            <li><b>Description:</b> ${populatedMaintenance.description}</li>
                            <li><b>Urgency:</b> ${populatedMaintenance.urgency}</li>
                            <li><b>Location:</b> ${populatedMaintenance.location}</li>
                            <li><b>Issue Type:</b> ${populatedMaintenance.issueType}</li>
                            <li><b>Allow Access:</b> ${populatedMaintenance.allowAccess ? 'Yes' : 'No'}</li>
                            <li><b>Status:</b> Pending</li>
                        </ul>
                    </div>
                    <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">We will review your request and assign it to our maintenance team.<br>You will receive updates on the status of your request.</p>
                    <hr style="margin:24px 0;"/>
                    <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Maintenance System</p>
                </div>
            `;
            
            try {
                await EmailController.sendMail(
                    populatedMaintenance.reportedBy.email,
                    'Maintenance Request Submitted Successfully',
                    html
                );
            } catch (e) {
                console.error('Maintenance request email error:', e);
            }
        }
        
        // Create notification for the reporter
        try {
            await Notification.create({
                userId: reportedBy,
                type: 'maintenance',
                message: `Maintenance request submitted successfully for room ${populatedMaintenance.room.name}. Status: Pending`,
                data: { 
                    maintenanceId: maintenance._id, 
                    roomId: room, 
                    status: 'Pending',
                    description,
                    urgency,
                    issueType
                },
            });
        } catch (e) {
            console.error('Notification creation error:', e);
        }
        
        res.status(201).json(maintenance);
    } catch (error) {
        console.error('Maintenance request creation error:', error);
        res.status(500).json({ message: 'Error creating maintenance request', error: error.message });
    }
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

    // Send email to assigned user
    if (updated && updated.assignedTo && updated.assignedTo.email) {
      const room = updated.room;
      const html = `
        <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
          <h2 style="color:#2563eb;text-align:center;margin-bottom:24px;">New Maintenance Assignment</h2>
          <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${updated.assignedTo.name}</b>,<br>You have been assigned a new maintenance request. Here are the details:</p>
          <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
            <h3 style="color:#333;margin-bottom:8px;">Room Details</h3>
            <ul style="list-style:none;padding:0;font-size:15px;">
              <li><b>Room Name:</b> ${room.name}</li>
              <li><b>Type:</b> ${room.roomType}</li>
              <li><b>Beds:</b> ${room.beds}</li>
              <li><b>Baths:</b> ${room.baths}</li>
              <li><b>Area:</b> ${room.area} m²</li>
            </ul>
          </div>
          <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
            <h3 style="color:#333;margin-bottom:8px;">Maintenance Request</h3>
            <ul style="list-style:none;padding:0;font-size:15px;">
              <li><b>Description:</b> ${updated.description}</li>
              <li><b>Urgency:</b> ${updated.urgency}</li>
              <li><b>Location:</b> ${updated.location}</li>
              <li><b>Issue Type:</b> ${updated.issueType}</li>
              <li><b>Allow Access:</b> ${updated.allowAccess ? 'Yes' : 'No'}</li>
              <li><b>Reported By:</b> ${updated.reportedBy?.name || 'N/A'} (${updated.reportedBy?.email || ''})</li>
            </ul>
          </div>
          <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">Please address this request as soon as possible.</p>
          <hr style="margin:24px 0;"/>
          <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Maintenance System</p>
        </div>
      `;
      await EmailController.sendMail(
        updated.assignedTo.email,
        'New Maintenance Assignment',
        html
      );
      // Create notification for assigned user
      await Notification.create({
        userId: updated.assignedTo._id,
        type: 'maintenance',
        message: `You have been assigned a new maintenance request for room ${room.name}.`,
        data: { maintenanceId: updated._id, roomId: room._id },
      });
    }

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

    // Send email to the user who reported the request
    if (updated && updated.reportedBy && updated.reportedBy.email) {
      let subject = 'Maintenance Request Update';
      let html = '';
      let notifMsg = '';
      if (status === 'Pending') {
        subject = 'Your Maintenance Request is Pending';
        notifMsg = 'Your maintenance request is pending.';
        html = `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
            <h2 style="color:#eab308;text-align:center;margin-bottom:24px;">Maintenance Request Pending</h2>
            <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${updated.reportedBy.name}</b>,<br>Your maintenance request is currently pending. We will address it as soon as possible.</p>
            <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
              <h3 style="color:#333;margin-bottom:8px;">Request Details</h3>
              <ul style="list-style:none;padding:0;font-size:15px;">
                <li><b>Description:</b> ${updated.description}</li>
                <li><b>Urgency:</b> ${updated.urgency}</li>
                <li><b>Location:</b> ${updated.location}</li>
                <li><b>Issue Type:</b> ${updated.issueType}</li>
              </ul>
            </div>
            <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">Thank you for your patience.</p>
            <hr style="margin:24px 0;"/>
            <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Maintenance System</p>
          </div>
        `;
      } else if (status === 'In Progress') {
        subject = 'Your Maintenance Request is In Progress';
        notifMsg = 'Your maintenance request is now in progress.';
        html = `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
            <h2 style="color:#2563eb;text-align:center;margin-bottom:24px;">Maintenance In Progress</h2>
            <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${updated.reportedBy.name}</b>,<br>Your maintenance request is now being worked on by our team.</p>
            <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
              <h3 style="color:#333;margin-bottom:8px;">Request Details</h3>
              <ul style="list-style:none;padding:0;font-size:15px;">
                <li><b>Description:</b> ${updated.description}</li>
                <li><b>Urgency:</b> ${updated.urgency}</li>
                <li><b>Location:</b> ${updated.location}</li>
                <li><b>Issue Type:</b> ${updated.issueType}</li>
              </ul>
            </div>
            <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">We will notify you once it is resolved.</p>
            <hr style="margin:24px 0;"/>
            <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Maintenance System</p>
          </div>
        `;
      } else if (status === 'Resolved') {
        subject = 'Your Maintenance Request is Resolved';
        notifMsg = 'Your maintenance request has been resolved.';
        html = `
          <div style="font-family:Arial,sans-serif;padding:24px;background:#f7f7fa;border-radius:12px;max-width:520px;margin:auto;box-shadow:0 2px 8px #0001;">
            <h2 style="color:#16a34a;text-align:center;margin-bottom:24px;">Maintenance Request Resolved</h2>
            <p style="font-size:16px;color:#222;margin-bottom:16px;">Dear <b>${updated.reportedBy.name}</b>,<br>Your maintenance request has been resolved. Thank you for bringing this to our attention.</p>
            <div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border:1px solid #eee;">
              <h3 style="color:#333;margin-bottom:8px;">Request Details</h3>
              <ul style="list-style:none;padding:0;font-size:15px;">
                <li><b>Description:</b> ${updated.description}</li>
                <li><b>Urgency:</b> ${updated.urgency}</li>
                <li><b>Location:</b> ${updated.location}</li>
                <li><b>Issue Type:</b> ${updated.issueType}</li>
              </ul>
            </div>
            <p style="font-size:14px;color:#555;text-align:center;margin-top:24px;">If you have further issues, please let us know.</p>
            <hr style="margin:24px 0;"/>
            <p style="font-size:12px;color:#888;text-align:center;">&copy; ${new Date().getFullYear()} Hotel Maintenance System</p>
          </div>
        `;
      }
      if (html) {
        await EmailController.sendMail(
          updated.reportedBy.email,
          subject,
          html
        );
        // Create notification for reporter
        await Notification.create({
          userId: updated.reportedBy._id,
          type: 'maintenance',
          message: notifMsg,
          data: { maintenanceId: updated._id, roomId: updated.room._id, status },
        });
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update status' });
  }
};

const MaintenanceController = { createMaintenanceRequest, getAllMaintenanceRequests, assignMaintenanceRequest, updateMaintenanceStatus };

export default MaintenanceController;