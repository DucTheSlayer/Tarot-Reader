# App Tarot - Kế hoạch triển khai (Implementation Plan)

> File này lập kế hoạch giao diện và các bước làm tiếp dựa trên `overview.md`, `user-flow.md`, `screen.md`.
> Mọi route/state/component tham chiếu theo `screen.md`.
> Đặc tả Love/Money và luồng Daily đã được đồng bộ với tài liệu tổng quan; code hiện tại là nguồn kiểm chứng cuối cùng khi chạy checklist beta.

---

## 0. Quyết định đã chốt (Phase 0) — theo gợi ý mặc định

| # | Chủ đề | Quyết định |
| --- | --- | --- |
| 1 | **Daily Tarot** (không đăng nhập/không backend) | **Deterministic theo ngày** — seed = ngày → cùng ngày luôn có cùng 1 lá; lần đầu hiện lá úp để user Reveal, sau khi đã xem thì các lần mở lại trong ngày hiện luôn lá đó; không có Draw Again |
| 2 | **Horoscope data** | **Nội dung tĩnh/generate sẵn** — không dùng API bên thứ 3, không cần state `loading`/`error`, app hoạt động offline |
| 3 | **Love Tarot input** | **Không có** ô nhập câu hỏi (khớp `screen.md` 1.3) |
| 4 | **Card of the Day trên Tarot Home** | Chỉ hiển thị tile chức năng bình thường; không lộ thumbnail/tên lá trước khi user mở màn Daily |
| 5 | **Bộ bài** | **78 lá Tarot chuẩn trong SQLite**: 22 Major + 56 Minor |
| 6 | **Yearly Tarot layout** | **Carousel ngang** (5 lá, tap vào lá xem chi tiết) |
| 7 | **Horoscope UI** | **Gộp chung 1 màn** — chọn cung + tab Day/Week/Year trên cùng màn |
| 8 | **Love Tarot spread** | **Bạn / Đối phương / Kết nối** — bố cục tam giác, thiên về cảm xúc và câu chuyện của mối quan hệ; không dùng Past/Present/Future |
| 9 | **Money Tarot spread** | **Hiện trạng / Cơ hội–Trở ngại / Hành động** — bố cục tiến trình, thiên về thông tin thực tế và bước tiếp theo; không dùng Past/Present/Future |
| 10 | **Ngữ cảnh Love/Money** | Không dùng ô nhập tự do; chọn nhanh bằng chip trước khi rút: Love = Độc thân/Đang tìm hiểu/Trong mối quan hệ, Money = Tài chính chung/Thu nhập–Công việc/Chi tiêu |
| 11 | **Animation Love/Money** | Dùng chung engine lật bài nhưng có `variant`: Love hội tụ mềm từ hai phía, Money chia bài theo tiến trình; tổng thời gian mục tiêu 2–3 giây và hỗ trợ `prefers-reduced-motion` |

---

## 1. Phase 1 — Khởi tạo dự án

1. Khởi tạo **Vue 3 + TypeScript + Vite** (SPA).
2. Cài **Vue Router** với đúng routes trong `screen.md`.
3. Cài **Capacitor** (nền Android/iOS), config webview mobile, portrait lock.
4. Thiết lập theme nền tảng:
   - Màn hình dọc (portrait), mobile-first.
   - Palette tối "mystic" (tím/đen/vàng gold) cho tarot, palette riêng nhẹ nhàng cho zodiac.
   - Biến thể Love dùng tím/hồng trầm; Money dùng navy/vàng đồng hoặc xanh ngọc đậm. Không dùng hiệu ứng tiền bay/đồng xu rơi để tránh cảm giác game/casino.
   - Typography, spacing, radius dùng chung (design tokens).
5. Cấu trúc thư mục đề xuất:

```
src/
├── router/            # routes theo screen.md
├── data/              # card deck, zodiac data, horoscope content, daily seed logic
├── composables/       # useDrawCards, useHoroscope và state dùng chung
├── components/
│   ├── common/        # shared components (mục 3 bên dưới)
│   └── layout/        # header/back, app shell
├── views/
│   ├── home/          # Home, TarotHome, ZodiacHome
│   ├── tarot/         # DailyTarot, YesNo, Love, Money, Yearly, ThreeCardSpread
│   └── zodiac/        # OriginList, OriginDetail, Horoscope
└── styles/            # tokens + global
```

---

## 2. Phase 2 — Data layer

