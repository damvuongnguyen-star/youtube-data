const { google } = require('googleapis');
const Channel = require('../models/Channel');

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.readonly',
  'https://www.googleapis.com/auth/userinfo.email'
];

exports.loginGoogle = (req, res) => {
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' 
  });
  res.redirect(url);
};

exports.GoogleCallBack = async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ message: 'Không có code!' });

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    
    // 1. Lấy thông tin kênh
    const response = await youtube.channels.list({ part: 'snippet,statistics', mine: true });

    if (!response.data.items || response.data.items.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy channel này' });
    }
    const dataItem = response.data.items[0];

    // 2. Lấy Email
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();
    const userEmail = userInfo.data.email;

    // 3. Lưu vào DB
    const savedDb = await Channel.findOneAndUpdate(
      { channelId: dataItem.id },
      {
        title: dataItem.snippet.title,
        ownerEmail: userEmail, 
        data: dataItem, 
        crawledAt: new Date()
      },
      { upsert: true, new: true }
    );

    // 4. Chuẩn bị dữ liệu để Redirect 
    const info = savedDb.data; 
    
    const params = new URLSearchParams({
        name: info.snippet.title,
        avatar: info.snippet.thumbnails.medium.url,
        subs: info.statistics.subscriberCount,
        views: info.statistics.viewCount,
        videos: info.statistics.videoCount,
        id: savedDb.channelId,
        email: savedDb.ownerEmail || "Ẩn danh" 
    });

    // Frontend
    res.redirect(`/success.html?${params.toString()}`);

  } catch (err) {
    console.error("Lỗi Login:", err);
    return res.status(500).json({ message: 'Login bị lỗi', error: err.message });
  }
};