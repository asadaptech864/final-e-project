import Contact from '../Modals/ContactModal.mjs';
import Notification from '../Modals/NotificationModal.mjs';
import Users from '../Modals/UsersModal.mjs';

// Create new contact query
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, message, userId } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        message: "All fields are required" 
      });
    }

    // Create contact query
    const contact = new Contact({
      name,
      email,
      phone,
      message,
      userId: userId || null
    });

    await contact.save();

    // Send notification to admin
    const adminId = '687bbb8760121dcc362d3cfa';
    const notification = new Notification({
      userId: adminId,
      title: 'New Contact Query',
      message: `New contact query from ${name} (${email})`,
      type: 'contact',
      relatedId: contact._id,
      isRead: false
    });

    await notification.save();

    res.status(201).json({ 
      message: "Contact query submitted successfully",
      contact: {
        _id: contact._id,
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
        message: contact.message,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });

  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({ 
      message: "Error creating contact query", 
      error: error.message 
    });
  }
};

// Get all contact queries (for admin)
export const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .sort({ createdAt: -1 });

    const contactsWithUserInfo = await Promise.all(
      contacts.map(async (contact) => {
        let userInfo = null;
        if (contact.userId) {
          const user = await Users.findById(contact.userId);
          if (user) {
            userInfo = {
              name: user.name,
              email: user.email,
              role: user.role
            };
          }
        }

        return {
          _id: contact._id,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          message: contact.message,
          userId: contact.userId,
          userInfo,
          status: contact.status,
          adminReply: contact.adminReply,
          createdAt: contact.createdAt,
          updatedAt: contact.updatedAt
        };
      })
    );

    res.status(200).json({ 
      message: "Contacts retrieved successfully", 
      contacts: contactsWithUserInfo 
    });

  } catch (error) {
    console.error('Get all contacts error:', error);
    res.status(500).json({ 
      message: "Error retrieving contacts", 
      error: error.message 
    });
  }
};

// Send admin reply to contact query
export const sendAdminReply = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { replyMessage, adminId } = req.body;

    if (!replyMessage) {
      return res.status(400).json({ 
        message: "Reply message is required" 
      });
    }

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ 
        message: "Contact query not found" 
      });
    }

    // Update contact with admin reply
    contact.adminReply = {
      message: replyMessage,
      repliedAt: new Date(),
      repliedBy: adminId
    };
    contact.status = 'replied';
    await contact.save();

    // Send notification to user if they have an account
    if (contact.userId) {
      const notification = new Notification({
        userId: contact.userId,
        title: 'Reply to Your Contact Query',
        message: `Admin has replied to your contact query: "${replyMessage.substring(0, 50)}..."`,
        type: 'contact_reply',
        relatedId: contact._id,
        isRead: false
      });
      await notification.save();
    }

    // TODO: Send email notification to user
    // This would require email service integration

    res.status(200).json({ 
      message: "Reply sent successfully",
      contact: {
        _id: contact._id,
        status: contact.status,
        adminReply: contact.adminReply
      }
    });

  } catch (error) {
    console.error('Send admin reply error:', error);
    res.status(500).json({ 
      message: "Error sending reply", 
      error: error.message 
    });
  }
};

// Get contact by ID
export const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;

    const contact = await Contact.findById(contactId);
    if (!contact) {
      return res.status(404).json({ 
        message: "Contact query not found" 
      });
    }

    let userInfo = null;
    if (contact.userId) {
      const user = await Users.findById(contact.userId);
      if (user) {
        userInfo = {
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    }

    const contactWithUserInfo = {
      _id: contact._id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      message: contact.message,
      userId: contact.userId,
      userInfo,
      status: contact.status,
      adminReply: contact.adminReply,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt
    };

    res.status(200).json({ 
      message: "Contact retrieved successfully", 
      contact: contactWithUserInfo 
    });

  } catch (error) {
    console.error('Get contact by ID error:', error);
    res.status(500).json({ 
      message: "Error retrieving contact", 
      error: error.message 
    });
  }
};

// Update contact status
export const updateContactStatus = async (req, res) => {
  try {
    const { contactId } = req.params;
    const { status } = req.body;

    if (!['pending', 'replied', 'closed'].includes(status)) {
      return res.status(400).json({ 
        message: "Invalid status. Must be pending, replied, or closed" 
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      contactId,
      { status },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ 
        message: "Contact query not found" 
      });
    }

    res.status(200).json({ 
      message: "Contact status updated successfully",
      contact: {
        _id: contact._id,
        status: contact.status
      }
    });

  } catch (error) {
    console.error('Update contact status error:', error);
    res.status(500).json({ 
      message: "Error updating contact status", 
      error: error.message 
    });
  }
};

export default {
  createContact,
  getAllContacts,
  sendAdminReply,
  getContactById,
  updateContactStatus
}; 