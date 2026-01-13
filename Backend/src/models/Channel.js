const mongoose = require('mongoose');

const mongooseSchema = new mongoose.Schema({
  // Thông tin cơ bản
  channelId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  title: { type: String }, 
  ownerEmail: { type: String }, 
  
  // Khai báo động
  //Tuỳ thuộc vào user muốn trả ra gì
  data: {
    type: mongoose.Schema.Types.Mixed 
  },

  //thời gian crawl
  crawledAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Channel', mongooseSchema);