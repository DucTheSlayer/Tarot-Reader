# App Tarot - User Flow

## 1. Luồng tổng quan (Main Layout)

Ứng dụng có 2 layout chính, truy cập từ màn Home:

```
Home
├── Tarot Home
└── Zodiac Home
```

- Người dùng mở app → vào **Home**.
- Từ Home chọn 1 trong 2 nhánh: **Tarot** hoặc **Zodiac**.
- Mỗi nhánh có 1 màn "Home" riêng (Tarot Home / Zodiac Home) liệt kê các chức năng con.
- Từ mọi màn con đều có đường quay lại Home tương ứng (Tarot Home / Zodiac Home) và về Home chính.

---

## 2. Tarot Flows

### 2.1. Daily Tarot Flow (Card of the Day)

1. User bấm vào **Card of the Day** từ Tarot Home.
2. App hiển thị lá bài Tarot của hôm nay (mặt úp hoặc dạng chờ).
3. User bấm **Read Tarot**.
4. App hiển thị ý nghĩa lá bài (tên, hình ảnh, ý nghĩa, lời khuyên).

**Quy tắc:**
- Lá bài **cố định theo ngày**, mọi user xem cùng 1 lá trong ngày đó (không random riêng theo từng user).
- Nếu user đã xem trong ngày, các lần vào lại sau đó sẽ hiển thị **lại đúng lá đã xem** (không cho rút lá mới cho tới khi sang ngày mới).

---

### 2.2. Yes or No Flow

1. User vào màn **Yes or No** từ Tarot Home.
2. User nhập câu hỏi vào ô input.
3. User bấm **Draw Card**.
4. App hiển thị animation rút bài (lật bài).
5. App hiển thị 1 lá bài đã rút kèm ý nghĩa (trả lời Yes/No dựa trên lá bài).
6. User chọn:
   - **Draw Again** → quay lại bước 2 (hoặc bước 3 nếu giữ nguyên câu hỏi).
   - **Back** → quay về Tarot Home.

**Quy tắc:** Câu hỏi ở bước 2 là **optional** — user có thể bỏ trống và bấm Draw Card luôn.

---

### 2.3. Love Tarot Flow (Past / Present / Future)

1. User vào màn **Love Tarot** từ Tarot Home.
2. User bấm **Draw Cards** (không cần nhập câu hỏi — đã chốt không có ô nhập).
3. App hiển thị animation rút 3 lá bài liên tiếp.
4. App hiển thị 3 lá bài theo vị trí: **Past / Present / Future**, mỗi lá kèm ý nghĩa riêng.
5. User có thể bấm vào từng lá để xem chi tiết ý nghĩa (nếu thiết kế dạng thu gọn/mở rộng).
6. User chọn:
   - **Draw Again** → quay lại bước 2.
   - **Back** → quay về Tarot Home.

---

### 2.4. Money Tarot Flow

1. User vào màn **Money Tarot** từ Tarot Home.
2. User bấm **Draw Cards**.
3. App hiển thị animation rút 3 lá bài.
4. App hiển thị 3 lá bài theo vị trí **Past / Present / Future** (gán nhãn giống Love Tarot), mỗi lá kèm ý nghĩa liên quan đến tài chính theo vị trí tương ứng.
5. User chọn:
   - **Draw Again** → quay lại bước 2.
   - **Back** → quay về Tarot Home.

---

### 2.5. Yearly Tarot Flow

1. User vào màn **Yearly Tarot** từ Tarot Home.
2. User bấm **Draw Cards**.
3. App hiển thị animation rút 5 lá bài liên tiếp.
4. App hiển thị 5 lá bài với vị trí được gán nhãn rõ ràng theo 5 khía cạnh cuộc sống: **Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe** *(đã chốt)*.
5. User có thể bấm vào từng lá để xem ý nghĩa chi tiết theo khía cạnh tương ứng.
6. User chọn:
   - **Draw Again** → quay lại bước 2.
   - **Back** → quay về Tarot Home.

---