1. **Card deck** (mục tiêu 78 lá — đã chốt):
   - Mỗi lá: `id`, `name`, `image`, `meaning` (upright), `advice`, `yesNo` — theo format cần dùng ở Yes or No.
   - **Đề xuất Yes/No:** chuẩn hóa `yesNo` thành 4 mức `yes | no | maybe | uncertain` và có `yesNoMeaning` ngắn riêng cho từng lá; không suy diễn đáp án chỉ từ meaning tổng quát.
   - Runtime hiện đọc SQLite đủ 78 lá qua repository/card store. `src/data/cards.ts` chỉ còn làm dữ liệu legacy để kiểm tra parity 22 Major.
   - 56 Minor Arcana gồm Wands, Cups, Swords và Pentacles, mỗi suit 14 lá; schema, seed, ảnh SVG và workflow DB Browser được đặc tả trong `db-plan.md` và `database/README.md`.
2. **Zodiac data** (SQLite v2):
   - 12 cung: `signId`, `name`, `symbol`, `dateRange`, `element`, `origin`, `traits`, strengths/challenges và compatibility.
   - Runtime đọc qua `zodiacRepository`/`zodiacStore`; type nằm tại `src/types/zodiac.ts`.
3. **Horoscope content** (nội dung tĩnh — đã chốt):
   - Bảng `horoscope_readings` có đủ 36 row theo `signId` × period (`day`/`week`/`year`).
4. **Daily Tarot logic**:
   - `getDailyCard(dateKey)` dùng deterministic hash của ngày local `yyyy-mm-dd` và chọn trong đủ 78 lá đã sort theo `deck_order`.
   - Khi user mở `/tarot/daily`, app tính sẵn lá của ngày hiện tại và hiển thị mặt úp.
   - Nút Reveal chỉ lật mặt lá đã tính sẵn; không random lại.
   - Lưu duy nhất `dateKey` đã reveal ở `localStorage`. Nếu key khớp ngày hiện tại thì mở màn hình sẽ hiển thị luôn mặt lá và nội dung; sang ngày mới key không còn khớp nên trở lại lá úp. Không lưu lịch sử hay dữ liệu card.
5. **Love/Money contextual logic**:
   - File `src/data/spreadReadings.ts` khai báo context options, slot labels và helper diễn giải theo domain/vị trí.
   - Type riêng cho ngữ cảnh: `LoveContext = single | exploring | relationship`; `MoneyContext = general | incomeCareer | spending`.
   - Nội dung theo vị trí được dựng từ `meaning`/`advice` gốc của lá kết hợp câu dẫn theo domain và context, tránh nhân bản toàn bộ card deck.
   - Context chip chỉ thay đổi cách diễn giải và phần tổng hợp; không làm thay đổi xác suất rút lá.
   - `buildLoveSummary(cards, context)` tạo **Thông điệp cho mối quan hệ** từ 3 lá.
   - `buildMoneySummary(cards, context)` tạo 3 phần **Cơ hội / Điều cần thận trọng / Bước tiếp theo**.
   - Toàn bộ nội dung được lưu/generate sẵn trong app, không gọi API và không đưa ra cam kết chắc chắn về tình cảm hoặc tài chính.

---

## 3. Phase 3 — Shared components (theo `screen.md` mục 3)

| Component | Nội dung | Dùng ở |
| --- | --- | --- |
| `CardDrawAnimation` | Engine animation dùng chung; các variant dự kiến gồm `default/yes-no/love/money/open-question/yearly`, khóa tương tác khi đang chạy và có reduced-motion fallback | Các flow có thao tác rút bài; Daily không dùng |
| `CardResultItem` | Image + name + meaning; nhận variant để đổi accent theo domain | Tất cả flow rút bài |
| `CardSlotLabel` | Nhãn vị trí theo spread: Love, Money hoặc khía cạnh Yearly | Love, Money, Yearly |
| `QuestionInput` | Ô nhập câu hỏi optional | Yes or No, 3 Card Spread |
| `DrawAgainBar` | Draw Again + Back | Yes or No, Love/Money/Yearly, 3 Card Spread |
| `ZodiacSignPicker` | Grid 12 cung | Zodiac Origin List, Horoscope |
| `PeriodTabs` | Tab Day/Week/Year | Horoscope |
| `ContextChipGroup` | Nhóm lựa chọn một ngữ cảnh, hỗ trợ keyboard/focus và trạng thái selected | Love, Money |
| `SpreadSummary` | Khối tổng hợp 3 lá, hiển thị cấu trúc khác nhau theo `love`/`money` | Love, Money |

### 3.1. Quy ước animation Love/Money

