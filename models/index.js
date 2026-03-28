const { Sequelize } = require('sequelize');
const config = require('../config/database');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    dialectOptions: dbConfig.dialectOptions,
    logging: dbConfig.logging,
  }
);

// Load models
const User = require('./User')(sequelize);
const TailorProfile = require('./TailorProfile')(sequelize);
const Otp = require('./Otp')(sequelize);
const Order = require('./Order')(sequelize);
const OrderImage = require('./OrderImage')(sequelize);
const Quotation = require('./Quotation')(sequelize);
const Payment = require('./Payment')(sequelize);
const Escrow = require('./Escrow')(sequelize);
const Complaint = require('./Complaint')(sequelize);
const ComplaintEvidence = require('./ComplaintEvidence')(sequelize);
const Rating = require('./Rating')(sequelize);
const AdminBankDetail = require('./AdminBankDetail')(sequelize);
const Notification = require('./Notification')(sequelize);
const UserSetting = require('./UserSetting')(sequelize);
const Message = require('./Message')(sequelize);

// ─── Associations ────────────────────────────────────────────────────────────

// User <-> TailorProfile
User.hasOne(TailorProfile, { foreignKey: 'userId', as: 'tailorProfile' });
TailorProfile.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Otp
User.hasMany(Otp, { foreignKey: 'userId' });
Otp.belongsTo(User, { foreignKey: 'userId' });

// User <-> Order (customer)
User.hasMany(Order, { foreignKey: 'customerId', as: 'customerOrders' });
Order.belongsTo(User, { foreignKey: 'customerId', as: 'customer' });

// User <-> Order (tailor)
User.hasMany(Order, { foreignKey: 'tailorId', as: 'tailorOrders' });
Order.belongsTo(User, { foreignKey: 'tailorId', as: 'tailor' });

// Order <-> OrderImage
Order.hasMany(OrderImage, { foreignKey: 'orderId', as: 'images' });
OrderImage.belongsTo(Order, { foreignKey: 'orderId' });

// Order <-> Quotation
Order.hasMany(Quotation, { foreignKey: 'orderId', as: 'quotations' });
Quotation.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Quotation (tailor)
User.hasMany(Quotation, { foreignKey: 'tailorId', as: 'quotations' });
Quotation.belongsTo(User, { foreignKey: 'tailorId', as: 'tailor' });

// Order <-> Payment
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Payment (customer)
User.hasMany(Payment, { foreignKey: 'customerId', as: 'payments' });
Payment.belongsTo(User, { foreignKey: 'customerId', as: 'payer' });

// User <-> Payment (verifier)
Payment.belongsTo(User, { foreignKey: 'verifiedBy', as: 'verifier' });

// Order <-> Escrow
Order.hasOne(Escrow, { foreignKey: 'orderId', as: 'escrow' });
Escrow.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Payment <-> Escrow
Payment.hasOne(Escrow, { foreignKey: 'paymentId', as: 'escrow' });
Escrow.belongsTo(Payment, { foreignKey: 'paymentId', as: 'payment' });

// Order <-> Complaint
Order.hasMany(Complaint, { foreignKey: 'orderId', as: 'complaints' });
Complaint.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Complaint (from)
User.hasMany(Complaint, { foreignKey: 'fromUserId', as: 'filedComplaints' });
Complaint.belongsTo(User, { foreignKey: 'fromUserId', as: 'complainant' });

// User <-> Complaint (against)
Complaint.belongsTo(User, { foreignKey: 'againstUserId', as: 'accused' });

// Complaint <-> ComplaintEvidence
Complaint.hasMany(ComplaintEvidence, { foreignKey: 'complaintId', as: 'evidences' });
ComplaintEvidence.belongsTo(Complaint, { foreignKey: 'complaintId' });

// Order <-> Rating
Order.hasOne(Rating, { foreignKey: 'orderId', as: 'rating' });
Rating.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Rating (customer)
User.hasMany(Rating, { foreignKey: 'customerId', as: 'givenRatings' });
Rating.belongsTo(User, { foreignKey: 'customerId', as: 'reviewer' });

// User <-> Rating (tailor)
User.hasMany(Rating, { foreignKey: 'tailorId', as: 'receivedRatings' });
Rating.belongsTo(User, { foreignKey: 'tailorId', as: 'reviewedTailor' });

// User <-> Notification
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> UserSetting
User.hasOne(UserSetting, { foreignKey: 'userId', as: 'userSetting' });
UserSetting.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order <-> Message
Order.hasMany(Message, { foreignKey: 'orderId', as: 'messages' });
Message.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User <-> Message (sender/receiver)
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });

User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

module.exports = {
  sequelize,
  Sequelize,
  User,
  TailorProfile,
  Otp,
  Order,
  OrderImage,
  Quotation,
  Payment,
  Escrow,
  Complaint,
  ComplaintEvidence,
  Rating,
  AdminBankDetail,
  Notification,
  UserSetting,
  Message,
};
