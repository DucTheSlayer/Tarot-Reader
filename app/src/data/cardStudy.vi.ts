import type { TarotCard, TarotSuit } from '../types/tarotCard'

type StudyNote = { label: string; meaning: string }

export const suitStudy: Record<TarotSuit, StudyNote> = {
  wands: { label: 'Gậy · Lửa', meaning: 'Nói về động lực, sức sáng tạo và điều bạn muốn bắt tay làm.' },
  cups: { label: 'Cốc · Nước', meaning: 'Gợi đến cảm xúc, các mối quan hệ và cách bạn đón nhận điều đang xảy ra.' },
  swords: { label: 'Kiếm · Khí', meaning: 'Liên quan đến suy nghĩ, lời nói, lựa chọn và sự thật cần nhìn rõ.' },
  pentacles: { label: 'Tiền · Đất', meaning: 'Gắn với công việc, nguồn lực, cơ thể và những gì cần chăm chút lâu dài.' }
}

export const rankStudy: Record<number, StudyNote> = {
  1: { label: 'Át · Hạt giống', meaning: 'Một khả năng mới vừa xuất hiện. Hãy nhận ra nó trước khi chờ một kết quả lớn.' },
  2: { label: 'Hai · Cân nhắc', meaning: 'Hai phía cùng hiện diện: một sự kết nối, lựa chọn hoặc thế cân bằng cần tìm.' },
  3: { label: 'Ba · Mở rộng', meaning: 'Điều đã bắt đầu cần thêm người, thêm góc nhìn hoặc một bước phát triển.' },
  4: { label: 'Bốn · Nền tảng', meaning: 'Hãy xem điều gì đang giúp bạn đứng vững và điều gì cần được sắp xếp lại.' },
  5: { label: 'Năm · Va chạm', meaning: 'Sự ổn định bị thử thách; căng thẳng có thể chỉ ra điều cần thay đổi.' },
  6: { label: 'Sáu · Điều chỉnh', meaning: 'Sau thử thách là lúc tìm lại nhịp, trao nhận sự giúp đỡ hoặc ghi nhận tiến bộ.' },
  7: { label: 'Bảy · Kiên định', meaning: 'Bạn cần xem lại niềm tin và giữ vững điều thực sự đáng theo đuổi.' },
  8: { label: 'Tám · Chuyển động', meaning: 'Sự tập trung và việc làm đều đặn đưa câu chuyện tiến thêm một chặng.' },
  9: { label: 'Chín · Gần đích', meaning: 'Hãy nhìn những gì đã tích lũy, đồng thời nhận ra giới hạn của mình.' },
  10: { label: 'Mười · Trọn một vòng', meaning: 'Một chặng đi đến kết quả; điều bạn đã gây dựng cũng có thể mở ra vòng mới.' },
  11: { label: 'Tiểu đồng · Học hỏi', meaning: 'Đón nhận thông tin hoặc cơ hội mới bằng thái độ tò mò, sẵn sàng thử.' },
  12: { label: 'Hiệp sĩ · Theo đuổi', meaning: 'Năng lượng muốn tiến lên rất mạnh; chọn hướng đi trước khi tăng tốc.' },
  13: { label: 'Nữ hoàng · Nuôi dưỡng', meaning: 'Thể hiện sức mạnh qua sự thấu hiểu, chăm sóc và làm chủ từ bên trong.' },
  14: { label: 'Nhà vua · Dẫn dắt', meaning: 'Dùng kinh nghiệm và trách nhiệm để tạo hướng đi bền vững cho mình và người khác.' }
}

