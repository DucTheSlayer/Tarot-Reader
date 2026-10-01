# Plan 3 — Giữ sáu chức năng, đổi mới cách bốc bài nhiều lá

> Hướng đã xác định: **giữ sáu mục Daily, Yes/No, Love, Money, Yearly và trải 3 lá mở; làm mới cách bốc bài trong các chức năng nhiều lá**. Các tương tác bên dưới là đề xuất để thử, chưa phải yêu cầu triển khai code ngay. Bản này bổ sung cho [plan-2](plan-2.md) (màu sắc, bố cục, chuyển động) và [text-card-plan](text-card-plan.md) (nội dung từng lá).

Home tiếp tục có sáu mục riêng. Người dùng chọn mục theo nhu cầu, sau đó bước vào trải nghiệm bốc bài phù hợp với mục đó. **Trải 3 lá mở đã được điều chỉnh theo phản hồi:** chỉ giữ dãy bài, chọn lá bằng cách nâng nhẹ nó lên, đủ 3 lá thì tự lật; không có khung hay ô đặt bài. Các bàn đặt lá cho Love, Money và Yearly vẫn là đề xuất cho các vòng sau. Số lá, ngữ cảnh và nhãn vị trí hiện có được giữ nguyên.

## 1. Chẩn đoán hiện tại

App đã có sáu lối vào Tarot: Daily, Yes/No, Love, Money, Yearly và trải 3 lá mở. Tuy nhiên, ở các lượt rút thông thường, app xáo bộ 78 lá rồi chọn sẵn; màn hình chủ yếu phát hoạt ảnh và tự lật. Ví dụ, trải 3 lá hiện gọi `draw(3)`, dùng `auto-reveal` và `tappable=false`. Phần thông điệp tổng hợp hiện gắn tên ba lá vào một khuôn câu chung. Vì vậy, người dùng ít có cảm giác *mình đã chọn*, và khó nhận ra vì sao **ba lá cụ thể** dẫn đến kết luận cụ thể.

Một lưới 9 lá dùng giống nhau ở mọi mục sẽ tạo thêm thao tác nhưng chưa thể hiện được đặc trưng từng chức năng. Hướng mới dùng chung cơ chế chọn lá, đồng thời thiết kế **bàn trải và cách đưa lá vào vị trí riêng** cho trải 3 lá, Love, Money và Yearly. Phần diễn giải sâu hơn sau khi xem là hướng bổ sung về sau.

### Mục tiêu sản phẩm

1. Người dùng cảm thấy mình tham gia vào nghi thức rút bài mà vẫn có đường **Rút nhanh** cho lúc muốn xem ngay.
2. Mỗi chức năng nhiều lá có một bàn trải dễ nhận ra, làm rõ số lá cần chọn và vị trí đang được điền.
3. Người dùng chọn đủ lá rồi chủ động lật từng lá hoặc lật tất cả; thao tác ngắn, dễ hiểu và có phản hồi ngay.
4. Trải nghiệm chạy mượt trên Android phổ thông, chữ Việt dễ đọc, hỗ trợ chạm và trình đọc màn hình.

## 2. Ý tưởng chủ đạo: “Mỗi mục một bàn bốc bài”

### 2.1. Hai cách rút trong cùng một màn

Ở trải 3 lá, Love, Money và Yearly, hiển thị lựa chọn **Tự chọn lá** (mặc định ở lần thử đầu) và **Rút nhanh** ngay trên màn bắt đầu hiện có. Ghi nhớ lựa chọn gần nhất trên máy. Daily và Yes/No giữ luồng một lá hiện tại.

**Ngoại lệ đã chốt cho trải 3 lá mở:** không đưa lá vào ô; chạm để nâng lá tại vị trí trong dãy, chạm lại để bỏ chọn khi chưa đủ 3 lá. Đủ 3 lá khóa lựa chọn và tự lật. Các mô tả đặt vào ô, tự lật và Lật tất cả trong luồng chung bên dưới chỉ còn áp dụng cho các bàn có nhãn đang được đề xuất.

