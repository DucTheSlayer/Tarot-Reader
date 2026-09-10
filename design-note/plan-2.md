# Kế hoạch nâng sắc thái cho các trải bài Tarot

## Mục tiêu

Làm cho Love Tarot, Money Tarot, Yes or No và 3 Card Spread có cảm xúc, nhịp điệu và nhận diện riêng; đồng thời đưa Yearly Tarot thành trải nghiệm 5 lá đặc trưng nhất. Người dùng cần nhận ra mình đang bước vào một kiểu trải bài khác ngay từ màn hình đầu, nhưng vẫn thấy quen thuộc khi rút bài và đọc kết quả.

Kế hoạch này chỉ định hướng trải nghiệm và hình ảnh. Không thay đổi route, dữ liệu bài, số lá rút, thứ tự thông tin, logic ngẫu nhiên, trạng thái `initial → drawing → result`, hay hành động Draw Again/Back hiện có.

## Nguyên tắc chung

- Giữ nền đêm huyền bí và typography hiện tại làm ngôn ngữ chung của toàn bộ Tarot.
- Mỗi tính năng có một accent màu, hình tượng và nhịp chuyển động riêng; không biến thành bốn giao diện hoàn toàn xa lạ.
- Màu chỉ tăng cảm xúc, không mang ý nghĩa kết quả duy nhất. Mọi kết quả vẫn có nhãn chữ rõ ràng.
- Chuyển động hướng sự chú ý vào lá bài và phần diễn giải, không kéo dài quá mức hoặc che nội dung.
- Phương án reduced-motion luôn dùng thay đổi opacity/độ nhấn tĩnh, vẫn giữ đầy đủ thông tin và thứ tự trải nghiệm.
- Không dùng biểu tượng tiền, cờ bạc, trái tim bay dày đặc hoặc hiệu ứng quá giống game.

## 1. Love Tarot — “Sợi dây kết nối”

### Cảm xúc muốn tạo

Ấm, riêng tư, giàu suy ngẫm. Đây là trải bài về mối quan hệ giữa hai người, không phải một màn “tình yêu” ngọt ngào chung chung.

### Hướng hình ảnh

- Accent: tím mận, hồng tro và ánh champagne dịu.
- Nền: quầng sáng mờ như hoàng hôn phía sau lá bài; số sao ít hơn nền chung để màn hình bớt lạnh.
- Hình tượng: một đường chỉ sáng rất mảnh, hai đầu hội tụ về lá “Kết nối”.
- Card frame: glow mềm, viền ánh hồng chỉ xuất hiện khi lá đã lật.

### Ba ngữ cảnh và ý nghĩa của ba lá

Việc chọn ngữ cảnh phải làm thay đổi cách người dùng hiểu ba lá, thay vì chỉ đổi một câu giới thiệu. Ngay sau khi chọn ngữ cảnh, màn hình hiển thị một sơ đồ ba vị trí có nhãn ngắn và dòng dẫn **“Trải bài này dùng 3 lá”**.

| Ngữ cảnh | Lá 1 | Lá 2 | Lá 3 | Cách bố trí |
| --- | --- | --- | --- | --- |
| Độc thân | Bạn lúc này | Điều cần mở lòng | Hướng kết nối mới | Lá 1 ở giữa, lá 2 và 3 mở dần sang hai phía như một cánh cửa |
| Đang tìm hiểu | Cảm xúc của bạn | Tín hiệu từ người ấy | Tiềm năng giữa hai người | Hai lá đầu hơi hướng vào nhau; lá 3 nằm dưới, còn mờ trước khi lật |
| Trong mối quan hệ | Bạn | Đối phương | Năng lượng giữa hai người | Hai lá đầu đối diện rõ ràng; lá 3 ở giữa hoặc phía dưới như một cây cầu |

