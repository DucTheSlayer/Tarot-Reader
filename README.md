# Tarot Zodiac Pocket

[![CI](https://github.com/DucTheSlayer/TarotApp/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/DucTheSlayer/TarotApp/actions/workflows/ci.yml)

Tarot Zodiac Pocket là ứng dụng Tarot và Zodiac chạy offline, ưu tiên trải nghiệm mobile portrait. Một bundle Vue được dùng cho trình duyệt và Android thông qua Capacitor. Nhánh `tarot-no-ads` không tích hợp quảng cáo hoặc SDK quảng cáo.

## Trạng thái

MVP web và Android đã chạy được trên thiết bị thật. Nhánh này gỡ SDK quảng cáo, giữ nguyên dữ liệu, artwork và package Android. Chạy `npm run verify` và build Android để kiểm tra.

### Đã có

- Card of the Day cố định theo ngày.
- Màn chào lần đầu: chọn Anh–Việt, hướng dẫn nhanh ba bước và bắt đầu vào Tarot. Xem lại tại Cài đặt → Hướng dẫn nhanh. Trạng thái hoàn thành lưu ở `tarot:onboarding-completed`, không reset theo phiên bản; bản cài cũ chưa có trạng thái này sẽ thấy hướng dẫn một lần sau khi cập nhật. Nếu thiết bị chặn lưu trữ, trạng thái chỉ giữ trong phiên hiện tại.
- Yes or No với bốn verdict và phần giải thích.
- Love Tarot, Money Tarot, 3 Card Spread và Yearly Tarot.
- Thư viện đủ 78 lá Tarot và trang chi tiết từng lá.
- Zodiac Origin cho 12 cung và Horoscope theo Day/Week/Year.
- SQLite offline dùng chung cho web và Android.
- 11 ngôn ngữ cho giao diện, 78 lá Tarot, 12 cung và 36 bài đọc; tự lưu lựa chọn ngôn ngữ.
- Trọn bộ 78 lá dùng minh họa Celestial Nouveau mới, đồng nhất theo bốn chất Wands, Cups, Swords và Pentacles; các URL ảnh cũ được giữ nguyên để không ảnh hưởng dữ liệu bài đọc.
- Launcher icon tím–vàng tạm thời.
- Giao diện mobile-first, hỗ trợ keyboard focus và `prefers-reduced-motion`.
- Unit test, kiểm tra database và CI cho nhánh `master`.

### Chưa có

- Settings đầy đủ; hiện có bộ chọn ngôn ngữ giao diện và nội dung.
- Lịch sử/nhật ký trải bài, chia sẻ kết quả và lá bài ngược.
- Backend, tài khoản hoặc đồng bộ nhiều thiết bị.
- Bản Hoa phồn thể (`zh-TW`) vẫn ở trạng thái dự kiến, chưa hiển thị cho người dùng.
- Chính sách quyền riêng tư, release signing và Android App Bundle cho Google Play.
- Kiểm thử hồi quy đầy đủ trên nhiều thiết bị Android và pipeline phát hành.

## Công nghệ

- Vue 3, TypeScript, Vue Router và Vite.
- Font offline: Noto Serif cho tiêu đề, Inter cho nội dung; đóng gói Latin, Latin Extended và Vietnamese qua Fontsource. Khai báo tại `app/src/styles/fonts.css`, giấy phép OFL trong `app/public/THIRD-PARTY-FONTS.txt`. Không tải Google Fonts lúc chạy app.
- Capacitor 8 cho Android WebView.
- `@capacitor-community/sqlite`, `jeep-sqlite` và `sql.js` cho dữ liệu offline.
- Vitest cho unit test.
- GitHub Actions cho CI.

## Yêu cầu

- Node.js 22 và npm.
- Python 3.11 trở lên để chạy các script kiểm tra database.
- Android Studio, Android SDK Platform 36 và JDK 21 chỉ khi cần build Android.

## Chạy ứng dụng web

```powershell
cd D:\TarotReader\app
npm install
npm run dev
```

Mặc định Vite mở ứng dụng tại `http://localhost:5173`.

## Kiểm tra dự án

Chạy toàn bộ các bước CI tại máy local:

```powershell
cd D:\TarotReader\app
npm test
npm run i18n:check
npm run db:validate
npm run db:validate:web
npm run db:validate:parity
npm run build
```

Hoặc chạy gọn toàn bộ chuỗi kiểm tra trên bằng một lệnh:

```powershell
npm run verify
```

| Lệnh | Mục đích |
| --- | --- |
| `npm run dev` | Chạy Vite development server |
| `npm test` | Chạy unit test một lần |
| `npm run test:watch` | Chạy test ở chế độ theo dõi |
| `npm run build` | Type-check và tạo production bundle trong `app/dist` |
| `npm run verify` | Chạy test, kiểm tra bản dịch/database và production build |
| `npm run db:build` | Dựng lại SQLite asset từ migration và seed |
| `npm run db:validate` | Kiểm tra số lượng và quan hệ dữ liệu nguồn |
| `npm run db:validate:web` | Mở SQLite bằng `sql.js` và kiểm tra nâng cấp v1 → v2 |
| `npm run db:validate:parity` | So sánh 22 Major Arcana với dữ liệu TypeScript legacy |
| `npm run i18n:check` | Kiểm tra SQL bản dịch khớp các file JSON nguồn |

Unit test SQLite kiểm tra migration v1 → v2 → v3, giữ nguyên mọi trường dữ liệu tiếng Anh và so sánh bản dịch với database đóng gói.

## Android

Sau khi cài Android Studio, SDK Platform 36 và Platform-Tools, tạo `app/android/local.properties`:

```properties
sdk.dir=C:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

Sau đó đồng bộ bundle web vào Android:

```powershell
cd D:\TarotReader\app
npm run build
npx cap sync android
npx cap open android
```

Trong Android Studio, chọn emulator hoặc điện thoại đã bật USB debugging rồi nhấn **Run**. File `local.properties` là cấu hình riêng của máy và không được commit.

Để tạo APK mentor demo sau khi sync, chạy task `:app:assembleDebug` trong thư mục `app/android` bằng JDK 21 (có thể dùng runtime `jbr` đi kèm Android Studio):

```powershell
cd D:\TarotReader\app\android
$env:JAVA_HOME = 'C:\Users\<username>\.jdks\jbr-21.0.11'
.\gradlew.bat :app:assembleDebug
```

APK cuối nằm tại `D:\TarotReader\app\android\app\build\outputs\apk\debug\app-debug.apk`. APK vẫn được ký debug và chưa phải bản release để đăng Google Play. Nhánh này không đóng gói SDK quảng cáo. Khi chạy trực tiếp trong Android Studio, chọn đúng JDK 21, thiết bị đã bật USB debugging và nhấn **Run app**; không bắt buộc cài APK thủ công.

Nếu Android Studio còn báo `Activity class {com.apptarot.app/com.zl.eye.reading.MainActivity} does not exist`, đó là Run/Gradle model cũ của IDE. Chọn **File → Sync Project with Gradle Files**, chọn Run Configuration **Tarot Zodiac Pocket** rồi Run lại. Nếu cấu hình này chưa hiện, mở **Run → Edit Configurations**, xóa cấu hình `app` cũ và tạo **Android App** mới với module `android.app`, Launch **Specified Activity** là `com.zl.eye.reading.MainActivity`. Gradle JDK phải là JDK 21.

## Bản không quảng cáo

Nhánh `tarot-no-ads` gỡ banner, interstitial, rewarded, App Open, màn Advertising QA và `@alf/app-sdk` khỏi web/Android. Không cần registry npm riêng của ALF hoặc cấu hình Firebase để build.

Trong Card of the Day, nhấn **Rút 3 lá** để mở trực tiếp một trải bài bổ sung, tối đa 3 lượt/ngày. Các lượt đã rút được lưu và có thể xem lại.

## Cấu trúc chính

```text
TarotReader/
├── app/                 Vue app và Android Capacitor host
│   ├── src/             Views, components, stores, data và database layer
│   ├── public/          Ảnh bài, SQLite asset và WebAssembly
│   └── android/         Dự án Android được Capacitor sinh ra
├── database/            Migration, seed và script dựng/kiểm tra SQLite
├── design-note/         Đặc tả sản phẩm, màn hình và system flow
└── .github/workflows/   GitHub Actions CI
```

## Dữ liệu và nguyên tắc runtime

- Database phải có đúng 78 lá đang hoạt động: 22 Major và 56 Minor Arcana.
- Zodiac phải có 12 cung và 36 reading (`12 × day/week/year`).
- Các lượt rút thông thường không trùng lá trong cùng một spread.
- Daily Tarot dùng ngày local `yyyy-mm-dd` để chọn lá deterministic.
- Chỉ trạng thái đã Reveal Daily Tarot được lưu trong `localStorage`; các kết quả khác mất khi rời route hoặc reload.

## Đa ngôn ngữ

- Vào Settings / Cài đặt → Language / Ngôn ngữ để chọn một trong 11 ngôn ngữ: English, Tiếng Việt, Español, Português, Bahasa Indonesia, हिन्दी, ไทย, Français, Deutsch, 日本語 và 한국어. Tên tiếng Anh mờ được hiển thị cạnh tên bản địa để dễ nhận biết.
- Lần đầu dùng ngôn ngữ chính của thiết bị (không hỗ trợ thì dùng tiếng Anh); lựa chọn thủ công được lưu tại `tarot:locale` trong localStorage.
- Bản dịch giao diện nằm trong `app/src/locales/<locale>.json`. Giữ các khóa giống file tiếng Anh và dùng `t('namespace.key')` trong component.
- Các màn đọc bài dùng catalogue `app/src/locales/reading.<locale>.json`: khóa là câu tiếng Anh, giá trị là bản dịch; gọi `ui(source, { thamSo })`. Giữ nguyên các tham số `{name}`, `{count}` và không đưa câu hỏi do người dùng nhập vào hàm dịch.
- Nội dung SQLite nằm trong `database/translations/*.<locale>.json`; dữ liệu tiếng Anh giữ nguyên ở bảng gốc. V6 cấp lại toàn bộ translation seed khi nâng cấp mà không đổi ID, thứ tự, ảnh hoặc verdict của lá bài.
- Đổi ngôn ngữ cập nhật các trường chữ qua getter phản ứng, không rút lại bài. Tuy nhiên rời màn để vào Settings vẫn làm mất kết quả tạm theo hành vi hiện có của app; Daily vẫn giữ lá và trạng thái lật trong ngày.
- Chữ nằm trong hình minh họa vẫn là tiếng Anh; tên và lời giải bên ngoài ảnh đã được dịch. Horoscope là nội dung tĩnh để chiêm nghiệm, không phải dự báo cập nhật trực tiếp.
- Khởi tạo i18n nằm trong `app/src/i18n/index.ts`; đổi ngôn ngữ không cần reload.

Hạ tầng locale động và fallback English theo từng chuỗi/trường dữ liệu đã hoàn tất. Các locale `es-419`, `pt-BR`, `id`, `hi`, `th`, `fr`, `de`, `ja` và `ko` đã được xuất bản; `zh-TW` vẫn nằm trong registry để hoàn thiện sau. Font fallback cho Devanagari, Thái, Nhật, Hàn và Hoa phồn thể đã được cấu hình. Các bản dịch máy cần được QA ngôn ngữ và tràn chữ trước khi phát hành production.

Sau khi sửa nội dung bản dịch:

```powershell
cd D:\TarotReader\app
python ../database/scripts/build_translations.py
npm run db:build
npm run i18n:check
npm test
npm run build
npx cap sync android
```

Không sửa trực tiếp `004_translations.sql` vì đây là file được sinh tự động. Database hiện ở schema v6; các lần thêm hoặc sửa nội dung sau khi phát hành cần migration/seed nâng cấp tương ứng để cập nhật máy đã cài, vì chỉ sửa asset không cập nhật database đang tồn tại.

### Checklist trước beta Android

- Cài đè bản mới lên bản cũ cùng chữ ký, không gỡ app: database mở được, Daily và lựa chọn ngôn ngữ còn giữ.
- Chọn Tiếng Việt, đóng/mở lại app: vẫn là tiếng Việt; thử lại với English.
- Tắt mạng sau khi cài: mở thư viện, xem cả Tarot và Hoàng đạo, rút bài được.
- Kiểm tra sáu chế độ Tarot, tên/lời giải và modal; thử 12 cung cùng ba tab thời gian.
- Kiểm tra máy 3 nút điều hướng và máy dùng cử chỉ: thanh tab không bị che, nút Trở về dễ bấm, Yearly không mất hai lá ngoài cùng.
- Kiểm tra chữ tiếng Việt dài trên màn hình nhỏ và cỡ chữ hệ thống lớn.
- Kiểm tra khi cuộn kết quả: thẻ bài di chuyển/mờ cùng nội dung, không đè lên phần giải thích; trong trải bài 3 lá có thể chạm từng lá đã lật để mở chi tiết.

### Thứ tự hoàn thiện bản beta

1. Chạy `npm run verify`, đồng bộ Capacitor và tạo APK debug dùng cho mentor demo.
2. Kiểm tra rút 3 lá bổ sung trực tiếp, giới hạn 3 lượt/ngày và khôi phục các lượt đã lưu khi mở lại app.
3. QA bản dịch máy của 11 ngôn ngữ trên thiết bị thật, ưu tiên kiểm tra ngữ nghĩa và tràn giao diện.
4. Chốt icon/splash chính thức, versionCode/versionName và chính sách quyền riêng tư; package hiện theo cấu hình Eye Telling của mentor.
5. Chuyển cấu hình release, cấu hình signing riêng, tạo AAB và kiểm tra bản cài từ kênh Internal Testing.

## CI

Workflow [`.github/workflows/ci.yml`](.github/workflows/ci.yml) chạy trên mọi push và pull request vào `master`. CI cài dependency bằng `npm ci`, chạy unit test (gồm migration và đổi ngôn ngữ), kiểm tra seed bản dịch, ba bước kiểm tra database, production build và Android debug build. APK debug được lưu thành artifact `app-tarot-debug`; signing và AAB release vẫn để cho pipeline phát hành riêng.

## Xử lý lỗi thường gặp

### `spawn EPERM` khi chạy Vite trên Windows

Đóng tiến trình Node/Vite cũ và mở PowerShell hoặc terminal của IDE với quyền phù hợp, sau đó chạy lại `npm run dev`. Đây thường là lỗi quyền tạo tiến trình, không phải lỗi commit Git.

### `SDK location not found`

Cài Android Studio/SDK và kiểm tra `app/android/local.properties` trỏ đúng đến thư mục SDK.

### Database không mở được sau khi schema thay đổi

Chạy lại `npm run db:build`, ba lệnh `db:validate:*`, sau đó `npm run build` và `npx cap sync android`.

## Tài liệu

- [Tổng quan sản phẩm](design-note/overview.md)
- [Kế hoạch triển khai](design-note/plan.md)
- [Đặc tả màn hình](design-note/screen.md)
- [Luồng người dùng](design-note/user-flow.md)
- [Luồng hệ thống](design-note/system-flow.md)
- [Quy trình database](database/README.md)