| Bước | Tự chọn lá | Rút nhanh |
| --- | --- | --- |
| Bắt đầu | Nhập câu hỏi hoặc chọn ngữ cảnh theo tính năng hiện có | Giữ cách bắt đầu hiện tại |
| Chọn | Chọn từ quạt 9 lá úp; lá bay vào ô đang sáng trên bàn trải riêng của từng mục | Hệ thống chọn đủ số lá và đưa vào cùng bàn trải |
| Lật | Chạm từng lá đã chọn theo thứ tự mong muốn, hoặc **Lật tất cả** | Tự lật như hiện tại |
| Đọc | Nội dung từng lá và phần tổng hợp hiện có; diễn giải sâu hơn bổ sung ở giai đoạn sau | Cùng một nội dung kết quả |

**Quy tắc rút công bằng và rõ ràng:** Trước khi hiển thị, xáo 78 ID một lần; lấy 9 ID đầu, gắn cố định vào 9 mặt úp. Lá được chạm chính là ID đã gắn, không đổi lá vào phút cuối để tạo cảm giác “hợp câu hỏi”. Mỗi lượt chọn không hoàn lại. Nút **Xáo lại** chỉ dùng trước khi chọn lá đầu tiên và tạo lượt xáo mới. Giải thích ngắn trong trợ giúp: “Bộ bài được xáo ngẫu nhiên; bạn chọn trong các lá đang úp.” Không tuyên bố thao tác chạm có khả năng dự đoán tương lai.

**Tương tác:** Chạm là thao tác chính; kéo thả chỉ là hiệu ứng nâng cao nếu test trên máy thật thấy mượt. Luôn có nút **Chọn lá tiếp theo**, **Hoàn tác lá vừa chọn** trước khi lật, và **Lật tất cả**. Sau khi lá đầu tiên được lật, lượt rút được khóa để kết quả không đổi âm thầm. Không bắt người dùng lắc điện thoại hoặc làm động tác dài để “xáo”.

### 2.2. Nhịp bốc bài chung

1. **Mở bàn:** Hiện các ô trống và quạt bài úp phía dưới. Một lần xáo ngắn báo hiệu bắt đầu; người dùng có thể bỏ qua hoạt ảnh.
2. **Chọn lá:** Ô nhận lá sáng lên và có nhãn hướng dẫn. Chạm một mặt úp để chọn; lá rời quạt và nằm úp trong ô đó. Tiến trình cập nhật ngay (`1/3` hoặc `1/5`). Các lá còn lại giữ nguyên ID và thứ tự.
3. **Hoàn thành bàn:** Khi đủ lá, quạt thu gọn và bàn trải trở thành trọng tâm. Trước khi lật, vẫn có thể hoàn tác lá vừa chọn; lá trở về đúng chỗ cũ. Đủ lá mới cho lật.
4. **Tự khám phá:** Chạm lá nào thì lật lá đó, hiện tên và lời dẫn ngắn theo vị trí. Nút **Lật tất cả** luôn có khi bàn đã đủ lá. Bản Tự chọn không tự lật theo đồng hồ.
5. **Đọc kết quả:** Sau khi lật đủ, hiện phần diễn giải đang có. Bàn trải vẫn ở đầu trang để người dùng nhìn lại các lá; riêng Yearly chuyển sang carousel hiện có và giữ ánh xạ từng khía cạnh.

Quạt bài cần vùng chọn rõ ràng. Nếu 9 lá chồng lên nhau làm vùng chạm quá nhỏ, dùng dải lá úp cuộn ngang với các lá đủ rộng; cả hai bố cục dùng cùng dữ liệu và tiến trình. Vuốt chỉ để duyệt lá, không chọn hoặc đổi ID. Nút **Chọn lá tiếp theo** lấy lá chưa chọn đầu tiên theo thứ tự đang hiển thị, rồi đưa vào ô đang sáng.