### 2.6. 3 Card Spread Flow

1. User vào màn **3 Card Spread** từ Tarot Home.
2. User nhập câu hỏi tổng quát vào ô input.
3. User bấm **Draw Cards**.
4. App hiển thị animation rút 3 lá bài.
5. App hiển thị **3 lá bài không gán nhãn vị trí**, kèm ý nghĩa tổng quát theo từng lá (khác với Love/Money Tarot có nhãn Past/Present/Future).
6. User chọn:
   - **Draw Again** → quay lại bước 2.
   - **Back** → quay về Tarot Home.

---

## 3. Zodiac Flows

### 3.1. Zodiac Origin Flow

1. User vào màn **Zodiac Origin** từ Zodiac Home.
2. App hiển thị danh sách 12 cung hoàng đạo (dạng lưới/list).
3. User bấm chọn 1 cung hoàng đạo.
4. App hiển thị thông tin chi tiết: nguồn gốc, biểu tượng, ngày sinh tương ứng, nguyên tố (element), tính cách đặc trưng.
5. User bấm **Back** → quay về danh sách 12 cung (bước 2) hoặc về Zodiac Home.

---

### 3.2. Horoscope Flow

1. User vào màn **Horoscope** từ Zodiac Home.
2. User chọn 1 cung hoàng đạo trong 12 cung.
3. User chọn khoảng thời gian: **Day / Week / Year**.
4. App hiển thị nội dung vận trình tương ứng với cung + khoảng thời gian đã chọn.
5. User có thể:
   - Đổi khoảng thời gian khác (Day/Week/Year) → cập nhật lại nội dung (không cần chọn lại cung).
   - Đổi cung hoàng đạo khác → quay lại bước 2.
   - **Back** → quay về Zodiac Home.

**Quy tắc:** Cung hoàng đạo do **user tự chọn**, app không hỏi ngày sinh hay tự động gợi ý.

✅ Đã chốt: Nội dung Horoscope là **nội dung tĩnh/generate sẵn** (không dùng API bên thứ 3, không cần state loading/error).

---

## 4. Quyết định chung (đã chốt)

| Chủ đề | Quyết định |
| --- | --- |
| Tài khoản | **Không yêu cầu đăng nhập** — dùng app ngay, không cần tạo tài khoản. |
| Lịch sử | **Chưa cần** tính năng xem lại lịch sử các lần đã xem. |
| Ngày sinh | **Chưa cần** — không hỏi ngày sinh, không tự gợi ý cung hoàng đạo (user tự chọn, xem mục 3.2). |
| Chia sẻ | **Chưa cần** tính năng Share kết quả ra mạng xã hội (giai đoạn này). |
| Reversed card | **Chưa cần** — các lá bài luôn ở trạng thái xuôi (upright), chưa hỗ trợ reversed. |
| Giới hạn sử dụng | **Không giới hạn** — Draw Again không giới hạn số lần cho mọi chức năng. |
| Yearly Tarot labels | **Đã chốt**: Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe. |
| Horoscope data | **Nội dung tĩnh** — không dùng API bên thứ 3, không cần state loading/error. |
| Daily Tarot (không backend) | **Deterministic theo ngày** — seed = ngày → cùng 1 lá cho mọi user; flag "đã xem" lưu localStorage `daily-{yyyy-mm-dd}`, reset qua ngày mới. |
| Love Tarot input | **Không có** ô nhập câu hỏi. |
| Tarot Home thumbnail | **Có** hiển thị thumbnail Card of the Day nếu đã xem hôm nay. |
| Bộ bài | **78 lá chuẩn** trong SQLite: 22 Major + 56 Minor. |
| Yearly Tarot layout | **Carousel ngang** (5 lá, tap vào lá xem chi tiết). |
| Horoscope UI | **Gộp chung 1 màn** — chọn cung + tab Day/Week/Year trên cùng màn. |

## 5. Câu hỏi còn mở

Không còn câu hỏi mở — tất cả quyết định đã chốt ở mục 4.