- Chỉ animate `transform` và `opacity` để giữ hiệu năng tốt trên webview; không khóa UI quá 3 giây.
- **Love variant**:
  1. Lá **Bạn** trượt nhẹ từ trái vào vị trí trên-trái.
  2. Lá **Đối phương** trượt nhẹ từ phải vào vị trí trên-phải.
  3. Lá **Kết nối** đi lên vị trí giữa phía dưới, tạo bố cục tam giác.
  4. Lật tuần tự 3 lá; sau lá cuối, hiện đường sáng mảnh nối ba vị trí và glow tím/hồng nhẹ.
- **Money variant**:
  1. Ba lá được deal lần lượt từ chồng bài vào bố cục tiến trình **Hiện trạng → Cơ hội–Trở ngại → Hành động**.
  2. Mỗi lá có gold flash ngắn khi đáp xuống; sau lá cuối, đường tiến trình chạy đến vị trí **Hành động**.
  3. Không dùng animation đồng xu, tiền bay hoặc hiệu ứng ăn mừng quá mạnh.
- Với `prefers-reduced-motion: reduce`: bỏ chuyển động trượt, glow và đường chạy; dùng fade ngắn rồi hiện kết quả đầy đủ.

### 3.2. Animation cho 3 Card Spread/Yearly Tarot — đã triển khai

- Mở rộng `CardDrawAnimation` bằng `variant="open-question"` và `variant="yearly"`; vẫn dùng chung core chia/lật bài, timer cleanup và reduced-motion.
- **3 Card Spread — Focus & Reveal**:
  1. Sau khi bấm **Draw Cards**, câu hỏi thu gọn và chuyển lên phía trên như một quote để user giữ trọng tâm.
  2. Bộ bài pulse/glow nhẹ một nhịp, sau đó 3 lá úp được deal vào giữa màn hình với góc lệch rất nhỏ; không hiện nhãn hay hàm ý vị trí.
  3. User chủ động tap từng lá để lật theo thứ tự bất kỳ. Mỗi lá chỉ lật một lần; card đã mở có viền sáng nhẹ để phân biệt.
  4. Sau khi lá cuối được mở, ba lá tự căn thẳng và khối **Combined Message** fade lên bên dưới.
  5. Có nút phụ **Reveal All** để tránh bắt buộc user phải tap ba lần; nút này lật tuần tự nhanh các lá còn lại.
- **Yearly Tarot — Constellation Journey**:
  1. Năm lá bay ra theo một cung tròn ngắn, sau đó thu về thành chồng carousel; stagger khoảng 140–180 ms/lá để tổng animation không quá 3 giây.
  2. Lá **Tổng quan** vào giữa và lật trước; bốn lá còn lại hé một phần ở hai cạnh để gợi ý có thể vuốt ngang.
  3. Khi user chuyển card, đường sáng/constellation ở progress indicator chạy sang mốc tiếp theo; card đang active có scale/glow rất nhẹ.
  4. Không auto-scroll carousel sau animation để user có toàn quyền kiểm soát và đủ thời gian đọc.
- Với `prefers-reduced-motion: reduce`: đặt các lá thẳng vào vị trí, bỏ pulse/fly/scale/đường chạy; dùng fade 120 ms và giữ đầy đủ thao tác tap/swipe.

### 3.3. Animation cho Yes or No — đã triển khai

- **Yes or No — Single Verdict**:
  1. Sau khi bấm **Draw Card**, input/câu hỏi thu gọn thành quote ở đầu màn hình; bộ bài gom lại và một lá đi thẳng lên trung tâm.
  2. Lá dừng khoảng 180–240 ms để tạo nhịp, sau đó flip một lần; không dùng spinner vì dữ liệu có sẵn và không có thao tác loading thật.
  3. Khi mặt bài hiện xong, verdict **YES / NO / MAYBE / UNCLEAR** xuất hiện sau card bằng vòng sáng/radial glow ngắn rồi phần giải thích fade lên.
  4. Màu verdict: xanh ngọc = Yes, đỏ san hô = No, vàng = Maybe, tím bạc = Unclear; luôn có text/icon, không dùng màu làm tín hiệu duy nhất.
  5. Tổng thời gian mục tiêu 1.4–1.8 giây; khóa Draw Card trong animation và cleanup timer nếu user bấm Back.
- Với `prefers-reduced-motion: reduce`: bỏ chuyển động nâng/flip và radial glow; hiện thẳng card rồi announce verdict.

---

## 4. Phase 4 — Screens (thứ tự làm đề xuất)

Làm theo thứ tự dễ → khó để chuẩn hóa pattern trước:

1. **Home** `/` → chọn Tarot / Zodiac.
2. **Tarot Home** `/tarot` → grid 6 chức năng; Card of the Day dùng tile bình thường và chỉ lộ kết quả sau khi mở route.
3. **Yes or No** `/tarot/yes-no` — **đã triển khai theo đặc tả**:
   - **Vai trò sản phẩm:** đưa ra một verdict nhanh cho câu hỏi đóng, khác với 3 Card Spread dành cho câu hỏi mở và nội dung suy ngẫm dài hơn.
   - **State:** `initial` → `drawing` → `result`.
   - **Hướng thị giác:** giữ nền tarot chung, card là tâm điểm; màu xanh/đỏ/vàng/tím bạc chỉ xuất hiện sau khi lật để verdict nổi bật mà không biến màn hình thành trò đoán đáp án.
   - `initial`:
     - `QuestionInput` là optional, trim khoảng trắng và giới hạn 140 ký tự.
     - Label ghi rõ **“Your question (optional)”**; helper text gợi ý câu hỏi có thể trả lời Yes/No.
     - Nếu để trống, hiển thị hướng dẫn **“Hold your question in mind”** và vẫn bật CTA **Draw Card** như quyết định đã chốt.
     - Câu hỏi chỉ giữ trong state của route, không lưu localStorage hoặc lịch sử.
   - `drawing`:
     - Chạy `CardDrawAnimation variant="yes-no"` cho đúng một lá; vô hiệu hóa CTA/input để ngăn double draw.
     - Nếu có câu hỏi, chuyển nó thành quote phía trên; nếu không có, dùng copy trung tính **“Your answer”**, không tự tạo câu hỏi giả.
   - `result`:
     - Thứ tự thông tin: quote câu hỏi (nếu có) → verdict lớn → card image/name → **Why this answer** → **Guidance**.
     - Bốn verdict có ý nghĩa rõ ràng:
       - **YES:** năng lượng thuận lợi để tiến lên.
       - **NO:** nên dừng, đổi hướng hoặc chưa nên thực hiện.
       - **MAYBE:** kết quả phụ thuộc lựa chọn/hành động tiếp theo.
       - **UNCLEAR:** thông tin chưa đủ, cảm xúc đang nhiễu hoặc nên hỏi lại sau.
     - **Why this answer** dùng `yesNoMeaning` riêng của lá; **Guidance** dùng `advice`, tránh chỉ hiển thị “Yes/No” mà không giải thích.
     - Verdict dùng `role="status"`/`aria-live="polite"` sau khi animation kết thúc; icon + text bảo đảm không phụ thuộc màu.
   - **Hành động cuối:**
     - **Draw Again** quay về `initial` và giữ nguyên câu hỏi để user có thể rút lại hoặc sửa.
     - Thêm **Clear question** dạng text button khi input có nội dung; **Back** về `/tarot` và xóa question state.
     - Không giới hạn Draw Again theo phạm vi đã chốt, nhưng mỗi lần bấm chỉ tạo một draw và không chấp nhận tap lặp khi đang chạy.
   - **Data/content dự kiến:** mỗi lá có `yesNo` và `yesNoMeaning`; có thể dùng helper `buildYesNoGuidance(card)` để định dạng Answer/Why/Guidance nhưng không thay đổi verdict ngẫu nhiên theo câu hỏi.
   - **Giọng điệu:** ngắn, rõ nhưng không khẳng định chắc chắn về y tế, pháp lý, tài chính hoặc an toàn; ở câu hỏi hệ trọng nên hướng user xem kết quả như một góc phản tư.
4. **Daily Tarot / Card of the Day** `/tarot/daily`:
   - Mỗi ngày có 1 lá cố định, xác định từ ngày local của thiết bị.
   - Lần đầu mở trong ngày, hiển thị một lá úp; user bấm card hoặc **Reveal Card** để lật.
   - Sau khi reveal, hiển thị ảnh lá bài, tên, meaning và advice.
   - Sau khi đã reveal, những lần mở lại trong ngày hiển thị luôn lá bài và nội dung, không cần bấm Reveal lần nữa.
   - Không có input, Draw Again hoặc thumbnail kết quả trên Tarot Home; `localStorage` chỉ lưu `dateKey` đã reveal.
   - Sang ngày khác và mở lại chức năng thì app tự hiển thị lá úp của ngày mới.
