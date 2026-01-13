const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config(); 

const app = express();

// 1. Cấu hình Middleware 
app.use(cors());
app.use(express.urlencoded({ extended: true })); 

app.use(express.json()); 

// 2. FE 
app.use(express.static(path.join(__dirname, '../Frontend')));


// 3. Kết nối Database
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ MongoDB Error:', err));

// 4. Khai báo Routes 
app.use('/api', require('./src/routes/routes.js'));



// 5. Route Trang chủ
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});


// 6. Khởi động Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại: http://localhost:${PORT}`);
});