Người dùng được chọn ô đích còn trống ở Love và các khía cạnh còn trống ở Yearly sau lá Tổng quan. Sau mỗi lần đặt lá, mặc định chuyển sang ô trống tiếp theo theo thứ tự nhãn hiện có; người dùng vẫn có thể chọn ô trống khác. Trải 3 lá mở và Money điền lần lượt. Hoàn tác luôn bỏ lựa chọn gần nhất theo thời gian, kể cả khi người dùng đã đổi ô đích, rồi đưa ô vừa được giải phóng về trạng thái đang chọn. Sau lần lật đầu tiên, khóa cả chọn lá, đổi ô và hoàn tác; vẫn cho lật những lá còn úp.

### 2.3. Mở rộng sau: “Sợi chỉ” nối các lá trong kết quả

Sau khi luồng bốc bài mới đã được kiểm chứng, có thể thêm một khối tóm tắt ở trải nhiều lá. Khối này không phải điều kiện để phát hành cơ chế chọn/lật:

1. **Điểm chung:** chủ đề lặp lại giữa các lá, có nêu tên hoặc biểu tượng 2 lá làm căn cứ.
2. **Điểm cần cân nhắc:** hai lá kéo theo hai hướng khác nhau, hoặc một lá tạo ngoại lệ/cảnh báo.
3. **Một bước hôm nay:** hành động nhỏ, có thể thực hiện, gắn với lá và vị trí liên quan.

Ví dụ về *giọng điệu*, chưa phải lời giải chuẩn cho một tổ hợp thật: “Lá A và B cùng nhắc đến việc bắt đầu, nhưng lá C gợi một khoảng dừng để kiểm tra nguồn lực. Hôm nay hãy chọn một việc nhỏ có thể thử trong 15 phút.” Khi không có quan hệ đủ mạnh, dùng câu trung tính “Ba lá cho thấy ba góc nhìn…” và nêu rõ ý từng lá; không ép một kết luận giả tạo.

Người dùng có thể chạm biểu tượng **Vì sao?** để thấy mối liên hệ được rút từ đâu: lá nào, nhóm chất/nguyên tố, nhãn vị trí và từ khóa nào. Nhờ vậy, đoạn tổng hợp có thể kiểm tra được thay vì nghe như văn mẫu.

### 2.4. Mở rộng sau: “Mang theo một điều”

Sau phần kết quả, cho chọn một trong ba hành động: **Ghi một điều mình nhận ra**, **Chọn một bước nhỏ**, **Xem xong**. Tránh ép viết nhật ký. Bản đầu có thể chỉ giữ ghi chú trong lượt đang mở; giai đoạn sau mới thêm **Lưu lượt đọc** vào bộ nhớ trên máy và **Xem lại sau 3 hoặc 7 ngày** theo lựa chọn của người dùng. Khi mở lại, hỏi “Điều gì thực sự xảy ra?” và cho sửa nhận định cũ. Đây là đề xuất **mở rộng phạm vi** so với quyết định “chưa làm lịch sử” trong [overview](overview.md), nên triển khai sau khi luồng rút và kết quả đã được kiểm chứng.

## 3. Áp dụng cho sáu tính năng hiện có

| Tính năng | Thay đổi đề xuất | Giữ ranh giới hiện có |
| --- | --- | --- |
| **Daily** | Giữ cách lật lá trong ngày. Phần mở rộng 4 lá có thể thử bàn “lá neo và ba lá phụ” ở giai đoạn sau. | Lá Daily cố định theo ngày cho mọi người; giữ điều kiện mở khóa và giới hạn lượt mở rộng hiện có. |
| **Yes/No** | Giữ nghi thức rút 1 lá hiện tại. | Câu hỏi đầu vào vẫn tùy chọn; tránh giọng chắc chắn tuyệt đối. |
| **Love** | Bàn **hai phía và một điểm nối**: hai ô trên, ô thứ ba ở giữa bên dưới; chọn ô trống rồi chọn lá từ quạt. Đường nối hiện dần khi đặt đủ lá. | Giữ 3 nhãn đúng ngữ cảnh; không khẳng định chắc chắn suy nghĩ hay tình cảm của người thứ ba. |
| **Money** | Bàn **lộ trình ba bước**: Hiện trạng → Cơ hội–Trở ngại → Hành động. Mỗi lần chọn, lá tiến vào mốc đang sáng và hướng dẫn chuyển sang mốc kế tiếp. | Giữ 3 nhãn; nội dung là gợi ý suy ngẫm, không thành dự báo lợi nhuận hay lời khuyên đầu tư. |
| **Yearly** | Bàn **bản đồ năm**: Tổng quan ở giữa, bốn khía cạnh xung quanh. Chọn lá trung tâm trước, rồi tự chọn khía cạnh muốn điền tiếp. Đủ 5 lá mới bắt đầu lật. | Giữ Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe và carousel đọc kết quả. |
| **Trải 3 lá mở** | **Dãy bài không khung**: chọn 3 từ 9 lá úp; lá đã chọn nâng nhẹ tại chỗ, giữ nguyên độ rõ. Chọn đủ tự lật và trình bày ba lá ngang hàng. Câu hỏi tiếp tục đứng đầu kết quả. | Không gắn vai trò theo thứ tự chọn; số dưới lá úp chỉ là vị trí trong dãy. |

