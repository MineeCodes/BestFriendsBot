# BestFriendsBot

> For English-speaking people: Please click [here](./readme-eng.md) to read the English version.

Đây là một dự án dành cho bot mà tui và T.H làm nên, gọi là Best Friends Bot.
Bot hoàn toàn tiếng Việt nma chỉ có lệnh là tiếng Anh

# Cách sử dụng

1. Tạo bot tại [đây](https://discord.dev) và copy token với ID "ứng dụng".
2. Tạo cơ sở dữ liệu tại MongoDB Atlas hoặc tự host (tự tìm hiểu)
3. Hoàn thành config.json theo dạng dưới [đây](#config.json)

# config.json

| Tên | Loại | Mô tả |
| --- | ---- | ----- |
| token | String | Token discord vừa lấy tại trang web [trên](#cách-sử-dụng) |
| app_id | String | ID vừa nhận được tại trang web cùng với token |
| dev_server | String | ID của server (máy chủ) beta (nếu có) |
| db_uri | String | URL của cơ sở dữ liệu vừa tạo trên với dạng `mongodb+srv://tên:mật_khẩu@phần_còn_lại` (bắt buộc) |
| curse_file | String | Đường dẫn đến file (nội bộ, lưu trong máy) để spam chửi lộn |
| cron_nhay | String | Chửi tục theo thời gian theo dạng cronjob, để trống để bỏ qua hoặc không spam |

# Credits

Theo đây thì mình xin cảm ơn:
- T.H. vì đã ra ý tưởng làm bot
- tui vì tui làm bot =)))