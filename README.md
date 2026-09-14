# Serein Tarot

[![CI](https://github.com/DucTheSlayer/TarotApp/actions/workflows/ci.yml/badge.svg?branch=master)](https://github.com/DucTheSlayer/TarotApp/actions/workflows/ci.yml)

Serein Tarot là ứng dụng Tarot và Zodiac chạy offline, ưu tiên trải nghiệm mobile portrait. Một bundle Vue được dùng cho trình duyệt và Android thông qua Capacitor. App tích hợp Banner, Interstitial và Rewarded qua SDK nội bộ của công ty, với chế độ QA và production tách biệt.

## Trạng thái

MVP web và Android đã chạy được trên thiết bị thật. Cấu hình production dùng package, Firebase và ad unit do mentor chỉ định từ Eye Telling; bản QA vẫn dùng ad unit test của Google. Chuỗi kiểm tra hiện có 63 unit test, kiểm tra bản dịch/database, production web build và Android debug build.

### Đã có

- Card of the Day cố định theo ngày.
- Màn chào lần đầu: chọn Anh–Việt, hướng dẫn nhanh ba bước và bắt đầu vào Tarot. Xem lại tại Cài đặt → Hướng dẫn nhanh. Trạng thái hoàn thành lưu ở `tarot:onboarding-completed`, không reset theo phiên bản; bản cài cũ chưa có trạng thái này sẽ thấy hướng dẫn một lần sau khi cập nhật. Nếu thiết bị chặn lưu trữ, trạng thái chỉ giữ trong phiên hiện tại.
- Yes or No với bốn verdict và phần giải thích.
- Love Tarot, Money Tarot, 3 Card Spread và Yearly Tarot.
- Thư viện đủ 78 lá Tarot và trang chi tiết từng lá.
- Zodiac Origin cho 12 cung và Horoscope theo Day/Week/Year.
- SQLite offline dùng chung cho web và Android.
- 11 ngôn ngữ cho giao diện, 78 lá Tarot, 12 cung và 36 bài đọc; tự lưu lựa chọn ngôn ngữ.
- Quảng cáo Banner tại các màn tổng, Interstitial tại điểm chuyển tự nhiên với cooldown 90 giây và Rewarded để mở khóa lá bài làm rõ trong Card of the Day.
- Trang Cài đặt → Advertising QA chỉ xuất hiện trong build QA để demo riêng từng định dạng bằng quảng cáo test; lỗi tải quảng cáo không chặn luồng sử dụng app.
- Launcher icon tím–vàng tạm thời và icon video/play đánh dấu rõ hành động xem quảng cáo.
- `@alf/app-sdk` của công ty được dùng nguyên trạng. Phần tương thích UI thread của Android nằm trong plugin proxy do app sở hữu, không sửa source SDK trong `node_modules`.
- Giao diện mobile-first, hỗ trợ keyboard focus và `prefers-reduced-motion`.
- Unit test, kiểm tra database và CI cho nhánh `master`.

### Chưa có

- Settings đầy đủ; hiện có bộ chọn ngôn ngữ giao diện và nội dung.
- Lịch sử/nhật ký trải bài, chia sẻ kết quả và lá bài ngược.
- Backend, tài khoản hoặc đồng bộ nhiều thiết bị.
- Bản Hoa phồn thể (`zh-TW`) vẫn ở trạng thái dự kiến, chưa hiển thị cho người dùng.
- Consent quảng cáo, chính sách quyền riêng tư, release signing và Android App Bundle cho Google Play.
- Kiểm thử hồi quy đầy đủ trên nhiều thiết bị Android và pipeline phát hành.

## Công nghệ

- Vue 3, TypeScript, Vue Router và Vite.
- Font offline: Noto Serif cho tiêu đề, Inter cho nội dung; đóng gói Latin, Latin Extended và Vietnamese qua Fontsource. Khai báo tại `app/src/styles/fonts.css`, giấy phép OFL trong `app/public/THIRD-PARTY-FONTS.txt`. Không tải Google Fonts lúc chạy app.
- Capacitor 8 cho Android WebView.
- `@alf/app-sdk` cho quảng cáo AdMob/AppLovin; bản mentor demo chỉ sử dụng inventory test.
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

APK cuối nằm tại `D:\TarotReader\app\android\app\build\outputs\apk\debug\app-debug.apk`. APK vẫn được ký debug và chưa phải bản release để đăng Google Play, nhưng bundle web mặc định dùng cấu hình quảng cáo production. Khi chạy trực tiếp trong Android Studio, chọn đúng JDK 21, thiết bị đã bật USB debugging và nhấn **Run app**; không bắt buộc cài APK thủ công.

Nếu Android Studio còn báo `Activity class {com.apptarot.app/com.zl.eye.reading.MainActivity} does not exist`, đó là Run/Gradle model cũ của IDE. Chọn **File → Sync Project with Gradle Files**, chọn Run Configuration **Serein Tarot** rồi Run lại. Nếu cấu hình này chưa hiện, mở **Run → Edit Configurations**, xóa cấu hình `app` cũ và tạo **Android App** mới với module `android.app`, Launch **Specified Activity** là `com.zl.eye.reading.MainActivity`. Gradle JDK phải là JDK 21.

## Chế độ quảng cáo

- `npm run dev` và `npm run build:qa` bật trang Advertising QA và dùng ad unit test của Google. Sau `build:qa`, chạy lại `npx cap sync android` trước khi build APK QA.
- `npm run build` tạo bundle production, ẩn Advertising QA và dùng các ad unit trong `app/config.ts`.
- Android dùng package `com.zl.eye.reading` cùng `google-services.json`/Firebase từ Eye Telling theo chỉ dẫn mentor. Package này xung đột với Eye Telling nếu hai APK được ký bằng chứng thư khác nhau; cần gỡ bản đang cài trước khi thử bản còn lại.
- Không nhấn quảng cáo thật trong quá trình QA nội bộ; dùng `build:qa` để kiểm thử thao tác quảng cáo an toàn.
- Banner chỉ xuất hiện tại Tarot Home, Tarot Library, Zodiac Home và Settings; các màn tập trung đọc/rút bài không bị banner che nội dung.
- App Open không tự hiện khi khởi động để tránh chồng quảng cáo và làm gián đoạn lúc người dùng vừa mở app; định dạng này chỉ còn trong màn QA để kiểm tra riêng.
- Interstitial được preload, chỉ thử hiển thị khi người dùng chọn Rút lại hoặc Trở về sau một lượt đọc và có cooldown toàn cục 90 giây.
- Rewarded nằm trong Card of the Day và hoàn toàn tùy chọn. Chỉ callback `rewarded` mới cấp lá bài làm rõ; đóng quảng cáo sớm không nhận thưởng. Độ dài video và thời điểm nút đóng xuất hiện do creative/mạng quảng cáo quyết định, không do app tự ép thời lượng.
- Nếu inventory AdMob cho phép quảng cáo 60 giây, nhờ chủ tài khoản vào **AdMob → Apps → App settings → High-engagement ads** và tắt tùy chọn này. Với standard ad units, Google công bố mức skip tối đa giảm từ 60 xuống 30 giây cho Rewarded và từ 12 xuống 5 giây cho Interstitial; cấu hình này không điều khiển partner bidding inventory.
- Nếu provider chưa sẵn sàng, hết inventory hoặc mất mạng, app bỏ qua quảng cáo/hiện trạng thái thử lại thay vì khóa chức năng chính.
- Không tự nhấp quảng cáo thật. Chỉ chuyển sang `dev: false` cùng quy trình consent/signing riêng khi bắt đầu giai đoạn release.

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
- Tại Cài đặt → Advertising QA, chạy Banner, Interstitial và Rewarded bằng test inventory. Kiểm tra cả Rewarded xem hết và đóng sớm.
- Tắt mạng rồi thử lại các điểm đặt quảng cáo: app vẫn điều hướng/rút bài được và không crash.

### Thứ tự hoàn thiện bản beta

1. Chạy `npm run verify`, đồng bộ Capacitor và tạo APK debug dùng cho mentor demo.
2. Dùng `build:qa` để demo ba định dạng quảng cáo test và hoàn tất checklist hồi quy trên thiết bị Android mục tiêu.
3. QA bản dịch máy của 11 ngôn ngữ trên thiết bị thật, ưu tiên kiểm tra ngữ nghĩa và tràn giao diện.
4. Chốt icon/splash chính thức, versionCode/versionName, consent và chính sách quyền riêng tư; package hiện theo cấu hình Eye Telling của mentor.
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
