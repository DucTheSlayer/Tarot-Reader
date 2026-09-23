# Kế hoạch Text Card — mở rộng phần diễn giải lá Tarot

## 1. Mục tiêu

Sau khi lật bài, người dùng cần hiểu được ba điều theo đúng thứ tự:

1. **Lá bài nói gì?** — ý nghĩa cốt lõi, ngắn và rõ.
2. **Ý nghĩa đó liên quan gì đến trải bài hiện tại?** — diễn giải theo vị trí, chủ đề hoặc câu hỏi.
3. **Người dùng có thể làm gì tiếp theo?** — một gợi ý thực tế và một câu hỏi để tự suy ngẫm.

`Text Card` là khối nội dung đi cùng một lá bài sau khi lật. Khối này làm phần đọc bài giàu hơn một chút nhưng không biến màn hình thành một bài viết dài, không thay đổi kết quả rút bài và không đưa ra lời khẳng định tuyệt đối.

## 2. Phạm vi

### Trong phạm vi

- Chuẩn hóa cách hiển thị ý nghĩa và gợi ý ở Daily, Yes/No, Love, Money, 3 Card Spread, Yearly và Tarot Library.
- Tận dụng dữ liệu hiện có: `meaning`, `advice`, `yesNoMeaning` và các câu diễn giải theo ngữ cảnh trong `spreadReadings.ts`.
- Thêm lớp nội dung ngắn theo từng loại trải bài.
- Dùng chung một component và một view-model để tránh mỗi màn tự ghép nội dung theo cách khác nhau.
- Hỗ trợ đầy đủ các locale hiện tại và `prefers-reduced-motion`.

### Ngoài phạm vi của bản đầu

- Không thêm trạng thái lá ngược.
- Không dùng AI hoặc API để sinh nội dung lúc runtime.
- Không cá nhân hóa bằng dữ liệu nhạy cảm của người dùng.
- Không sửa logic chọn bài, xác suất, route hoặc quảng cáo.
- Không viết lại toàn bộ nội dung của 78 lá ngay trong cùng một lần triển khai.

## 3. Vấn đề hiện tại

- `CardResultItem` chủ yếu hiển thị tên, `meaning` và `advice`; phần diễn giải sâu hơn đang nằm rải rác trong từng view.
- Daily Tarot đã có nhiều lớp nội dung, trong khi chi tiết Love, Money và 3 Card Spread vẫn khá ngắn.
- Một số câu được ghép trực tiếp từ template và `card.meaning`, nên dễ lặp lại ý giữa phần chi tiết lá và phần tổng hợp trải bài.
- `yesNoMeaning` mang nghĩa giải thích verdict Yes/No; không nên dùng như nội dung “năng lượng” chung ở mọi trải bài.
- Khi thêm nội dung mới cho từng màn, số lượng chuỗi dịch và khả năng sai khác giữa các màn sẽ tăng nhanh nếu không có một cấu trúc chung.

## 4. Cấu trúc Text Card đề xuất

Mỗi Text Card có tối đa bốn lớp. Chỉ hiển thị lớp phù hợp với ngữ cảnh; không bắt buộc mọi màn phải có đủ bốn phần.

| Thứ tự | Phần | Mục đích | Độ dài mục tiêu |
| --- | --- | --- | --- |
| 1 | **Ý nghĩa cốt lõi** | Giải thích biểu tượng/chủ đề chính của lá | 1–2 câu, 20–40 từ |
| 2 | **Trong trải bài này** | Nối ý nghĩa với vị trí, chủ đề hoặc câu hỏi hiện tại | 1–2 câu, 25–50 từ |
| 3 | **Gợi ý** | Đưa ra một hành động nhỏ, có thể cân nhắc ngay | 1–2 câu, 20–40 từ |
| 4 | **Tự hỏi** | Một câu hỏi mở để người dùng tự phản chiếu | 1 câu, tối đa 25 từ |

Phần tùy chọn:

- **Điều cần lưu ý**: dùng cho Money, Yearly hoặc khi cần cân bằng một thông điệp quá tích cực/tiêu cực.
- **Giải thích verdict**: chỉ dùng trong Yes/No và luôn đi cùng nhãn Yes, No, Maybe hoặc Unclear.
- **Lưu ý an toàn**: hiển thị ở cấp trải bài, không lặp lại trong từng lá.

## 5. Phân cấp hiển thị

### Màn một lá

Daily và Yes/No hiển thị Text Card trực tiếp dưới hình lá bài:

```text
[ Tên lá bài ]

Ý nghĩa cốt lõi
Đoạn giải thích ngắn.

Trong trải bài này
Đoạn diễn giải theo ngày hoặc theo câu hỏi Yes/No.

Gợi ý
Một hành động nhỏ có thể cân nhắc.

Tự hỏi
“Điều gì đang cần mình nhìn chậm lại?”
```

### Màn nhiều lá

Love, Money, 3 Card Spread và Yearly ưu tiên đọc nhanh:

- Trên màn kết quả chỉ hiện tên lá, nhãn vị trí và một đoạn tóm tắt 1–2 câu.
- CTA **Xem diễn giải đầy đủ** mở bottom sheet hiện có.
- Bottom sheet chứa đủ Text Card; phần tổng hợp toàn trải bài vẫn nằm sau danh sách/cụm lá.
- Không lặp nguyên văn cùng một đoạn ở cả preview, bottom sheet và summary.

### Tarot Library

Library là nội dung tham khảo, không giả lập một trải bài cá nhân. Thứ tự phù hợp là:

1. Ý nghĩa cốt lõi.
2. Từ khóa.
3. Gợi ý chung.
4. Năng lượng Yes/No.

Không hiển thị “Trong trải bài này” hoặc câu cá nhân hóa nếu người dùng chỉ đang xem thư viện.

## 6. Áp dụng theo từng trải bài

| Trải bài | Preview | Nội dung đầy đủ trong Text Card |
| --- | --- | --- |
| Daily | Tên lá + ý nghĩa cốt lõi | Ý nghĩa cốt lõi → Trong ngày hôm nay → Gợi ý → Tự hỏi |
| Yes/No | Verdict + tên lá | Giải thích verdict → Ý nghĩa cốt lõi → Gợi ý → Tự hỏi |
| Love | Nhãn vị trí + diễn giải theo ngữ cảnh | Ý nghĩa cốt lõi → Vai trò của lá trong mối quan hệ → Gợi ý → Tự hỏi |
| Money | Nhãn bước + diễn giải tài chính ngắn | Ý nghĩa cốt lõi → Cơ hội/trở ngại/hành động → Điều cần lưu ý → Gợi ý |
| 3 Card Spread | Tên lá + ý nghĩa cốt lõi | Ý nghĩa cốt lõi → Một góc nhìn mở → Gợi ý → Tự hỏi |
| Yearly | Khía cạnh + một câu tóm tắt | Năng lượng năm → Điều nên nuôi dưỡng → Điều cần lưu ý → Tự hỏi |
| Library | Tên + ý nghĩa cốt lõi | Nội dung tham khảo đầy đủ, không gắn với câu hỏi cụ thể |

### Quy tắc riêng cho Love

- Không khẳng định chắc chắn cảm xúc, ý định hoặc hành động của người khác.
- Dùng “năng lượng bạn có thể đang gặp”, “dấu hiệu đáng chú ý” hoặc “khả năng” thay cho “người ấy chắc chắn…”.
- Câu hỏi phản chiếu hướng về nhu cầu, ranh giới và lựa chọn của chính người dùng.

### Quy tắc riêng cho Money và Health trong Yearly

- Không hứa hẹn lợi nhuận, vận may tài chính hoặc kết quả sức khỏe.
- Dùng ngôn ngữ “cân nhắc”, “quan sát”, “chuẩn bị” và “tìm hỗ trợ phù hợp”.
- Disclaimer đặt một lần ở cuối trải bài, không chen giữa các đoạn chính.

## 7. Ví dụ Text Card

Ví dụ minh họa với **Ẩn Sĩ** ở vị trí “Hành động” của Money Tarot:

> **Ý nghĩa cốt lõi**  
> Ẩn Sĩ nói về việc lùi lại khỏi tiếng ồn để tìm sự sáng rõ từ bên trong.
>
> **Trong trải bài này**  
> Ở vị trí Hành động, lá bài gợi ý chưa cần quyết định vội. Hãy xem lại dữ kiện và mục tiêu thật sự của bạn trước khi cam kết nguồn lực.
>
> **Gợi ý**  
> Dành một khoảng yên tĩnh để kiểm tra ngân sách, điều kiện và rủi ro; nếu cần, hãy hỏi một người có chuyên môn.
>
> **Tự hỏi**  
> Mình đang cần thêm thông tin, hay chỉ đang trì hoãn vì sợ quyết định?

Ví dụ này thể hiện độ sâu mong muốn: đủ hữu ích để suy ngẫm nhưng vẫn đọc nhanh trên mobile.

## 8. Kiến trúc nội dung