5. **Love Tarot** `/tarot/love`:
   - State: `initial` → `drawing` → `result`.
   - `initial`: chọn một context chip **Độc thân / Đang tìm hiểu / Trong mối quan hệ** rồi bấm **Draw Cards**; không có ô nhập câu hỏi.
   - `drawing`: chạy `CardDrawAnimation variant="love"` theo trình tự **Bạn → Đối phương → Kết nối**.
   - `result`: bố cục tam giác; tap từng lá xem chi tiết và hiển thị khối **Thông điệp cho mối quan hệ** bên dưới.
   - **Draw Again** giữ nguyên context đã chọn; **Back** về `/tarot`.
6. **Money Tarot** `/tarot/money`:
   - State: `initial` → `drawing` → `result`.
   - `initial`: chọn một context chip **Tài chính chung / Thu nhập–Công việc / Chi tiêu** rồi bấm **Draw Cards**.
   - `drawing`: chạy `CardDrawAnimation variant="money"` theo trình tự **Hiện trạng → Cơ hội–Trở ngại → Hành động**.
   - `result`: bố cục tiến trình; tap từng lá xem chi tiết và hiển thị tổng hợp **Cơ hội / Điều cần thận trọng / Bước tiếp theo**.
   - Hiển thị ghi chú ngắn: “Nội dung chỉ mang tính tham khảo, không phải tư vấn tài chính”.
   - **Draw Again** giữ nguyên context đã chọn; **Back** về `/tarot`.
7. **3 Card Spread** `/tarot/3-card-spread` — **đã triển khai theo đặc tả**:
   - **Vai trò sản phẩm:** đây là trải bài mở, dành cho câu hỏi không thuộc riêng tình yêu hay tài chính. Điểm khác biệt chính là user tự đặt câu hỏi và ba lá không có ý nghĩa vị trí cố định.
   - **Hướng thị giác:** giữ nền tím–indigo trung tính, giảm chi tiết trang trí quanh card và dùng câu hỏi làm điểm nhấn; cảm giác nên giống một khoảng tập trung yên tĩnh, không nghiêng sang palette Love hoặc Money.
   - **State đề xuất:** `initial` → `drawing` → `revealing` → `result`.
   - `initial`:
     - Hiển thị `QuestionInput` bắt buộc, trim khoảng trắng, tối đa 160 ký tự.
     - Placeholder nên hướng user đặt câu hỏi mở, ví dụ: “What should I understand about this situation?”; hạn chế khuyến khích câu hỏi chỉ có Yes/No vì đã có flow riêng.
     - **Draw Cards** disabled khi câu hỏi rỗng sau trim; câu hỏi chỉ giữ trong memory của màn hình, không lưu localStorage.
   - `drawing`:
     - Chạy `CardDrawAnimation variant="open-question"`; câu hỏi đã nhập chuyển thành quote ở đầu màn hình.
     - Deal 3 lá úp, không dùng `CardSlotLabel`, không gán Past/Present/Future hoặc Card 1/2/3 vào nội dung diễn giải.
   - `revealing`:
     - User tap lá nào thì lá đó lật; thứ tự tap không làm thay đổi meaning.
     - Hiển thị tiến trình trung tính **“Revealed 1 of 3”** bên ngoài card, chỉ phục vụ trạng thái chứ không phải nhãn vị trí.
     - **Reveal All** mở tuần tự các lá chưa lật; khóa tap trong lúc một lá đang flip để tránh double event.
   - `result`:
     - Hiển thị lại câu hỏi ở dạng quote, ba lá và meaning tổng quát của từng lá.
     - Thêm **Combined Message** đọc ba lá như một nhóm: chủ đề chung, điểm căng/đối lập nếu có, và một lời khuyên thực tế. Không tuyên bố app hiểu ngữ nghĩa sâu của câu hỏi vì toàn bộ nội dung chạy offline.
     - Tap card mở bottom sheet chi tiết; sheet chỉ có tên, meaning và advice tổng quát, không thêm nhãn vị trí.
   - **Hành động cuối:**
     - **Draw Again** rút bộ ba mới nhưng giữ nguyên câu hỏi.
     - Thêm **Change Question** để quay về `initial`, giữ nội dung hiện tại cho user sửa.
     - **Back** về `/tarot`; khi rời route thì xóa câu hỏi khỏi memory.
   - **Data/content dự kiến:** `buildOpenQuestionSummary(cards)` tạo Combined Message từ keyword/tone/meaning/advice của ba lá; câu hỏi chỉ được echo lại, không nội suy bằng API.
   - **Giọng điệu:** phản tư, trung tính, tránh câu khẳng định chắc chắn về tương lai hoặc thay user đưa ra quyết định quan trọng.