### 3.1. Trải 3 lá mở — quạt bài tự do

Nhập câu hỏi theo luồng hiện có → chọn Tự chọn lá → mở dãy 9 lá úp → chạm lá nào thì lá đó nâng nhẹ khoảng 24px; chạm lại để bỏ chọn khi mới chọn 1–2 lá → chọn đủ 3 lá → sau một nhịp ngắn khoảng 350ms, tự lật cả ba và thu gọn thành dãy ba lá kết quả → đọc ý nghĩa từng lá → Rút lại hoặc Đổi câu hỏi. Giữ ID lá cố định, không làm lá đã chọn mờ đi, không có ô trống hay nút lật thủ công.

**Ý nghĩa chức năng:** Ba lá cung cấp ba góc nhìn tổng quát cho một câu hỏi mở. Các lá ngang hàng, không gán Quá khứ/Hiện tại/Tương lai hay Bối cảnh/Bước ngoặt/Hành động theo thứ tự chọn. Phần tổng hợp nhắc người dùng đọc cả ba trong ngữ cảnh câu hỏi, thay vì phân vai cố định cho từng lá.

### 3.2. Love — hai phía và một điểm nối

Chọn ngữ cảnh hiện có → hiện bàn ba ô có nhãn theo ngữ cảnh đó → chạm ô muốn điền (mặc định ô đầu tiên) → chọn một lá từ quạt → lặp lại tới đủ ba lá → tự lật. Hai ô phía trên và ô dưới tạo cảm giác các góc nhìn gặp nhau; đường nối chỉ là phản hồi bố cục, không biểu thị điểm tương hợp hay kết luận trước khi đọc. Ngữ cảnh độc thân dùng đúng nhãn hiện có của độc thân, không tạo thêm một “đối phương”.

### 3.3. Money — lộ trình ba bước

Chọn ngữ cảnh hiện có → mốc Hiện trạng sáng lên → chọn lá thứ nhất → mốc Cơ hội–Trở ngại sáng lên → chọn lá thứ hai → mốc Hành động sáng lên → chọn lá thứ ba → tự lật. Trên màn dọc, lộ trình có thể xếp từ trên xuống với nhãn luôn nhìn thấy. Ba mốc được điền theo thứ tự; ý nghĩa từng lá chỉ hiện trong giai đoạn lật sau khi đã chọn đủ.

### 3.4. Yearly — bản đồ năm

Mở bàn gồm ô Tổng quan ở giữa và bốn ô khía cạnh xung quanh → chọn lá Tổng quan → chạm một khía cạnh còn trống rồi chọn lá cho ô đó → tiếp tục đến `5/5` → tự lật từng ô hoặc Lật tất cả → đọc bằng carousel hiện có. Thứ tự chọn tùy người dùng nhưng lá luôn gắn với khía cạnh đã chọn; thứ tự carousel vẫn là Tổng quan / Tình yêu / Sự nghiệp / Tài chính / Sức khỏe. Màn nhỏ có thể dùng ô Tổng quan phía trên và bốn ô theo lưới 2×2 phía dưới.

### 3.5. Daily mở rộng — lá neo và ba lá phụ (sau)