Không dùng cùng nhãn **Bạn / Đối phương / Kết nối** cho ngữ cảnh Độc thân vì người dùng có thể chưa có một người cụ thể trong tâm trí. Ngữ cảnh Đang tìm hiểu dùng từ “tín hiệu” và “tiềm năng” để tránh khẳng định chắc chắn cảm xúc của người khác.

### Cách giúp người dùng hiểu thao tác rút ba lá

#### Trước khi rút

- Sau khi chọn ngữ cảnh, hiển thị ba lá úp thu nhỏ hoặc ba khung trống theo đúng bố cục sắp được dùng.
- Mỗi khung có số và nhãn: **1 · Bạn**, **2 · Đối phương**, **3 · Kết nối**; nhãn thay đổi tương ứng với bảng ngữ cảnh phía trên.
- Thêm một câu giải thích ngắn dưới sơ đồ. Ví dụ với “Trong mối quan hệ”: **“Ba lá sẽ soi chiếu bạn, đối phương và năng lượng đang kết nối hai người.”**
- CTA ghi rõ **“Rút 3 lá”** thay vì chỉ “Rút bài”, giúp người dùng biết trước số lượng lá.

#### Trong khi rút

- Trước khi mỗi lá đi vào vị trí, hiện nhãn ngắn ở chính vị trí đó; người dùng không phải chờ đến màn kết quả mới biết lá đại diện cho điều gì.
- Có chỉ báo nhỏ theo tiến trình: **Lá 1/3 · Bạn → Lá 2/3 · Đối phương → Lá 3/3 · Kết nối**. Chỉ báo đổi theo ngữ cảnh, không thêm bước tương tác mới.
- Lá vừa được đặt giữ sáng, các vị trí chưa tới vẫn ở trạng thái mờ. Nhờ vậy người dùng luôn biết animation đang ở bước nào.
- Sau lá thứ ba, giữ toàn bộ ba nhãn trên màn hình thêm một nhịp ngắn trước khi chuyển sang phần diễn giải.

#### Khi xem kết quả

- Giữ nguyên vị trí và nhãn đã xuất hiện trong animation; không sắp xếp lại ba lá khi chuyển trạng thái.
- Phần diễn giải đi cùng thứ tự thị giác: Lá 1 → Lá 2 → Lá 3 → thông điệp tổng hợp.
- Lá thứ ba có tiêu đề cụ thể theo ngữ cảnh, tránh dùng một nhãn chung chung cho mọi trường hợp.
- Dùng một câu nối trước phần tổng hợp, ví dụ: **“Khi đặt ba góc nhìn cạnh nhau…”**, để người dùng hiểu vì sao cần đủ ba lá.

### Nhịp animation

- Trước khi rút, ba vị trí hiện như ba điểm sáng tĩnh kèm nhãn; không hiện quá nhiều trang trí.
- Với “Trong mối quan hệ”, lá “Bạn” đi từ trái, lá “Đối phương” đi từ phải và hai lá nghiêng nhẹ vào nhau. Lá “Năng lượng giữa hai người” đi lên từ dưới, dừng giữa hai người như một cây cầu.
- Với “Đang tìm hiểu”, hai lá đầu chỉ nghiêng rất nhẹ; lá “Tiềm năng” xuất hiện sau cùng với ánh sáng mờ hơn để thể hiện điều chưa chắc chắn.
- Với “Độc thân”, lá “Bạn lúc này” xuất hiện trước ở trung tâm; hai lá còn lại mở sang hai phía để tạo cảm giác hướng ra cơ hội mới.
- Khi lá cuối lật, đường chỉ sáng nối ba điểm trong một nhịp ngắn rồi hạ độ sáng để không cạnh tranh với phần đọc bài.

### Chuyển nền sau khi lật đủ ba lá

Khi lá thứ ba lật xong, nền chuyển từ màu đêm Tarot chung sang một lớp gradient riêng cho ngữ cảnh. Đây là tín hiệu cho biết trải bài đã hoàn chỉnh và phần diễn giải có thể bắt đầu; nền không đổi sau từng lá để tránh gây phân tán.