8. **Yearly Tarot** `/tarot/yearly` — **đã triển khai theo đặc tả**:
   - **Vai trò sản phẩm:** một “bản đồ năm” có cấu trúc, giúp user xem lần lượt 5 khía cạnh thay vì cố hiển thị cả 5 lá cùng lúc.
   - **Hướng thị giác:** midnight blue/tím than kết hợp gold, progress indicator dạng năm điểm constellation; mỗi khía cạnh có icon nhỏ nhưng vẫn dùng chung một palette để carousel không bị rời rạc.
   - **Nhãn đã chốt:** **Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe**.
   - **Phạm vi thời gian đề xuất:** mặc định **12 tháng tới** và ghi rõ ngay ở intro/result. Cách này hữu ích ở mọi thời điểm trong năm và không cần user chọn năm; nếu sau này cần năm dương lịch mới bổ sung period selector.
   - **State đề xuất:** `initial` → `drawing` → `result`; không cần input hoặc context bắt buộc.
   - `initial`:
     - Hiển thị mô tả ngắn “5 cards for the next 12 months” và minh họa năm điểm/constellation để preview cấu trúc trải bài.
     - CTA duy nhất **Draw My Year** nhằm tạo bản sắc riêng, thay vì dùng chung copy **Draw Cards** ở mọi flow.
   - `drawing`:
     - Chạy `CardDrawAnimation variant="yearly"`; rút đủ 5 lá nhưng đưa kết quả vào carousel theo thứ tự nhãn đã chốt.
     - Tổng animation mục tiêu 2.4–3 giây; không chờ 5 animation đầy đủ nối tiếp vì sẽ tạo cảm giác chậm.
   - `result` — carousel mobile portrait:
     - Dùng horizontal carousel có CSS scroll-snap; card active nằm giữa, hai card kế bên hé 12–18% để gợi ý thao tác swipe.
     - Luôn hiển thị label khía cạnh, tên lá, chỉ báo **1/5** và progress dots/constellation đồng bộ với card active.
     - Hỗ trợ swipe, nút Previous/Next và keyboard; không phụ thuộc riêng gesture.
     - Lá **Tổng quan** là điểm bắt đầu nhưng không được làm to hơn về mặt ý nghĩa; user có thể chuyển đến mọi khía cạnh tự do.
     - Tap card active mở bottom sheet với cấu trúc **Energy / What to nurture / What to watch**, được dựng từ meaning và advice theo khía cạnh.
   - **Tổng hợp cuối trải bài:** khối **Your North Star** tổng hợp lá Tổng quan với lời khuyên nổi bật từ bốn khía cạnh. Khối này luôn có thể mở thủ công; sau khi user đã xem đủ 5 lá thì tự mở một lần để tạo cảm giác hoàn tất, không khóa nội dung hoặc ép user phải swipe đủ.
   - **Hành động cuối:** **Draw Again** reset carousel về vị trí 1/5 và rút 5 lá mới; **Back** về `/tarot`. Không lưu lịch sử trong phase hiện tại.
   - **Data/content dự kiến:** thêm interpretation theo `yearly.overview/love/career/finance/health` hoặc helper tạo câu dẫn theo khía cạnh; `buildYearlyNorthStar(cards)` tạo phần tổng hợp offline.
   - **Lưu ý sức khỏe/tài chính:** nội dung mang tính phản tư, không thay thế tư vấn y tế hoặc tài chính; disclaimer ngắn xuất hiện trong detail của hai khía cạnh tương ứng.
9. **Zodiac Home** `/zodiac` → hai tile ảnh **Zodiac Origin / Horoscope**, dùng ảnh WebP cục bộ và lớp gradient để nội dung luôn dễ đọc.
10. **Zodiac Origin** `/zodiac/origin` + `/zodiac/origin/:signId` — triển khai theo kế hoạch chi tiết ở mục 4.1.
11. **Horoscope** `/zodiac/horoscope` — triển khai theo kế hoạch chi tiết ở mục 4.1.

### 4.1. Kế hoạch triển khai hai chức năng Zodiac

#### A. Zodiac Origin

1. **Data và type**
   - SQLite chứa đủ 12 cung; type `ZodiacSign` thống nhất: `id`, `name`, `symbol`, `dateRange`, `element`, `rulingPlanet`, `origin`, `traits`.
   - Dùng `id` dạng slug ổn định (`aries`, `taurus`, …) làm route param; dữ liệu chạy hoàn toàn offline.
   - Kiểm tra đủ 12 `id` không trùng, mỗi cung có nội dung nguồn gốc và ít nhất 3 đặc điểm.