Lá Daily đã mở nằm ở đầu bàn, ba ô phụ giữ vai trò hiện có: lớp phía sau lá hôm nay / hỗ trợ hoặc thử thách / hành động hôm nay. Nếu bổ sung tự chọn cho lượt mở rộng mới, chỉ mở bàn chọn **sau khi đã nhận thưởng**, loại lá Daily và các lá phụ đã dùng trong ngày khỏi bộ ứng viên. Quyền mở lượt được lưu trước khi chọn để thoát hoặc resume không mất lượt, không phải xem lại quảng cáo. Lượt đã nhận đủ lá được mở lại đúng kết quả đã lưu. Giữ giới hạn tối đa 3 lượt mở rộng/ngày hiện có; chi tiết lưu lượt đang chọn cần được đặc tả trước khi làm phần này.

**Rút nhanh:** Hệ thống điền đủ lá vào bàn tương ứng rồi tự lật, dẫn tới cùng trang kết quả. Hết hoạt ảnh phải nhìn thấy tiêu đề và lá đầu tiên, không bị cuộn lệch hoặc quảng cáo che nút.

## 4. Nội dung và kỹ thuật cần để làm được

### Dữ liệu diễn giải (giai đoạn sau)

Bản đầu của cơ chế bốc bài dùng nội dung từng lá, nhãn và phần tổng hợp hiện có. Các mục dưới đây phục vụ phần “sợi chỉ”, được triển khai riêng sau khi tương tác mới đã ổn định.

- Tận dụng `meaning`, `advice`, từ khóa và nội dung lá đã mở rộng trong `text-card-plan`. Bổ sung metadata có cấu trúc cho **78 lá xuôi**: chủ đề chính, nhóm chất, sắc thái (mở rộng/điều chỉnh/tạm dừng), gợi ý hành động; cả tiếng Việt và tiếng Anh cần tương ứng.
- Xây bộ quy tắc theo tầng: (1) vị trí/ngữ cảnh, (2) tương đồng và tương phản về chủ đề/nhóm chất, (3) một số cặp đặc biệt được biên tập, (4) câu dự phòng trung tính. Không viết tay mọi hoán vị của 78 lá và không dùng ghép câu bất kỳ.
- Mỗi câu tổng hợp phải lưu được `cardIds` và `ruleId` tạo ra nó để kiểm tra nội dung, sửa bản dịch và hiển thị “Vì sao?”. Tránh lặp nguyên văn cả đoạn `meaning` trong tóm tắt.
- Kiểm thử biên tập bằng bộ tổ hợp cố định: cùng chất, trái sắc thái, ba Major, ba Minor, lá có nghĩa khó, và trường hợp không khớp quy tắc. Kiểm tra riêng bản Việt để câu tự nhiên, không mất cân đối trên màn nhỏ.

### Trạng thái rút và lưu trữ

- Dùng một cơ chế chọn chung với cấu hình `cardCount`, `layout`, `slots`, `selectionOrder` cho bốn bàn trải. Bố cục chỉ quyết định cách hiển thị và ô đích; logic xáo/chọn không viết lại riêng theo từng màn. Nhãn Love lấy từ ngữ cảnh hiện có, không hard-code một bộ nhãn cho mọi trường hợp.
- Tách `shuffling → selecting → revealing → result` cho chế độ Tự chọn; đủ lá mới chuyển sang `revealing`. Chế độ Rút nhanh có thể bỏ qua `selecting`. Một lượt rút giữ snapshot gồm `mode`, loại bàn trải, câu hỏi/ngữ cảnh, thứ tự lá đã xáo, 9 ID ứng viên, lịch sử chọn, ánh xạ ID vào ô, ô đang chọn và trạng thái lật. Route back/rotate/resume không được xáo lại vô tình.
- Giữ logic `drawCardsFromDeck` hiện tại làm cơ sở cho Rút nhanh; tạo API chọn lá riêng dùng cùng nguyên tắc không lặp. Với cùng một snapshot, chọn cùng mặt úp phải cho cùng lá. Khi rút lại, tạo snapshot mới có chủ đích.
- Nếu làm lưu lượt đọc ở giai đoạn sau: lưu cục bộ, cho xóa từng mục và xóa hết; không đòi tài khoản. Chỉ xin quyền thông báo khi người dùng chủ động đặt nhắc xem lại. Câu hỏi riêng tư không dùng cho nội dung quảng cáo hoặc analytics.

