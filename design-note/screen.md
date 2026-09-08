# App Tarot - Screens Spec

> File này mô tả chi tiết từng màn hình (route, state, elements, edge case) dựa trên `user-flow.md`. Quy ước state chung: `initial` (mới vào) → `loading`/`drawing` (đang xử lý/animation) → `result` (đã có kết quả) → `error` (lỗi, vd mất mạng nếu Horoscope dùng API).

---

## 0. Home Screens

### 0.1. Screen: Home

- **Route:** `/`
- **States:** `default`
- **Elements:**
  - Logo/App title
  - 2 lựa chọn lớn (card/button): **Tarot** | **Zodiac**
- **Navigation:** Tarot → `/tarot`, Zodiac → `/zodiac`

### 0.2. Screen: Tarot Home

- **Route:** `/tarot`
- **States:** `default`
- **Elements:**
  - Back button → `/`
  - Danh sách 6 chức năng (dạng grid/list card, có icon + tên):
    Daily Tarot, Yes or No, Love Tarot, Money Tarot, Yearly Tarot, 3 Card Spread
  - Thumbnail preview lá Card of the Day ngay trên Tarot Home nếu đã xem hôm nay *(đã chốt làm)*

### 0.3. Screen: Zodiac Home

- **Route:** `/zodiac`
- **States:** `default`
- **Elements:**
  - Back button → `/`
  - 2 lựa chọn: **Zodiac Origin** | **Horoscope**

---

## 1. Tarot Screens

### 1.1. Screen: Daily Tarot

- **Route:** `/tarot/daily`
- **States:**
  - `initial` — chưa xem hôm nay: lá bài úp, hiển thị nút để lật/xem
  - `revealed` — đã xem hôm nay (dù mới lật hay quay lại xem): hiển thị luôn kết quả, KHÔNG cho rút lại
- **Elements (initial):**
  - Card image (mặt úp)
  - CTA: **Read Tarot**
- **Elements (revealed):**
  - Card image (mặt ngửa)
  - Card name
  - Meaning text
  - Advice text
  - Back button → `/tarot`
  - (Không có nút Draw Again / Draw New — theo quy tắc cố định 1 lá/ngày)
- **Edge case:**
  - User vào lại nhiều lần trong ngày → luôn render thẳng state `revealed` với đúng lá đã lưu, bỏ qua state `initial`.
  - Ngày mới bắt đầu (qua 0h) → reset về `initial` với lá bài mới của ngày đó.

---

### 1.2. Screen: Yes or No

- **Route:** `/tarot/yes-no`
- **States:** `initial` → `drawing` → `result`
- **Elements (initial):**
  - Input text: nhập câu hỏi (placeholder gợi ý, có label "optional")
  - CTA: **Draw Card**
- **Elements (drawing):**
  - Animation lật bài (loading ngắn)
- **Elements (result):**
  - Card image (upright)
  - Card name
  - Ý nghĩa trả lời Yes/No dựa trên lá bài
  - Câu hỏi user đã nhập (nếu có) hiển thị lại phía trên kết quả
  - CTA: **Draw Again** (quay lại `initial`, giữ nguyên câu hỏi đã nhập hoặc cho sửa lại), **Back** → `/tarot`
- **Edge case:** User bỏ trống input → vẫn cho bấm Draw Card bình thường (câu hỏi optional).

---

### 1.3. Screen: Love Tarot

- **Route:** `/tarot/love`
- **States:** `initial` → `drawing` → `result`
- **Elements (initial):**
  - Mô tả ngắn về Love Tarot
  - CTA: **Draw Cards**
- **Elements (drawing):** Animation rút 3 lá liên tiếp
- **Elements (result):**
  - 3 card slot, mỗi slot có nhãn: **Past / Present / Future**
  - Mỗi card: image, name, ý nghĩa (theo vị trí)
  - Tap vào 1 card → mở rộng/modal xem ý nghĩa chi tiết hơn (nếu content dài)
  - CTA: **Draw Again**, **Back** → `/tarot`

---

### 1.4. Screen: Money Tarot

- **Route:** `/tarot/money`
- **States:** `initial` → `drawing` → `result`
- **Elements:** Tương tự Love Tarot, nhưng nhãn vị trí và nội dung ý nghĩa xoay quanh chủ đề tài chính:
  - 3 card slot: **Past / Present / Future**
  - Mỗi card: image, name, ý nghĩa (tài chính, theo vị trí)
  - CTA: **Draw Again**, **Back** → `/tarot`

---

### 1.5. Screen: Yearly Tarot

- **Route:** `/tarot/yearly`
- **States:** `initial` → `drawing` → `result`
- **Elements (initial):**
  - Mô tả ngắn về Yearly Tarot (5 lá cho 5 khía cạnh trong năm)
  - CTA: **Draw Cards**