2. **Component dùng chung**
   - Xây `ZodiacSignPicker.vue`: grid 3 cột trên mobile, mỗi ô có symbol, tên và khoảng ngày; hỗ trợ `button`/`router-link`, keyboard focus và nhãn đọc màn hình.
   - Chuẩn hóa accent theo bốn nguyên tố Fire / Earth / Air / Water nhưng luôn kèm text, không dùng màu làm dấu hiệu duy nhất.
3. **Màn danh sách `/zodiac/origin`**
   - Header có Back về `/zodiac`, intro ngắn và grid 12 cung.
   - Tap một cung điều hướng tới `/zodiac/origin/:signId`; dữ liệu được nạp một lần từ SQLite khi app khởi động.
4. **Màn chi tiết `/zodiac/origin/:signId`**
   - Hero gồm symbol, tên, date range, element và ruling planet.
   - Nội dung chia thành hai section dễ đọc: **Origin Story** và **Key Traits**.
   - Back về danh sách; nếu `signId` không hợp lệ thì hiện trạng thái **Sign not found** kèm CTA về `/zodiac/origin` thay vì để màn hình trắng.
5. **Tiêu chí hoàn thành**
   - Mở được đủ 12 detail route; refresh/deep-link vẫn đọc đúng cung; không tràn nội dung ở màn 360×640; focus quay lại hợp lý khi Back.

#### B. Horoscope

1. **Data và type**
   - Bảng `horoscope_readings` dùng khóa `signId × period`, với `period = day | week | year`.
   - Mỗi nội dung gồm `overview`, `love`, `career`, `wellbeing` và `guidance`; nội dung mang tính giải trí/phản tư, không đưa ra cam kết chắc chắn.
   - Dữ liệu tĩnh/generate sẵn, không gọi API và không cần `loading`/`error` cho network.
2. **Component dùng chung**
   - Dùng lại `ZodiacSignPicker.vue` để chọn/đổi cung.
   - Xây `PeriodTabs.vue` cho Day / Week / Year với `role="tablist"`, trạng thái selected rõ ràng và hỗ trợ keyboard.
3. **Màn `/zodiac/horoscope`**
   - Trạng thái đầu: chọn một trong 12 cung; period mặc định là `day`.
   - Sau khi chọn cung, hiển thị header của cung, `PeriodTabs` và các khối Overview / Love / Career / Wellbeing / Guidance trên cùng màn hình.
   - Đổi period giữ nguyên cung; đổi cung giữ nguyên period; nút **Change sign** mở lại picker ngay trong màn, không điều hướng sang route khác.
   - Back luôn về `/zodiac`; không tự suy luận cung từ ngày sinh và không lưu lựa chọn vào lịch sử.
4. **Tiêu chí hoàn thành**
   - Có đủ `12 × 3 = 36` tổ hợp nội dung; chuyển tab không nháy layout; đổi cung không reset period; các tab có focus/selected state; nội dung cuộn tốt trên mobile portrait.

#### C. Thứ tự thực hiện đề xuất

1. [x] Hoàn thiện schema/seed SQLite, type/repository/store và validation dữ liệu.
2. [x] Làm `ZodiacSignPicker` và `PeriodTabs` kèm accessibility.
3. [x] Hoàn thiện Origin List → Origin Detail và route invalid.
4. [x] Hoàn thiện Horoscope và logic giữ state cung/period.
5. [ ] Kiểm thử trực quan keyboard, reduced motion và layout 360×640 / 390×844 trên browser/thiết bị thật.

---

## 5. Phase 5 — Build & test

1. Chạy dev trên webview portrait (và Capacitor trên thiết bị/emulator Android).
2. Test các edge case đã liệt kê trong `screen.md`:
   - Daily Tarot: cùng `dateKey` luôn ra cùng card; Reveal chỉ lật lá đã chọn sẵn; ngày khác đổi card theo deterministic seed.
   - Daily Tarot: sau Reveal, mở lại trong cùng ngày hiển thị ngay mặt lá; sang ngày mới quay lại lá úp. Không có Draw Again; Tarot Home không làm lộ lá trước khi user mở chức năng.
   - Yes or No: input rỗng hoặc chỉ có whitespace vẫn draw được; input dài bị giới hạn; question được giữ khi Draw Again và xóa khi Back/Clear question.
   - Yes or No: map đủ 4 verdict; Answer/Why/Guidance khớp card; không double draw khi tap nhanh; verdict không chỉ phân biệt bằng màu.
   - Love/Money: chưa chọn context thì CTA chưa chạy; chọn context rồi rút đúng label, meaning và summary của domain.
   - Love/Money: Draw Again giữ context; không cho bấm lặp trong state `drawing`; rời màn giữa animation phải dọn timer/state.
   - Money: luôn hiển thị disclaimer trong kết quả.
   - 3 Card Spread: trim/giới hạn question; CTA disabled khi rỗng; không lưu question khi rời route; Draw Again giữ câu hỏi và Change Question cho phép sửa.
   - 3 Card Spread: tap card theo thứ tự bất kỳ; không flip hai lần; Reveal All chỉ mở các lá còn úp; Combined Message chỉ xuất hiện sau khi đủ 3 lá.
   - Yearly: carousel mặc định ở 1/5; scroll-snap/progress/Previous/Next đồng bộ; Draw Again reset active index và tạo đúng 5 lá không trùng.
   - Yearly: North Star có thể mở bất kỳ lúc nào và chỉ auto-open một lần sau khi xem đủ 5 card; disclaimer đúng ở detail Tài chính/Sức khỏe.
   - Horoscope: đổi tab/đổi cung không mất lựa chọn còn lại.