| Ngữ cảnh | Gradient kết quả đề xuất | Cảm giác |
| --- | --- | --- |
| Độc thân | Tím mận đậm → hồng tro → một quầng champagne nhỏ phía sau lá trung tâm | Ấm lên, mở ra khả năng mới |
| Đang tìm hiểu | Indigo đậm → tím violet → hồng lavender mờ ở vùng lá “Tiềm năng” | Lãng mạn nhưng vẫn còn khoảng chưa rõ |
| Trong mối quan hệ | Đỏ rượu trầm ở phía lá “Bạn” + xanh midnight ở phía lá “Đối phương”, hòa thành tím mận/champagne tại lá kết nối | Hai cá tính gặp nhau ở vùng trung tâm |

- Gradient chuyển trong khoảng 500–700 ms bằng fade/cross-fade mềm, không đổi màu đột ngột và không dùng flash toàn màn hình.
- Quầng sáng tập trung phía sau lá thứ ba; rìa màn hình vẫn tối để card và nội dung giữ tương phản.
- Khi cuộn xuống phần diễn giải, nền giữ trạng thái kết quả nhưng giảm saturation nhẹ để đoạn văn dài dễ đọc.
- Màu nền không thay đổi theo ý nghĩa tốt/xấu của lá, tránh khiến người dùng hiểu gradient là một verdict.
- Với reduced-motion, bỏ hiệu ứng lan màu; đổi trực tiếp sang gradient kết quả bằng fade opacity ngắn.

### Kết quả

- Giữ layout/slot hiện có, tăng phân cấp thị giác theo ngữ cảnh. Trong “Trong mối quan hệ”, hai lá đầu là hai góc nhìn và lá “Năng lượng giữa hai người” là trọng tâm. Trong “Độc thân”, lá đầu là trọng tâm và hai lá sau mở ra hướng phát triển.
- Khối tổng kết dùng nền chuyển sắc tím mận rất nhẹ. Tiêu đề thay đổi theo ngữ cảnh, ví dụ **“Điều đang kết nối hai bạn”**, **“Tiềm năng của kết nối này”** hoặc **“Cánh cửa tình cảm đang mở ra”**.

## 2. Money Tarot — “Bản đồ quyết định”

### Cảm xúc muốn tạo

Điềm tĩnh, thực tế, sáng rõ. Trải bài nên gợi cảm giác định hướng chứ không hứa hẹn tài lộc.

### Hướng hình ảnh

- Accent: xanh ngọc đậm, xanh than và vàng đồng.
- Nền: các đường lưới/bản đồ mảnh, rất mờ, gợi cấu trúc và lựa chọn.
- Hình tượng: một đường hành trình gồm ba mốc, kết thúc ở “Hành động”.
- Card frame: cạnh sắc hơn Love một chút, ánh đồng ngắn khi lá đáp vào vị trí.

### Nhịp animation

- Lá xuất hiện theo chiều từ trái sang phải như một lộ trình: Hiện trạng → Cơ hội–Trở ngại → Hành động.
- Sau mỗi lá, mốc tương ứng trên đường hành trình sáng lên; sau lá cuối, đường dừng ở mốc Hành động thay vì phát sáng liên tục.
- Tốc độ chắc, gọn và đều; tránh bounce, confetti, đồng xu hoặc hiệu ứng “trúng thưởng”.

### Kết quả

- Dùng tiến trình ba bước rõ ràng; số thứ tự nhỏ giúp người dùng đọc theo luồng.
- Khối tổng kết chia cảm nhận thành “Cơ hội”, “Điều cần thận trọng” và “Bước tiếp theo”, với accent xanh ngọc/vàng đồng vừa đủ.

## 3. Yes or No — “Khoảnh khắc phán quyết”

### Cảm xúc muốn tạo

