const { google } = require('googleapis');
const Channel = require('../models/Channel');

const youtube = google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
});

exports.getDataByUrl = async (req, res) => {
    try {
        let { url } = req.body; 
        if (!url) return res.status(400).send('Vui lòng nhập URL!');

        url = url.trim(); 

        // 1. Cấu hình tham số gọi API
        let params = { part: 'snippet,statistics' };

        // 2. Logic phân loại Link 
        if (url.includes('@')) {
            // Case 1: Dạng Handle (VD: https://youtube.com/@ABC)
            const handle = url.split('@')[1].split('/')[0];
            params.forHandle = '@' + handle; 
        } 
        else if (url.includes('channel/')) {
            // Case 2: Dạng Channel ID (VD: https://youtube.com/channel/UC...)
            params.id = url.split('channel/')[1].split('/')[0];
        } 
        else {
            // Case 3: Người dùng nhập thẳng ID 
            params.id = url;
        }

        // 3. Gọi YouTube API
        console.log("Đang tìm kiếm với params:", params); // Log để debug
        const response = await youtube.channels.list(params);

        // 4. Kiểm tra kết quả
        if (!response.data.items || response.data.items.length === 0) {
            return res.status(404).send(`
                <h3>Không tìm thấy kênh! 😔</h3>
                <p>YouTube không trả về dữ liệu cho link này.</p>
                <p>Gợi ý: Hãy thử nhập Link dạng <b>channel/UC...</b> nếu link @ bị lỗi.</p>
                <a href="/">Thử lại</a>
            `);
        }

        const dataItem = response.data.items[0];

        // 5. Lưu vào Database
        const savedDb = await Channel.findOneAndUpdate(
            { channelId: dataItem.id },
            {
                title: dataItem.snippet.title,
                data: dataItem 
            },
            { upsert: true, new: true }
        );

        // 6. Đóng gói dữ liệu gửi về Frontend
        const info = savedDb.data;
        
        // Fix lỗi số liệu có thể bị ẩn 
        const subCount = info.statistics.hiddenSubscriberCount ? "Đã ẩn" : info.statistics.subscriberCount;

        const urlParams = new URLSearchParams({
            name: info.snippet.title,
            avatar: info.snippet.thumbnails.medium.url,
            subs: subCount,
            views: info.statistics.viewCount,
            videos: info.statistics.videoCount,
            id: savedDb.channelId
        });

        // 7. Chuyển hướng
        res.redirect(`/success.html?${urlParams.toString()}`);

    } catch (err) {
        console.error("Lỗi Server:", err);
        return res.status(500).send(`<h3>Lỗi Server!</h3><p>Chi tiết: ${err.message}</p><a href="/">Quay lại</a>`);
    }
};