3. Kiểm tra bố cục màn hình dọc cho Love dạng tam giác, Money dạng tiến trình, 3 Card Spread ở trạng thái revealing và carousel 5 lá Yearly.
4. Test animation trên thiết bị cấu hình thấp: tổng thời gian 2–3 giây, không giật layout và không tụt frame rõ rệt.
5. Test `prefers-reduced-motion`: Yes or No/Love/Money/3 Card Spread/Yearly vẫn thể hiện đúng trạng thái, thứ tự và kết quả khi tắt các chuyển động trang trí; Daily không có animation.

---

## 6. Checklist hoàn thành

- [x] Chốt Phase 0 — theo gợi ý mặc định (xem mục 0).
- [x] Capacitor host đã cấu hình portrait; Android debug build đã pass và APK đã được smoke test trên thiết bị thật.
- [x] Data SQLite đầy đủ: 78 cards, 12 zodiac signs và 36 horoscope readings; lớp diễn giải Love/Money giữ offline trong app.
- [x] Shared components dùng chung cho header, layout, input, animation, result và spread.
- [x] Đủ các màn Tarot/Zodiac theo router; Settings vẫn là placeholder.
- [x] Duyệt/chốt đặc tả UX chi tiết cho Yes or No và đồng bộ code.
- [x] Yes or No có 4 verdict, Answer/Why/Guidance, optional question và trạng thái accessible.
- [x] Card of the Day có 1 lá cố định theo ngày; sau Reveal, lưu dateKey để các lần mở lại trong ngày hiển thị ngay lá đó; không có Draw Again.
- [x] Love và Money có spread, bố cục, summary, palette và animation variant riêng; Draw Again giữ context.
- [x] Duyệt/chốt UX cho 3 Card Spread và Yearly Tarot và triển khai code.
- [x] 3 Card Spread có question flow, reveal tương tác và Combined Message; không gán meaning theo vị trí.
- [x] Yearly Tarot có carousel 5 khía cạnh, progress đồng bộ và Your North Star.
- [x] Animation có fallback accessibility (`prefers-reduced-motion`); hiệu năng vẫn cần xác nhận trên thiết bị thật.
- [ ] Các quyết định chung trong `user-flow.md` mục 4 được tuân thủ (không login, không history/share/reversed, không giới hạn draw).

## 7. Phase tiếp theo — Beta hardening

1. Chạy quality gate đầy đủ bằng `npm run verify` và Android debug build trên CI.
2. Hoàn tất checklist hồi quy trên máy dùng ba nút điều hướng, máy dùng cử chỉ và màn hình nhỏ.
3. Chốt metadata phát hành: tên app, application ID, icon/splash, version và privacy policy.
4. Thiết lập signing ngoài repository, tạo AAB và phát hành qua Internal Testing.
5. SDK nội bộ của công ty được tích hợp ở phase riêng sau khi base beta được chốt; không thêm SDK placeholder hoặc dependency tạm trong phase này.

---

## 8. Ghi chú tài liệu (đã xử lý)

- ✅ `overview.md`: đổi `screens.md` → `screen.md`.
- ✅ `user-flow.md` 2.5: bỏ chữ "(đề xuất — có thể đổi tên nhãn...)" — nhãn Yearly đã chốt.
- ✅ Bảng "Câu hỏi còn mở" ở cả 3 tài liệu đã cập nhật thành "Quyết định đã chốt".
- ✅ `screen.md` / `user-flow.md` được lưu xuống disk khi chỉnh sửa (trước đó bị 0 byte).