Tập trung và dứt khoát. Đây là trải bài nhanh, vì vậy bản sắc nằm ở khoảng lặng trước khi lật và cách verdict xuất hiện.

### Hướng hình ảnh

- Accent trung tính trước khi lật: bạc tím và vàng nhạt.
- Khi có verdict, dùng một quầng sáng theo trạng thái hiện có: xanh ngọc cho Yes, san hô trầm cho No, vàng hổ phách cho Maybe, tím bạc cho Unclear.
- Hình tượng: vòng cung/oracle ring rất mảnh sau lá bài, không dùng biểu tượng tick hoặc cross khổng lồ.

### Nhịp animation

- Sau khi người dùng bấm rút, toàn bộ nội dung phụ lùi nhẹ để chỉ còn câu hỏi và một lá bài trung tâm.
- Có khoảng dừng ngắn trước khi lật để tạo nhịp; verdict hiện sau khi mặt bài ổn định, không đồng thời với cú lật.
- Quầng verdict mở ra một lần rồi tắt dần. Mục tiêu là tạo điểm nhấn, không phải hiệu ứng loading.

### Kết quả

- Verdict là tiêu đề chính; lá bài là bằng chứng trực quan; phần “Vì sao” và “Gợi ý” dẫn người dùng trở lại suy ngẫm.
- Câu hỏi của người dùng hiển thị như một dòng quote nhỏ để giữ bối cảnh cá nhân.

## 4. 3 Card Spread — “Ba góc nhìn mở”

### Cảm xúc muốn tạo

Thoáng, tò mò và có không gian suy ngẫm. Vì không gán nghĩa cố định cho từng vị trí, màn hình không nên trông như một timeline hoặc verdict.

### Hướng hình ảnh

- Accent: xanh midnight, bạc khói và điểm sáng xanh lam nhạt.
- Nền: ba vùng sáng đan nhẹ như ba cửa sổ nhìn vào cùng một câu hỏi.
- Hình tượng: ba chấm sao độc lập; chỉ khi đủ ba lá mới xuất hiện một liên kết rất mảnh ở hậu cảnh.
- Card frame: sáng đồng đều, không có lá nào được ưu tiên về màu trước khi người dùng đọc nội dung.

### Nhịp animation

- Ba lá được đặt thành một hàng/khung cân bằng rồi chờ người dùng mở, nhấn vào sự chủ động thay vì lật tuần tự bắt buộc.
- Mỗi lần mở một lá có hiệu ứng “focus”: các lá còn lại giảm độ sáng nhẹ, lá đang mở tăng độ rõ.
- Sau lá thứ ba, ba điểm sao liên kết trong nền và khối Combined Message đi lên bằng fade ngắn.

### Kết quả

- Không thêm nhãn vị trí mới. Giữ mỗi lá như một góc nhìn ngang hàng.
- Combined Message dùng nền xanh midnight pha bạc, giúp khác Love/Money nhưng vẫn thuộc hệ Tarot.

## 5. Thay hình quạt 5 lá dùng chung

Hình quạt 5 lá không nên tiếp tục là hình mở đầu mặc định cho mọi trải bài. Nó làm người dùng hiểu sai số lá sắp rút và khiến các tính năng trông giống nhau. Quạt 5 lá chỉ nên thuộc về Yearly Tarot, vì đây là trải bài duy nhất thực sự rút 5 lá.

| Tính năng | Hình mở đầu thay thế |
| --- | --- |
| Yes or No | Một lá úp đứng giữa vòng oracle; toàn bộ sự chú ý hướng vào một lựa chọn |
| Love Tarot | Ba khung/lá úp theo bố cục của ngữ cảnh: mở cánh cửa, hai người đang tìm hiểu hoặc hai người đối diện với lá kết nối |
| Money Tarot | Ba lá úp đặt trên một đường tiến trình có ba mốc: Hiện trạng → Cơ hội–Trở ngại → Hành động |
| 3 Card Spread | Ba lá úp ngang hàng như ba cửa sổ độc lập, bao quanh câu hỏi của người dùng |
| Yearly Tarot | Năm lá tạo thành “Vòng bản đồ năm”; đây là nơi duy nhất dùng hình ảnh 5 lá làm hero |