### Hiệu năng, giao diện, tiếp cận

- Quạt/dải 9 lá úp chỉ vẽ **một asset mặt sau** lặp lại, không giải mã trước 78 ảnh mặt trước. Chỉ tải ảnh các lá đã chọn, ưu tiên ảnh lá sắp lật. Có khung giữ kích thước để nội dung không nhảy khi ảnh hiện.
- Giới hạn hiệu ứng đồng thời; dùng `transform`/`opacity`, tránh blur/particle dày. Chế độ giảm chuyển động vẫn cho chọn và lật ngay. Đo dropped frames trên điện thoại Android từng bị lag khi mở 78 asset và ở home sáu tính năng.
- Vùng chạm tối thiểu 44×44 CSS px, không để phần quạt chồng nhau tạo vùng chọn quá hẹp. Nhãn đọc màn hình “Lá úp 3 trong 9”, nhãn ô đích và thông báo “Đã chọn 2 trên 3 lá”; hỗ trợ bàn phím. Vị trí và tiến trình cần chữ/viền rõ ràng bên cạnh màu sáng. Bố cục kết quả giữ đủ lề, chiều cao chữ Việt và khoảng trống dưới cùng cho thanh điều hướng, banner và safe area.
- Không phát quảng cáo xen giữa lúc đang chọn/lật hoặc trước khi người dùng kịp đọc kết quả. Nếu giữ quảng cáo toàn màn hình, đặt ở điểm thoát/rút lượt khác; kiểm tra banner không che CTA hay thanh điều hướng trên máy thật.

## 5. Thứ tự làm và tiêu chí nghiệm thu

| Giai đoạn | Phạm vi | Công sức tương đối | Chỉ xem là xong khi… |
| --- | --- | --- | --- |
| **P0 — Mẫu thử** | Dãy 9 lá không khung; chọn nâng lá, bỏ chọn, đủ 3 tự lật và Rút nhanh. | S | 5–8 người dùng hiểu cách chọn không cần hướng dẫn; đo nhầm chạm, thời gian và chỗ bỏ cuộc; kiểm tra màn Android nhỏ. |
| **P1 — Bốc bài nhiều lá** | Hoàn thiện cơ chế chung và bốn bàn: trải 3 lá, Love, Money, Yearly; dùng nội dung hiện có. | M–L | Home vẫn đủ 6 mục; chọn đúng 3/3/3/5 lá; không lặp lá; ô đích và nhãn đúng; hoàn tác đúng ID; không đổi kết quả sau resume; cả Tự chọn/Rút nhanh chạy được khi giảm chuyển động. |
| **P2 — Diễn giải và Daily mở rộng** | Thử “sợi chỉ”, “Vì sao?”; đặc tả quyền mở lượt đang chọn rồi thử bàn lá neo cho Daily mở rộng. | L | Tóm tắt có căn cứ hoặc fallback hợp nghĩa; Daily cố định; lượt mở rộng không mất quyền sau resume, không lặp lá đã dùng và giữ giới hạn hiện có. |
| **P3 — Xem lại và học (tùy chọn)** | Lưu lượt đọc, bước nhỏ, xem lại sau 3/7 ngày; tùy chọn tập đọc hình và từ khóa. | M | Chỉ làm khi có nhu cầu đã được kiểm chứng; không cần tài khoản; xóa được dữ liệu; thông báo hoàn toàn tự nguyện. |

**Đo tác dụng của thay đổi:** So với luồng hiện tại, đo tỷ lệ hoàn tất lượt rút, thời gian đến kết quả, tỷ lệ dùng Rút nhanh, nhầm chạm và bỏ cuộc theo từng bàn. Hỏi người dùng có cảm thấy mình đã chọn lá, có biết đang chọn cho vị trí nào và có biết cách lật hay không. Khi làm P2 mới đo việc hiểu mối liên hệ và mở “Vì sao?”; P3 mới đo nhu cầu lưu và quay lại xem. Dùng cùng nhóm máy cho số liệu khung hình và thời gian tải. Đặt ngưỡng phát hành sau khi đã có baseline trên máy thật.

