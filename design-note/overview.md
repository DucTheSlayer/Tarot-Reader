# App Tarot - Tổng quan ứng dụng

## 1. Giới thiệu chung

- **Loại ứng dụng:** App mobile, màn hình dọc (portrait).
- **Nền tảng:** Web View, build bằng Capacitor.
- **Công nghệ:** Vue + TypeScript.
- **Mô tả:** Ứng dụng xem bài Tarot gồm 2 phần chức năng chính: **Tarot** và **Zodiac**.
- **Tài khoản:** Không yêu cầu đăng nhập, dùng ngay không cần tạo tài khoản.
- **Giới hạn sử dụng:** Không giới hạn số lần rút bài/ngày cho các chức năng (trừ Daily Tarot — xem quy tắc riêng bên dưới).
- **Phạm vi hiện tại (chưa làm ở bản đầu):** Lưu lịch sử xem lại, chia sẻ (share) kết quả ra mạng xã hội, lá bài ở trạng thái ngược (reversed).

## 2. Phần 1: Tarot

Người dùng có thể chọn các chức năng sau:

| Chức năng | Mô tả |
| --- | --- |
| **Daily Tarot** | Khi bấm vào sẽ hiển thị hình ảnh, tên, ý nghĩa và lời khuyên của lá bài trong ngày. Lá bài **cố định theo ngày** (mọi user cùng xem 1 lá), và **chỉ được xem 1 lần/ngày** — vào lại trong ngày sẽ hiển thị lại đúng lá đã xem, không cho rút mới. |
| **Yes or No** | Người dùng đưa ra câu hỏi (**không bắt buộc nhập**), bấm "Draw card", hệ thống rút 1 lá và hiển thị ý nghĩa của lá bài. |
| **Love Tarot** | Chọn ngữ cảnh rồi rút 3 lá theo **Bạn / Đối phương / Kết nối**, hiển thị ý nghĩa và thông điệp tổng hợp. |
| **Money Tarot** | Chọn ngữ cảnh rồi rút 3 lá theo **Hiện trạng / Cơ hội–Trở ngại / Hành động**, kèm diễn giải mang tính tham khảo. |
| **Yearly Tarot** | Rút 5 lá bài, mỗi lá gắn nhãn theo 1 khía cạnh cuộc sống: **Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe**. |
| **3 Card Spread** | Người dùng đưa ra câu hỏi, hệ thống hiển thị 3 lá bài tổng quát — **không gắn nhãn vị trí**. |

## 3. Phần 2: Zodiac

Chia làm 2 chức năng chính cho người dùng chọn:

| Chức năng | Mô tả |
| --- | --- |
| **Zodiac Origin** | Giới thiệu về nguồn gốc và thông tin của 12 cung hoàng đạo. |
| **Horoscope** | Người dùng **tự chọn** cung hoàng đạo (app không hỏi ngày sinh hay tự gợi ý) và khoảng thời gian (**Day / Week / Year**) để xem vận trình tương ứng. |

## 4. Tổng kết luồng chính

```
App (màn hình dọc, Web View + Capacitor, Vue + TypeScript)
│
├── Layout 1: Tarot
│   ├── Daily Tarot (1 lá/ngày, cố định cho mọi user)
│   ├── Yes or No (câu hỏi optional)
│   ├── Love Tarot (Bạn / Đối phương / Kết nối)
│   ├── Money Tarot (Hiện trạng / Cơ hội–Trở ngại / Hành động)
│   ├── Yearly Tarot (5 lá: Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe)
│   └── 3 Card Spread (3 lá, không nhãn)
│
└── Layout 2: Zodiac
    ├── Zodiac Origin (12 cung hoàng đạo)
    └── Horoscope (tự chọn cung, Day / Week / Year)
```

## 5. Quyết định đã chốt (Phase 0)

| Chủ đề | Quyết định |
| --- | --- |
| Horoscope data | **Nội dung tĩnh** — không dùng API bên thứ 3, không cần state loading/error (xem `screen.md` mục 4). |
| Daily Tarot (không backend) | **Deterministic theo ngày** — seed = ngày → cùng 1 lá cho mọi user; flag "đã xem" lưu localStorage `daily-{yyyy-mm-dd}`, reset qua ngày mới. |
| Love Tarot input | **Không có** ô nhập câu hỏi. |
| Tarot Home thumbnail | Chỉ hiển thị tile chức năng; không làm lộ lá Daily trước khi người dùng mở màn hình. |
| Bộ bài | **78 lá chuẩn** trong SQLite: 22 Major + 56 Minor. |
| Yearly Tarot layout | **Carousel ngang** (5 lá, tap vào lá xem chi tiết). |
| Horoscope UI | **Gộp chung 1 màn** — chọn cung + tab Day/Week/Year trên cùng màn. |

## 6. Tài liệu liên quan

- `db-plan.md` — kế hoạch chuyển dữ liệu lá Tarot từ TypeScript sang SQLite, workflow DB Browser, schema, repository, migration và kiểm thử Android/Web.
- `system-flow.md` — giải thích kiến trúc runtime, luồng dữ liệu/state, điều hướng, build Android và trạng thái triển khai thực tế của toàn hệ thống.
- `user-flow.md` — mô tả chi tiết luồng thao tác từng bước của user cho tất cả chức năng.
- `screen.md` — spec chi tiết từng màn hình (route, state, elements, edge case) và danh sách component dùng chung.