Các hình mở đầu thể hiện đúng số lá nhưng chỉ mang tính giới thiệu; không lật mặt, không chọn lá trước và không làm thay đổi kết quả rút.

## 6. Yearly Tarot — “Vòng bản đồ năm”

### Ý tưởng trung tâm

Thay quạt bài thông thường bằng một vòng tròn như mặt đồng hồ thiên văn. Lá **Tổng quan** nằm ở trung tâm như “North Star”; bốn lá **Tình yêu**, **Sự nghiệp**, **Tài chính** và **Sức khỏe** nằm quanh nó. Một vòng mảnh có 12 vạch sáng tượng trưng cho 12 tháng giúp người dùng hiểu đây là trải bài cho cả năm.

Không dùng 12 lá hoặc gán mỗi lá cho một quý/tháng, vì nội dung hiện tại vẫn là 5 khía cạnh. Mười hai vạch chỉ là hình tượng thời gian.

### Bố cục màn hình mở đầu

```text
                 [ Tình yêu ]

       [ Sự nghiệp ]     [ Tài chính ]

                [ Tổng quan ]

                  [ Sức khỏe ]
```

Bố cục thực tế có thể cân thành vòng cung để vừa mobile portrait. Lá Tổng quan lớn hơn nhẹ; bốn lá khía cạnh chỉ hé một phần mặt lưng. Nhãn ngắn nằm cạnh từng điểm trên vòng để người dùng biết rõ năm lá sẽ trả lời điều gì trước khi bắt đầu.

### Khoảnh khắc trước khi rút

- Vòng năm quay rất chậm hoặc có một vệt sáng đi qua 12 mốc; các lá không bay lơ lửng cùng nhịp với những màn khác.
- Dòng dẫn: **“Năm lá soi chiếu Tổng quan, Tình yêu, Sự nghiệp, Tài chính và Sức khỏe trong 12 tháng tới.”**
- CTA có thể dùng **“Mở bản đồ năm”** hoặc giữ **“Rút bài cho năm của tôi”**, nhưng luôn nói rõ đây là 5 lá.
- Màu chủ đạo: midnight blue, tím thiên thanh và vàng sao; vùng trung tâm có ánh champagne nhỏ như sao Bắc Cực.

### Animation rút 5 lá

1. Mười hai mốc trên vòng sáng lên theo chiều kim đồng hồ trong một vòng ngắn.
2. Lá Tổng quan đi vào giữa và lật trước, tạo điểm neo cho toàn bộ trải bài.
3. Bốn lá khía cạnh xuất hiện lần lượt quanh tâm theo đường quỹ đạo ngắn; mỗi vị trí sáng lên cùng nhãn của nó.
4. Khi đủ 5 lá, các đường mảnh nối về lá Tổng quan, tạo thành một chòm sao/bản đồ hoàn chỉnh.
5. Toàn bộ sơ đồ thu gọn thành progress map; phần kết quả chuyển sang carousel hiện có để người dùng đọc từng lá ở kích thước lớn.

Animation nên dài khoảng 2.4–3 giây. Không lật năm lá với năm animation đầy đủ nối tiếp vì sẽ tạo cảm giác chờ lâu. Lá Tổng quan có nhịp lật rõ; bốn lá còn lại dùng stagger nhanh hơn.

### Trạng thái kết quả