- **Elements (drawing):** Animation rút 5 lá liên tiếp
- **Elements (result):**
  - 5 card slot với nhãn: **Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe**
  - Layout: do 5 lá khó vừa 1 hàng ngang trên mobile portrait → dùng **carousel/scroll ngang** *(đã chốt)*
  - Tap vào 1 card → mở rộng xem ý nghĩa chi tiết theo khía cạnh
  - CTA: **Draw Again**, **Back** → `/tarot`

---

### 1.6. Screen: 3 Card Spread

- **Route:** `/tarot/3-card-spread`
- **States:** `initial` → `drawing` → `result`
- **Elements (initial):**
  - Input text: nhập câu hỏi tổng quát
  - CTA: **Draw Cards**
- **Elements (drawing):** Animation rút 3 lá
- **Elements (result):**
  - 3 card slot **không gắn nhãn vị trí**
  - Mỗi card: image, name, ý nghĩa tổng quát
  - Câu hỏi đã nhập hiển thị lại phía trên
  - CTA: **Draw Again**, **Back** → `/tarot`

### 1.7. Screen: Tarot Library

- **Routes:** `/tarot/library` và `/tarot/library/:cardId`
- **States:** danh sách → tìm kiếm/lọc → chi tiết; route `cardId` sai có empty state và CTA quay lại.
- **Elements (list):**
  - Search theo tên hoặc meaning.
  - Filter All / Major / Wands / Cups / Swords / Pentacles.
  - Grid ảnh, category và tên của đủ 78 lá lấy từ SQLite.
- **Elements (detail):**
  - Ảnh, tên, arcana/suit/rank.
  - Meaning, Guidance và Yes/No energy.
  - Back → `/tarot/library`.

---

## 2. Zodiac Screens

### 2.1. Screen: Zodiac Origin — List

- **Route:** `/zodiac/origin`
- **States:** `default`
- **Elements:**
  - Back button → `/zodiac`
  - Grid 12 cung hoàng đạo (icon/symbol + tên + khoảng ngày sinh)
- **Navigation:** Tap 1 cung → `/zodiac/origin/:signId`

### 2.2. Screen: Zodiac Origin — Detail

- **Route:** `/zodiac/origin/:signId`
- **States:** `default`
- **Elements:**
  - Back button → `/zodiac/origin`
  - Tên cung + biểu tượng
  - Khoảng ngày sinh
  - Nguyên tố (element: Fire/Earth/Air/Water)
  - Nội dung nguồn gốc (origin story)
  - Tính cách đặc trưng (traits)

---

### 2.3. Screen: Horoscope

- **Route:** `/zodiac/horoscope`
- **States:** `select-sign` → `select-period` → `result` (gộp `select-sign`/`select-period` trên cùng 1 màn — đã chốt: chọn cung rồi chọn period ngay trên màn đó)
- **Elements (select-sign):**
  - Back button → `/zodiac`
  - Grid/list chọn 1 trong 12 cung
- **Elements (select-period + result):**
  - Tab hoặc segmented control: **Day / Week / Year**
  - Nội dung horoscope theo cung + period đã chọn
  - Nút đổi cung khác (quay lại `select-sign`, không mất period đã chọn)
  - Back → `/zodiac`
- **Edge case:**
  - Đổi tab Day/Week/Year khi đang xem → chỉ load lại nội dung, giữ nguyên cung đã chọn.
  - ✅ Horoscope dùng **nội dung tĩnh** (đã chốt) → không cần state `loading`/`error` cho bước lấy nội dung.

---

## 3. Component dùng chung (Shared Components)

Ghi chú để tránh trùng lặp khi build — các phần sau xuất hiện ở nhiều screen, nên tách component riêng:

| Component | Dùng ở |
| --- | --- |
| `CardFlipAnimation` | Daily Tarot, Yes or No, Love/Money/Yearly Tarot, 3 Card Spread |
| `CardResultItem` (image + name + meaning) | Tất cả các flow rút bài |
| `CardSlotLabel` (nhãn vị trí: Past/Present/Future...) | Love Tarot, Money Tarot, Yearly Tarot |
| `QuestionInput` (ô nhập câu hỏi optional) | Yes or No, 3 Card Spread |
| `DrawAgainBar` (Draw Again + Back) | Yes or No, Love/Money/Yearly Tarot, 3 Card Spread |
| `ZodiacSignPicker` (grid 12 cung) | Zodiac Origin List, Horoscope |
| `PeriodTabs` (Day/Week/Year) | Horoscope |

---

## 4. Quyết định đã chốt (kế thừa từ user-flow.md)

| Chủ đề | Quyết định |
| --- | --- |
| Horoscope data | **Nội dung tĩnh** — không cần state `loading`/`error`. |
| Yearly Tarot layout | **Carousel ngang** (5 lá, tap vào lá xem chi tiết). |
| Horoscope UI | **Gộp chung 1 màn** — chọn cung rồi tab Day/Week/Year trên cùng màn. |