## 6. Hướng đã xác định và chi tiết cần thử

1. **Đã xác định:** giữ sáu mục chức năng riêng; tập trung làm mới cách bốc bài ở các chức năng nhiều lá. Giữ bộ 78 lá xuôi, Daily cố định, số lá và ngữ cảnh hiện có.
2. **Đề xuất thử đầu tiên:** Tự chọn lá + Rút nhanh, quạt 9 lá và bàn trải 3 lá mở. Thử vùng chạm để chọn giữa quạt bài và dải cuộn ngang trên màn nhỏ.
3. **Đề xuất cho bản đầu:** dùng cơ chế chung, tạo bàn riêng cho Love, Money và Yearly. Kiểm chứng việc chọn ô tự do ở Love/Yearly và điền theo thứ tự ở Money trước khi triển khai đầy đủ.
4. **Để sau:** tổng hợp có metadata, “Vì sao?”, Daily mở rộng và lịch sử/nhắc xem lại. Phần lịch sử vẫn là mở rộng phạm vi so với bản thiết kế ban đầu.

## 7. Kiểm tra triển khai lần lượt

**Vòng 1 — Trải 3 lá mở:** Đã chỉnh luồng Tự chọn/Rút nhanh ở `/tarot/3-card-spread` theo phản hồi: dãy 9 lá không khung/ô trống, chạm nâng lá, chạm lại bỏ chọn, đủ 3 tự lật. Phần tổng hợp đã bỏ vai trò cố định theo thứ tự lá. Lượt đang xem được giữ bằng sessionStorage trong cùng tab; lựa chọn chế độ được ghi nhớ trên máy. Chờ kiểm tra trực quan và thao tác trên thiết bị trước khi chuyển sang bàn Love.

Checklist xem thử:

1. Nhập câu hỏi hoặc dùng gợi ý → Tự chọn lá → Chọn 3 lá. Chỉ hiện dãy bài và hướng dẫn ngắn; chưa lộ tên/ảnh mặt trước.
2. Chọn một lá bất kỳ: lá chỉ nâng tại chỗ, không mờ hoặc bay vào ô; tiến trình thành `1/3`. Vuốt để chọn các lá phía cuối quạt.
3. Chạm lại lá đã chọn trước khi đủ 3 để bỏ chọn. Chọn lại đúng vị trí đó vẫn nhận đúng ID đã gắn ban đầu.
4. Chọn đủ 3: tự lật sau một nhịp ngắn, hiện ba lá và ý nghĩa từng lá. Không có bước bấm Lật tất cả hay vai trò cố định theo vị trí.
5. Mỗi lần mở chức năng từ Home hoặc tải lại tab đều hiện phần đặt câu hỏi trước, có thể sửa câu hỏi gần nhất. Chỉ bấm bắt đầu sau khi có câu hỏi mới mở dãy bài và tạo lượt rút; snapshot cũ không tự đưa người dùng vào chọn bài/kết quả. Trong lượt đang mở, giữ nguyên ID khi chọn/bỏ chọn; Rút lại tạo lượt mới cho cùng câu hỏi.
6. Đổi câu hỏi → Rút nhanh: tự chọn và lật đủ ba lá. Kiểm tra lại với chế độ giảm chuyển động, màn nhỏ và chữ Việt dài; kết quả không bị banner che.

Các vòng tiếp theo theo thứ tự: **Love → Money → Yearly**. Daily mở rộng giữ ở giai đoạn sau như phạm vi bên trên.

## Tài liệu tham khảo

- [Labyrinthos — ứng dụng và các tính năng trải bài, tự chọn lá, nhật ký](https://labyrinthos.co/pages/app)
- [Labyrinthos — chọn lá sau khi xáo, nhật ký và học Tarot](https://app.labyrinthos.co/)
- [Mystic Mondays — Daily, lịch, nhật ký và insight](https://shop.mysticmondays.com/pages/app)