### 8.1. View-model dùng chung

Không để component tự ghép câu. Tạo một kiểu dữ liệu trung gian, ví dụ:

```ts
type CardTextSectionKind =
  | 'meaning'
  | 'context'
  | 'guidance'
  | 'reflection'
  | 'caution'
  | 'verdict'

interface CardTextSection {
  kind: CardTextSectionKind
  label: string
  body: string
}

interface CardTextModel {
  cardName: string
  slotLabel?: string
  summary: string
  sections: CardTextSection[]
  disclaimer?: string
}
```

Các builder nhận `TarotCard` và ngữ cảnh, sau đó trả về `CardTextModel`:

- `buildDailyCardText(card)`
- `buildYesNoCardText(card, question?)`
- `buildLoveCardText(card, position, context)`
- `buildMoneyCardText(card, position, context)`
- `buildOpenQuestionCardText(card, index)`
- `buildYearlyCardText(card, aspect)`
- `buildLibraryCardText(card)`

### 8.2. Component

Tạo `CardTextPanel.vue` chỉ chịu trách nhiệm render:

- Tiêu đề/nhãn vị trí.
- Danh sách section theo thứ tự do builder trả về.
- Biến thể màu `default | daily | yes-no | love | money | yearly`.
- Trạng thái compact/full.

`CardResultItem.vue` tiếp tục quản lý hình và tên lá, sau đó compose `CardTextPanel`. Không tạo thêm nhiều component gần giống `CardResultItem` ở từng màn.

### 8.3. Nguồn dữ liệu ở bản đầu

Bản đầu không đổi schema SQLite:

- `meaning` → Ý nghĩa cốt lõi.
- Câu từ `spreadReadings.ts` → Trong trải bài này.
- `advice` → Gợi ý.
- `yesNoMeaning` → chỉ dùng cho giải thích verdict.
- Câu hỏi phản chiếu → template theo loại trải bài/vị trí, đặt trong locale files.

Cách này cho phép kiểm chứng UX trước khi phải viết và dịch thêm hàng trăm đoạn riêng cho 78 lá.

### 8.4. Mở rộng nội dung riêng cho từng lá ở phase sau

Sau khi Text Card đã ổn định, có thể thêm ba trường nội dung có giá trị rõ ràng:

- `keywords`: 3–5 từ khóa.
- `shadowMeaning`: mặt cần lưu ý hoặc biểu hiện mất cân bằng.
- `reflectionPrompt`: câu hỏi phản chiếu riêng của lá.

Không thêm cả ba trường ngay nếu chưa có nguồn copy và kế hoạch dịch hoàn chỉnh. Khi triển khai:

- Thêm migration mới; không sửa migration đã phát hành.
- Cập nhật seed tiếng Anh, payload bản dịch, mapper, validator và test coverage.
- Yêu cầu đủ dữ liệu cho 78 lá và mọi locale được công bố trước khi bật UI.
- Nếu locale thiếu trường mới, fallback theo **section** về tiếng Anh hoặc ẩn section; không hiển thị chuỗi rỗng hay JSON thô.

## 9. Quy chuẩn viết nội dung

- Viết ở ngôi thứ hai, giọng bình tĩnh, tôn trọng quyền lựa chọn của người dùng.
- Một đoạn chỉ truyền đạt một ý chính; tránh câu dài nhiều mệnh đề.
- Gợi ý phải là hành động nhỏ hoặc góc quan sát cụ thể, không chỉ lặp lại ý nghĩa.
- Câu “Tự hỏi” là câu hỏi mở, không dẫn người dùng đến một kết luận có sẵn.
- Tránh các từ tuyệt đối như “chắc chắn”, “định mệnh”, “sẽ xảy ra”, “người ấy đang…”.
- Không chẩn đoán sức khỏe, không đưa lời khuyên pháp lý/tài chính và không tạo cảm giác đảm bảo kết quả.
- Giữ tên section nhất quán giữa các màn; sắc thái riêng nằm ở nội dung, không nằm ở việc đổi nhãn tùy ý.
- Mỗi Text Card đầy đủ nên khoảng 90–160 từ; preview khoảng 25–55 từ.

## 10. UI và khả năng truy cập