- Giữ carousel ngang để nội dung và ảnh lá bài đủ lớn trên điện thoại.
- Phía trên carousel giữ một phiên bản thu nhỏ của Vòng bản đồ năm. Điểm đang được xem sáng lên và đường nối về Tổng quan được nhấn mạnh.
- Sau khi người dùng đã xem đủ năm lá, vòng tròn hoàn tất bằng một quầng sáng nhẹ rồi mở **Your North Star** như hiện tại.
- Nền kết quả chuyển sang gradient midnight → tím thiên thanh, với một quầng vàng rất mờ tại vị trí North Star; không đổi màu theo lá tốt/xấu.

### Reduced motion

- Hiện thẳng năm vị trí trên Vòng bản đồ năm, không quay vòng hoặc bay theo quỹ đạo.
- Dùng fade ngắn khi đổi từ sơ đồ sang carousel.
- Giữ đầy đủ nhãn, progress map và trạng thái đã xem.

## Hệ màu và nhịp điệu tóm tắt

| Tính năng | Hình tượng | Accent chính | Nhịp |
| --- | --- | --- | --- |
| Love Tarot | Sợi dây kết nối | Tím mận, hồng tro, champagne | Mềm, hội tụ |
| Money Tarot | Bản đồ quyết định | Xanh ngọc, xanh than, vàng đồng | Rõ bước, đi tới |
| Yes or No | Vòng phán quyết | Bạc tím trước khi lật; accent theo verdict sau đó | Ngắn, dứt khoát |
| 3 Card Spread | Ba góc nhìn | Midnight, bạc khói, xanh lam nhạt | Tĩnh, khám phá |
| Yearly Tarot | Vòng bản đồ năm / North Star | Midnight, tím thiên thanh, vàng sao | Theo quỹ đạo, hoàn tất |

## Lộ trình thiết kế đề xuất

### Giai đoạn 1 — Chốt art direction

1. Lập moodboard nhỏ cho từng tính năng, mỗi moodboard gồm màu, texture nền, card frame và một hình tượng chủ đạo.
2. Chốt palette có độ tương phản đủ cho chữ tiếng Việt trên màn hình nhỏ.
3. Vẽ bốn state tĩnh cho mỗi flow: initial, drawing, result và reduced-motion.

### Giai đoạn 2 — Prototype chuyển động

1. Làm storyboard 6–10 khung cho mỗi animation thay vì bắt đầu bằng hiệu ứng dài.
2. Kiểm tra nhịp trên màn hình dọc 360–430 px và giới hạn tổng chuyển động: Yes or No 1.5–2 giây; các trải ba lá 2–3 giây.
3. Kiểm tra kết quả vẫn đọc được khi animation bị tắt hoàn toàn.

### Giai đoạn 3 — Review trải nghiệm

1. So sánh năm màn hình đặt cạnh nhau: người xem có gọi đúng tên tính năng chỉ từ initial state hay không.
2. Kiểm tra màu accent không lấn át ảnh lá bài và không làm phần diễn giải dài khó đọc.
3. Kiểm tra người dùng vẫn hiểu mọi hành động Draw, Reveal, Draw Again và Back như trước.

## Tiêu chí hoàn thành

- Mỗi trải bài có ít nhất một hình tượng, palette và nhịp animation nhận diện được.
- Năm tính năng vẫn thuộc cùng một ứng dụng Tarot, không bị rời rạc về font, spacing, card và CTA.
- Hình quạt 5 lá không còn xuất hiện như hero dùng chung; mỗi màn mở đầu thể hiện đúng số lá của trải bài.
- Yearly Tarot là trải nghiệm duy nhất dùng hình tượng 5 lá và có Vòng bản đồ năm nhận diện rõ ràng.
- Luồng hiện tại không đổi: số lá, cách chọn context/câu hỏi, thao tác người dùng và nội dung kết quả giữ nguyên.
- Không có animation liên tục gây xao nhãng; reduced-motion luôn có phương án tĩnh tương đương.
- Love không trở nên sến, Money không mang cảm giác cờ bạc, Yes or No không giống màn thắng/thua, và 3 Card Spread không bị gán nghĩa vị trí.