// Những chi tiết này được đối chiếu với tranh đang dùng trong app.
// Phần diễn giải là gợi ý để quan sát, không phải quy tắc dự đoán cố định.
export const artworkStudy: Record<string, StudyNote> = {
  fool: { label: 'Mép vực và chú chó', meaning: 'Bước chân hướng về nơi chưa biết, còn chú chó nhỏ nhắc ta giữ sự tỉnh táo khi bắt đầu.' },
  magician: { label: 'Bốn vật trên bàn', meaning: 'Gậy, cốc, kiếm và tiền đặt trước nhân vật: những nguồn lực đã có thể được gom lại để hành động.' },
  'high-priestess': { label: 'Hai cột sáng tối', meaning: 'Hai phía đối lập quanh Nữ Tư Tế gợi việc lắng nghe điều chưa hiện rõ trước khi kết luận.' },
  empress: { label: 'Khu vườn trù phú', meaning: 'Hoa lá và mùa màng quanh Hoàng Hậu gợi sức sống lớn lên nhờ được chăm sóc.' },
  emperor: { label: 'Ngai có đầu cừu', meaning: 'Chiếc ngai vững chãi giữa núi đá gợi cấu trúc, ranh giới và trách nhiệm của người dẫn dắt.' },
  hierophant: { label: 'Hai người học và chùm chìa khóa', meaning: 'Khung cảnh truyền dạy nhắc đến tri thức được trao lại và cánh cửa mở ra khi ta học hỏi.' },
  lovers: { label: 'Hai người đứng trước thiên thần', meaning: 'Sự gặp gỡ được đặt trong một không gian rộng hơn cảm xúc nhất thời: kết nối đi cùng lựa chọn.' },
  chariot: { label: 'Hai linh vật sáng tối', meaning: 'Hai hướng khác nhau cùng kéo cỗ xe, gợi việc giữ tay lái khi nhiều động lực cùng xuất hiện.' },
  strength: { label: 'Bàn tay bên sư tử', meaning: 'Sự tiếp xúc dịu dàng với con sư tử gợi sức mạnh đến từ kiên nhẫn và tự chủ.' },
  hermit: { label: 'Ngọn đèn trên núi', meaning: 'Ánh sáng nhỏ trong khung cảnh vắng nhắc rằng đôi khi chỉ cần thấy rõ bước kế tiếp.' },
  'wheel-of-fortune': { label: 'Bánh xe và các vòng trăng', meaning: 'Các chu kỳ quanh bánh xe gợi sự đổi thay liên tục; ta có thể chọn cách đáp lại bước ngoặt.' },
  justice: { label: 'Cán cân và thanh kiếm', meaning: 'Một bên cân nhắc, một bên quyết định: lá bài mời gọi nhìn đủ sự thật rồi chịu trách nhiệm.' },
  'hanged-man': { label: 'Người treo ngược', meaning: 'Tư thế đảo chiều giữa cảnh vật yên tĩnh gợi một khoảng dừng để nhìn vấn đề theo cách khác.' },
  death: { label: 'Kỵ sĩ và mặt trời mọc', meaning: 'Bên cạnh hình ảnh kết thúc vẫn có ánh bình minh: một chặng khép lại để nhường chỗ cho điều mới.' },
  temperance: { label: 'Dòng nước giữa hai chiếc cốc', meaning: 'Nước được rót qua lại gợi sự pha trộn vừa đủ, điều chỉnh nhịp độ thay vì vội vàng.' },
  devil: { label: 'Những sợi xích', meaning: 'Hai người ở gần chiếc ngai bị ràng buộc bằng xích, gợi câu hỏi điều gì đang giữ bạn trong thói quen cũ.' },
  tower: { label: 'Sét đánh vào tòa tháp', meaning: 'Vết nứt làm lung lay cấu trúc tưởng vững chắc; đây là lúc nhìn lại nền móng.' },
  star: { label: 'Hai dòng nước dưới các vì sao', meaning: 'Dòng nước được trao về hồ và mặt đất gợi việc hồi phục từng chút, không cần ép mình sáng lên ngay.' },
  moon: { label: 'Con đường giữa hai tòa tháp', meaning: 'Lối đi dưới ánh trăng còn mờ, nhắc ta phân biệt cảm giác, nỗi sợ và điều đã kiểm chứng.' },
  sun: { label: 'Đứa trẻ, ngựa trắng và hoa hướng dương', meaning: 'Khung cảnh rực sáng gợi niềm vui được thể hiện tự nhiên và thành quả có thể chia sẻ.' },
  judgement: { label: 'Tiếng kèn và những người vươn tay', meaning: 'Lời gọi trên bầu trời gợi khoảnh khắc thức tỉnh và quyết định bước sang chương mới.' },
  world: { label: 'Vòng hoa và bốn linh vật', meaning: 'Hình ảnh ở bốn góc ôm lấy vòng tròn trung tâm, gợi cảm giác một hành trình đã thành hình.' },
  'ace-of-wands': { label: 'Bàn tay cầm gậy nảy mầm', meaning: 'Chồi non và ngọn lửa trên cây gậy gợi ý tưởng mới cần được nuôi bằng một việc làm cụ thể.' },
  'ace-of-cups': { label: 'Chiếc cốc', meaning: 'Hãy nhìn cách chiếc cốc đón và trao dòng nước để liên hệ với khả năng mở lòng.' },
  'ace-of-swords': { label: 'Thanh kiếm', meaning: 'Lưỡi kiếm nhắc đến khoảnh khắc nhìn rõ sự thật và gọi tên một quyết định.' },
  'ace-of-pentacles': { label: 'Đồng tiền', meaning: 'Một vật hữu hình nhắc rằng cơ hội mới sẽ có giá trị hơn khi được chăm bằng việc làm thực tế.' },
  'three-of-cups': { label: 'Ba chiếc cốc nâng lên', meaning: 'Niềm vui trong tranh được chia giữa nhiều người; sự kết nối cũng là một nguồn nâng đỡ.' }
}

export function studyForCard(card: TarotCard) {
  return {
    suit: card.suit ? suitStudy[card.suit] : null,
    rank: card.rankNumber !== null ? rankStudy[card.rankNumber] ?? null : null,
    artwork: artworkStudy[card.id] ?? null
  }
}