- Text Card rộng tối đa khoảng `520px`, căn trái phần nội dung dài dù tên lá có thể căn giữa.
- Dùng heading đúng cấp; không mô phỏng heading chỉ bằng chữ đậm.
- Body tối thiểu `14px`, line-height từ `1.55`; giữ tương phản đạt WCAG AA.
- Section phân tách bằng khoảng trắng hoặc divider nhẹ, không đặt mỗi đoạn trong một card lồng nhau.
- Bottom sheet có focus trap, nút đóng có accessible name, đóng bằng `Escape` trên web và trả focus về lá vừa chọn.
- Text không phụ thuộc vào màu hoặc animation để truyền đạt ý nghĩa.
- Nếu dùng expand/collapse, nút phải có `aria-expanded` và label rõ ràng.

## 11. Kế hoạch triển khai

### Phase 1 — Chuẩn hóa cấu trúc, không migration

1. Tạo type `CardTextModel` và các builder dùng dữ liệu hiện có.
2. Tạo `CardTextPanel.vue` với compact/full mode.
3. Tích hợp trước vào `CardResultItem`, Yes/No và Tarot Library.
4. Chuyển Love, Money, 3 Card Spread và Yearly sang cùng cấu trúc.
5. Rút gọn các summary đang lặp nguyên văn `meaning` hoặc `advice`.

### Phase 2 — Copy và bản dịch

1. Chốt bộ nhãn chung: Ý nghĩa cốt lõi, Trong trải bài này, Gợi ý, Tự hỏi, Điều cần lưu ý.
2. Thêm template câu hỏi phản chiếu theo flow/vị trí vào `reading.<locale>.json`.
3. Kiểm tra placeholder của mọi locale và fallback khi thiếu chuỗi.
4. Review tiếng Việt và tiếng Anh trên màn hình 360px trước, sau đó mới duyệt các locale dài như Đức/Pháp.

### Phase 3 — Nội dung riêng từng lá, nếu số liệu sử dụng ủng hộ

1. Viết thử `keywords`, `shadowMeaning`, `reflectionPrompt` cho 22 Major Arcana.
2. Đánh giá độ hữu ích, độ dài và tỷ lệ mở “Xem diễn giải đầy đủ”.
3. Nếu đạt yêu cầu, mở rộng đủ 56 Minor Arcana và mọi locale.
4. Thêm migration/version DB, validation và tài liệu authoring.

## 12. Kiểm thử

### Unit test

- Mỗi builder trả section đúng thứ tự và không có body rỗng.
- `yesNoMeaning` chỉ xuất hiện trong flow Yes/No/Library được cho phép.
- Builder không tạo nội dung khi thiếu lá hoặc index ngoài phạm vi.
- Placeholder dịch như `{name}`, `{advice}`, `{aspect}` được thay đầy đủ.
- Fallback locale không làm mất cả Text Card chỉ vì thiếu một section tùy chọn.

### Component test

- Compact mode chỉ hiện summary và CTA.
- Full mode render đúng heading, section và disclaimer.
- Expand/collapse cập nhật `aria-expanded` và giữ focus hợp lý.
- Nội dung dài không tràn khung; bottom sheet vẫn cuộn được.

### QA thủ công

- Kiểm tra ít nhất một lá Major và một lá thuộc mỗi suit trong tất cả flow.
- Kiểm tra màn hình 320px, 360px và 430px.
- Kiểm tra font scale lớn, keyboard navigation và screen reader labels.
- Kiểm tra nội dung tích cực, trung tính và cảnh báo để chắc rằng UI không vô tình biến màu sắc thành verdict.
- Kiểm tra Draw Again không giữ Text Card của lượt trước.

## 13. Tiêu chí hoàn thành

- Mọi màn kết quả có cùng thứ tự đọc: tên/nhãn → ý nghĩa → ngữ cảnh → gợi ý.
- Màn nhiều lá vẫn quét nhanh, không buộc người dùng đọc toàn bộ nội dung trước khi chuyển lá.
- Không có đoạn `meaning` hoặc `advice` bị lặp nguyên văn trong cùng một màn.
- Yes/No không dùng nội dung verdict như ý nghĩa chung của lá.
- Text Card hoạt động với mọi locale hiện có, không có key dịch thô hoặc section rỗng.
- Nội dung không đưa lời hứa chắc chắn về tình cảm, tiền bạc, sức khỏe hoặc tương lai.
- Unit test, component test, database validation và production build đều pass.

## 14. Thứ tự ưu tiên đề xuất

Ưu tiên **Phase 1 + Phase 2** trước. Hai phase này đã tạo cảm giác nội dung đầy đặn và nhất quán bằng dữ liệu hiện có, với rủi ro thấp. Chỉ triển khai **Phase 3** sau khi giao diện đã ổn định và có đủ nguồn lực để viết, review và dịch nội dung riêng cho toàn bộ 78 lá.
