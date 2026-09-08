# App Tarot — Database Plan (DB Browser + SQLite)

> Tài liệu này mô tả nguồn dữ liệu offline SQLite cho **78 lá Tarot**, **12 cung hoàng đạo** và **36 nội dung Horoscope**.
> Trạng thái ngày 25/08/2026: database v2, seed, repository/store, thư viện Tarot và hai chức năng Zodiac đã hoàn thành. Web build, asset `sql.js` và đường nâng cấp v1 → v2 đã pass; kiểm thử IndexedDB tương tác chưa chạy vì không có browser kết nối, còn Android build đang thiếu Android SDK trên máy.

---

## 1. Mục tiêu

1. Dùng một file SQLite làm nguồn dữ liệu runtime cho các lá Tarot.
2. Dùng **DB Browser for SQLite** để tạo, nhập, sửa và kiểm tra dữ liệu trong giai đoạn phát triển.
3. App tiếp tục hoạt động offline; không cần server hay tài khoản người dùng.
4. Mở rộng type `TarotCard` để phân biệt Major/Minor, suit và rank nhưng vẫn giữ hành vi hiện tại của Daily, Yes/No, Love, Money, Yearly và 3 Card Spread.
5. Có cơ chế migration để người đã cài app nhận được schema/content mới mà không bị ghi đè database tùy tiện.
6. Chạy được trên Android/Capacitor và vẫn có hướng phát triển/test trên trình duyệt Vite.

### Không nằm trong phạm vi lần chuyển đổi đầu tiên

- Không thêm backend hoặc đồng bộ cloud.
- Không lưu lịch sử rút bài vào SQLite.
- Không lưu câu hỏi người dùng hoặc dữ liệu nhạy cảm.
- Không đưa ảnh lá bài vào cột BLOB; database chỉ lưu đường dẫn ảnh.
- Không gọi API Horoscope hoặc đồng bộ nội dung từ server.

---

## 2. Kiến trúc đã chọn

```text
DB Browser for SQLite
        │
        │ tạo/sửa + Write Changes
        ▼
database/source/tarot_cardsSQLite.db
        │
        │ validate + copy artifact
        ▼
app/public/assets/databases/tarot_cardsSQLite.db
        │
        │ copyFromAssets(overwrite = false)
        ▼
SQLite riêng của ứng dụng
        │
        ▼
CardRepository/ZodiacRepository → stores → các Tarot/Zodiac views
```

### Vai trò từng phần

- **DB Browser for SQLite:** công cụ desktop dành cho developer/content editor. DB Browser không được nhúng vào app và không phải database server.
- **SQLite asset:** database mẫu cho lần cài app đầu tiên.
- **`@capacitor-community/sqlite`:** cầu nối giữa Vue/TypeScript và SQLite native trên Android/iOS.
- **Repository:** nơi duy nhất chứa câu SQL và chuyển row dạng `snake_case` thành `TarotCard` dạng `camelCase`.
- **Card store/composable:** nạp danh sách một lần khi khởi động và cung cấp dữ liệu cho các flow rút bài.

### Package đã cài

Project đang dùng Capacitor `8.5.x`, `@capacitor-community/sqlite` `8.1.1`, `jeep-sqlite` `2.8.0` và `sql.js`. SQLite plugin đã được Capacitor nhận khi chạy `npx cap sync android`.

```powershell
npm install @capacitor-community/sqlite@^8.1.1
npx cap sync android
```

Nếu cần chạy SQLite thật trong `npm run dev` trên web, bổ sung:

```powershell
npm install jeep-sqlite sql.js
```

Sau đó copy `node_modules/sql.js/dist/sql-wasm.wasm` vào `app/public/assets/sql-wasm.wasm` và khởi tạo `jeep-sqlite` trước khi mở database.

> Lưu ý: plugin sử dụng SQLCipher ở native ngay cả khi mở database không mã hóa. Trước khi phát hành store cần kiểm tra nghĩa vụ khai báo mã hóa của nền tảng/phạm vi phân phối. Dữ liệu lá bài là nội dung công khai nên phase đầu dùng mode `no-encryption`.

---

## 3. Cấu trúc thư mục dự kiến

```text
AppTarot/
├── database/
│   ├── source/
│   │   └── tarot_cardsSQLite.db       # mở và chỉnh bằng DB Browser
│   ├── migrations/
│   │   └── 001_initial.sql
│   ├── seeds/
│   │   ├── 001_major_arcana.sql      # 22 lá hiện có
│   │   └── 002_minor_arcana.sql      # 56 lá: 4 suit × 14 rank
│   └── README.md                      # quy trình edit/validate/publish DB
├── app/
│   ├── public/
│   │   └── assets/
│   │       ├── databases/
│   │       │   ├── tarot_cardsSQLite.db
│   │       │   └── databases.json    # chỉ cần cho web/jeep-sqlite
│   │       └── sql-wasm.wasm         # chỉ cần cho web
│   └── src/
│       ├── database/
│       │   ├── database.ts           # init/open/close + version
│       │   ├── upgrades.ts           # migration cho app đã cài
│       │   ├── cardRepository.ts
│       │   └── cardMapper.ts
│       ├── stores/
│       │   └── cardStore.ts          # state singleton, không bắt buộc Pinia
│       └── types/
│           └── tarotCard.ts
└── design-note/
    └── db-plan.md
```

Tên file asset dùng hậu tố `SQLite.db` để connection name trong app là `tarot_cards`. Với web, `databases.json` dự kiến:

```json
{
  "databaseList": ["tarot_cardsSQLite.db"]
}
```

Không chỉnh trực tiếp file database đã được copy vào thư mục runtime trên thiết bị. Mọi thay đổi nội dung bắt đầu từ `database/source/`, có SQL migration tương ứng, sau đó mới tạo/copy artifact mới sang `public/assets/databases/`.

---

## 4. Schema v1

Schema v1 hỗ trợ trọn bộ 78 lá. Thứ tự chuẩn được cố định như sau để mọi truy vấn và phép chọn deterministic cho cùng kết quả:

- `0–21`: Major Arcana, từ The Fool đến The World.
- `22–35`: Wands; `36–49`: Cups; `50–63`: Swords; `64–77`: Pentacles.
- Mỗi Minor suit có `rank_number` từ `1–14`: Ace, 2–10, Page, Knight, Queen, King.

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE tarot_cards (
  id              TEXT PRIMARY KEY NOT NULL,
  deck_order      INTEGER NOT NULL UNIQUE
                  CHECK (deck_order BETWEEN 0 AND 77),
  arcana_type     TEXT NOT NULL
                  CHECK (arcana_type IN ('major', 'minor')),
  major_number    INTEGER
                  CHECK (major_number BETWEEN 0 AND 21),
  suit            TEXT
                  CHECK (suit IN ('wands', 'cups', 'swords', 'pentacles')),
  rank_number     INTEGER
                  CHECK (rank_number BETWEEN 1 AND 14),
  name            TEXT NOT NULL,
  image_path      TEXT NOT NULL,
  meaning         TEXT NOT NULL,
  advice          TEXT NOT NULL,
  yes_no          TEXT NOT NULL
                  CHECK (yes_no IN ('yes', 'no', 'maybe', 'uncertain')),
  yes_no_meaning  TEXT NOT NULL,
  is_active       INTEGER NOT NULL DEFAULT 1
                  CHECK (is_active IN (0, 1)),
  CHECK (
    (arcana_type = 'major'
      AND major_number IS NOT NULL
      AND suit IS NULL
      AND rank_number IS NULL)
    OR
    (arcana_type = 'minor'
      AND major_number IS NULL
      AND suit IS NOT NULL
      AND rank_number IS NOT NULL)
  )
);

CREATE INDEX idx_tarot_cards_active_order
  ON tarot_cards (is_active, deck_order);

CREATE UNIQUE INDEX idx_tarot_cards_major_number
  ON tarot_cards (major_number)
  WHERE arcana_type = 'major';

CREATE UNIQUE INDEX idx_tarot_cards_minor_suit_rank
  ON tarot_cards (suit, rank_number)
  WHERE arcana_type = 'minor';

PRAGMA user_version = 1;
```

### Mapping sang TypeScript mới

| SQLite | TypeScript | Ghi chú |
| --- | --- | --- |
| `id` | `id` | Slug ổn định, ví dụ `high-priestess` |
| `deck_order` | `deckOrder` | 0–77; khóa sắp xếp deterministic của toàn bộ deck |
| `arcana_type` | `arcanaType` | `major` hoặc `minor` |
| `major_number` | `majorNumber` | 0–21 với Major; `null` với Minor |
| `suit` | `suit` | `wands/cups/swords/pentacles` với Minor; `null` với Major |
| `rank_number` | `rankNumber` | 1–14 với Minor; `null` với Major |
| `name` | `name` | Tên hiển thị |
| `image_path` | `image` | Ví dụ `/cards/fool.svg`; không dùng BLOB |
| `meaning` | `meaning` | Ý nghĩa chung |
| `advice` | `advice` | Lời khuyên |
| `yes_no` | `yesNo` | `yes/no/maybe/uncertain` |
| `yes_no_meaning` | `yesNoMeaning` | Diễn giải riêng cho Yes/No |

Type mục tiêu sau cutover:

```ts
export type ArcanaType = 'major' | 'minor'
export type TarotSuit = 'wands' | 'cups' | 'swords' | 'pentacles'

export interface TarotCard {
  id: string
  deckOrder: number
  arcanaType: ArcanaType
  majorNumber: number | null
  suit: TarotSuit | null
  rankNumber: number | null
  name: string
  image: string
  meaning: string
  advice: string
  yesNo: YesNoAnswer
  yesNoMeaning: string
}
```

Không tiếp tục dùng field `number` chung cho cả hai nhóm vì số Major và rank Minor mang ý nghĩa khác nhau. Mọi logic cần thứ tự toàn deck phải dùng `deckOrder`.

Query chuẩn của repository:

```sql
SELECT
  id,
  deck_order,
  arcana_type,
  major_number,
  suit,
  rank_number,
  name,
  image_path,
  meaning,
  advice,
  yes_no,
  yes_no_meaning
FROM tarot_cards
WHERE is_active = 1
ORDER BY deck_order ASC;
```

`ORDER BY deck_order ASC` là bắt buộc vì Card of the Day chọn theo index deterministic. Không được dựa vào thứ tự row mặc định của SQLite. Việc chuyển từ deck 22 sang 78 lá sẽ làm kết quả Daily thay đổi; đây là thay đổi nghiệp vụ có chủ đích và phải được ghi trong release note.

### Schema v2 — Zodiac và Horoscope

Migration `002_zodiac.sql` bổ sung:

- `zodiac_signs`: 12 profile, gồm biểu tượng, khoảng ngày, nguyên tố, hành tinh, modality, origin, traits, strengths, challenges và compatibility.
- `horoscope_readings`: khóa ghép `(sign_id, period)` với `period = day | week | year`; mỗi row có Overview, Love, Career, Finance, Wellbeing và Guidance.
- Seed `003_zodiac.sql` tạo đúng 12 profile và 36 tổ hợp nội dung tĩnh. Runtime đọc qua `zodiacRepository` và `zodiacStore`, không import mock data.

### Schema mở rộng sau v2

Nếu sau này cần nội dung riêng cho Love/Money/Yearly theo từng lá, thêm bảng bằng migration v3 thay vì nhồi nhiều cột vào `tarot_cards`:

```sql
CREATE TABLE card_interpretations (
  id            INTEGER PRIMARY KEY,
  card_id       TEXT NOT NULL,
  reading_type  TEXT NOT NULL,
  slot_key      TEXT NOT NULL,
  context_key   TEXT NOT NULL DEFAULT 'default',
  meaning       TEXT NOT NULL,
  advice        TEXT NOT NULL,
  FOREIGN KEY (card_id) REFERENCES tarot_cards(id) ON DELETE CASCADE,
  UNIQUE (card_id, reading_type, slot_key, context_key)
);
```

`spreadReadings.ts` vẫn là lớp tạo câu dẫn theo ngữ cảnh; dữ liệu gốc của lá bài nằm trong SQLite.

---

## 5. Quy trình dùng DB Browser for SQLite

### Tạo database lần đầu

1. Cài và mở **DB Browser for SQLite**.
2. Chọn **New Database** và lưu thành `database/source/tarot_cardsSQLite.db`.
3. Mở tab **Execute SQL**, chạy lần lượt `001_initial.sql` và `002_zodiac.sql`.
4. Chạy `001_major_arcana.sql` để insert 22 lá Major.
5. Chạy `002_minor_arcana.sql` để insert 56 lá Minor.
6. Chạy `003_zodiac.sql` để insert 12 cung và 36 nội dung Horoscope.
7. Mở tab **Browse Data**, rà `tarot_cards`, `zodiac_signs` và `horoscope_readings`.
8. Bấm **Write Changes**. Nếu không bấm bước này, thay đổi vẫn chưa được ghi chắc chắn vào file.

### Kiểm tra trước khi publish asset

Chạy trong tab **Execute SQL**:

```sql
PRAGMA integrity_check;
PRAGMA foreign_key_check;

SELECT COUNT(*) AS card_count
FROM tarot_cards
WHERE is_active = 1;

SELECT deck_order, COUNT(*) AS duplicate_count
FROM tarot_cards
GROUP BY deck_order
HAVING COUNT(*) > 1;

SELECT arcana_type, COUNT(*) AS card_count
FROM tarot_cards
WHERE is_active = 1
GROUP BY arcana_type;

SELECT suit, COUNT(*) AS card_count
FROM tarot_cards
WHERE is_active = 1 AND arcana_type = 'minor'
GROUP BY suit
ORDER BY CASE suit
  WHEN 'wands' THEN 1
  WHEN 'cups' THEN 2
  WHEN 'swords' THEN 3
  WHEN 'pentacles' THEN 4
END;

SELECT id
FROM tarot_cards
WHERE trim(name) = ''
   OR trim(image_path) = ''
   OR trim(meaning) = ''
   OR trim(advice) = ''
   OR trim(yes_no_meaning) = '';

SELECT id, yes_no
FROM tarot_cards
WHERE yes_no NOT IN ('yes', 'no', 'maybe', 'uncertain');
```

Điều kiện pass:

- `integrity_check` trả `ok`.
- `foreign_key_check` không có row.
- `card_count = 78`.
- Nhóm `arcana_type` trả đúng `major = 22`, `minor = 56`.
- Bốn suit `wands/cups/swords/pentacles` đều có đúng 14 lá Minor.
- Không trùng `deck_order`; không trùng `major_number`; không trùng cặp `(suit, rank_number)`.
- Không có text bắt buộc bị rỗng.
- Mọi `image_path` đều tồn tại trong asset của app.

Sau khi pass, copy file sang:

```text
app/public/assets/databases/tarot_cardsSQLite.db
```

File `.db` là binary khó review trên Git, vì vậy `001_initial.sql`, `001_major_arcana.sql` và `002_minor_arcana.sql` vẫn phải commit cùng database để có diff đọc được và có thể dựng lại database.

---

## 6. Khởi tạo database trong app

### Trình tự bootstrap

```text
main.ts
  → initDatabase()
      → khởi tạo SQLiteConnection
      → web: initWebStore()
      → copyFromAssets(false)
      → đăng ký upgrade statements
      → createConnection(DB_NAME, version = DB_VERSION)
      → open()
      → PRAGMA foreign_keys = ON
  → cardRepository.getAll()
  → cardStore.setCards(cards)
  → mount Vue app
```

Hằng số dự kiến:

```ts
export const DB_NAME = 'tarot_cards'
export const DB_VERSION = 2
```

Nguyên tắc quan trọng:

- Gọi `copyFromAssets(false)` hoặc API wrapper tương đương với `overwrite = false`.
- Không dùng `overwrite = true` mỗi lần mở app; thao tác đó có thể ghi đè database đang tồn tại.
- Đăng ký migration trước khi mở connection ở version mới.
- Bật `PRAGMA foreign_keys = ON` trên mỗi connection thay vì phụ thuộc default của SQLite.
- Đóng connection khi app teardown/test; kiểm tra connection consistency khi hot reload.

### Web/Vite

Native dùng file SQLite thật trong vùng database của app. Web implementation của plugin dùng `jeep-sqlite/sql.js` và lưu trong IndexedDB, vì vậy DB Browser không mở trực tiếp database đang nằm trong browser.

Để web copy database asset:

1. Có `public/assets/databases/databases.json`.
2. Có `public/assets/sql-wasm.wasm`.
3. Đăng ký custom element `jeep-sqlite` trước khi gọi `initWebStore()`.
4. Dùng Chrome DevTools/Jeep SQLite Browser hoặc export file nếu cần xem database runtime của web.

DB Browser vẫn dùng để chỉnh file nguồn trước khi app copy nó vào IndexedDB.

---

## 7. Repository và state ứng dụng

Interface đề xuất:

```ts
export interface CardRepository {
  getAll(): Promise<TarotCard[]>
  getById(id: string): Promise<TarotCard | null>
}
```

`cardMapper.ts` chịu trách nhiệm:

- Validate row trả về có đủ field.
- Chuyển `deck_order → deckOrder`, `arcana_type → arcanaType`, `major_number → majorNumber` và `rank_number → rankNumber`.
- Chuyển `image_path → image`.
- Chuyển `yes_no → yesNo` và `yes_no_meaning → yesNoMeaning`.
- Từ chối giá trị `yes_no` ngoài union type thay vì ép kiểu im lặng.

Do SQLite là async, không import trực tiếp `CARDS` như hiện tại. Tạo `cardStore` singleton tối thiểu:

```ts
type CardState = 'idle' | 'loading' | 'ready' | 'error'

// cards: Ref<TarotCard[]>
// state: Ref<CardState>
// load(): Promise<void>
// getById(id): TarotCard | undefined
```

Sau khi store ready:

- `useDrawCards()` shuffle danh sách từ store thay vì import `CARDS`.
- `getCardOfTheDay()` nhận danh sách đã sort theo `deck_order` làm tham số.
- Các view không viết SQL trực tiếp.
- UI chỉ cho rút bài sau khi card store đã ready.

Không cần thêm Pinia chỉ cho một danh sách read-only; có thể dùng module singleton với Vue `ref`. Nếu sau này có nhiều entity/settings/history thì mới cân nhắc Pinia.

---

## 8. Migration và cập nhật nội dung

### Fresh install

- App copy `tarot_cardsSQLite.db` mới nhất từ assets.
- Mở database ở `DB_VERSION` hiện tại.

### Người đã cài app

Chỉ sửa file asset bằng DB Browser là **chưa đủ**, vì `copyFromAssets(false)` không ghi đè database đã tồn tại. Mọi thay đổi schema hoặc content cần:

1. Tăng `DB_VERSION`.
2. Tạo file migration SQL mới, ví dụ `002_fix_card_meanings.sql`.
3. Thêm cùng statements vào `upgrades.ts` bằng `addUpgradeStatement`.
4. Cập nhật file source database bằng DB Browser cho fresh install.
5. Test nâng cấp từ database version trước lên version mới.

Ví dụ content migration:

```sql
UPDATE tarot_cards
SET meaning = 'New reviewed content'
WHERE id = 'fool';
```

Không xóa/sửa migration cũ sau khi đã phát hành. Mỗi migration phải chạy trong transaction và có version tăng dần.

---

## 9. Kế hoạch triển khai theo phase

### Phase DB-0 — Chuẩn bị

- [ ] Cài DB Browser for SQLite trên máy phát triển (máy hiện tại chưa có ứng dụng GUI này).
- [x] Tạo cấu trúc `database/source`, `database/migrations`, `database/seeds`.
- [x] Di chuyển type `TarotCard` ra file riêng để database layer không phụ thuộc `cards.ts`.
- [x] Chốt tên DB `tarot_cards`, version `1`, file `tarot_cardsSQLite.db`.

### Phase DB-1 — Tạo và kiểm tra database

- [x] Viết `001_initial.sql`.
- [x] Chuyển 22 object trong `cards.ts` thành `001_major_arcana.sql`.
- [x] Soạn nội dung và đường dẫn ảnh cho 56 lá còn thiếu trong `002_minor_arcana.sql`.
- [x] Đảm bảo đủ 4 suit × 14 rank và có asset SVG cục bộ cho từng lá.
- [x] Tạo file DB tái lập từ schema/seed bằng `database/scripts/build_database.py`; file sẵn sàng mở bằng DB Browser.
- [x] Chạy toàn bộ validation ở mục 5.
- [ ] Commit cả SQL đọc được và file `.db` deploy.

### Phase DB-2 — Tích hợp plugin

- [x] Cài `@capacitor-community/sqlite` major 8 và chạy `npx cap sync android`.
- [x] Thêm `database.ts`, `upgrades.ts`, connection lifecycle.
- [x] Đặt DB asset trong `public/assets/databases`.
- [x] Giữ web-dev bằng `jeep-sqlite`, `sql.js`, wasm và `databases.json`.
- [ ] Xác minh Android SDK/plugin requirements trước khi build native.

### Phase DB-3 — Repository và cutover

- [x] Viết `cardMapper` và `cardRepository`.
- [x] Nạp cards khi app bootstrap và hiển thị error/retry state nếu DB lỗi.
- [x] Sửa `useDrawCards()` dùng card store.
- [x] Sửa Daily Tarot nhận deck từ store nhưng vẫn deterministic.
- [x] Xác minh 22 lá Major được seed từ dữ liệu cũ và kiểm tra riêng 56 lá Minor bằng validation deck.
- [x] Runtime không còn import `CARDS`; `cards.ts` chỉ còn là dữ liệu legacy để đối chiếu migration.

### Phase DB-4 — Test upgrade và phát hành

- [ ] Test fresh install Android.
- [x] Test statement migration v1 → v2 bằng chính parser/runtime SQL; giữ đủ 78 lá và thêm đủ dữ liệu Zodiac.
- [ ] Test web IndexedDB bằng browser thật; hiện đã pass bước mở/query deploy asset bằng `sql.js`.
- [x] Có UI error/retry nếu database không mở được.
- [ ] Chạy toàn bộ Tarot flows, đặc biệt Daily deterministic và rút nhiều lá không trùng.
- [x] Ghi lại quy trình content update bằng DB Browser trong `database/README.md`.

---

## 10. Test cases bắt buộc

### Database

- Mở DB thành công và version đúng.
- Query trả đúng 78 lá active, thứ tự `deck_order` 0–77.
- Có đúng 22 Major và 56 Minor; mỗi suit có đúng 14 rank từ 1–14.
- Không có row thiếu field hoặc `yes_no` sai enum.
- `getById()` trả `null` với id không tồn tại.
- Query luôn parameterized; không nối trực tiếp input vào SQL.

### Nghiệp vụ Tarot

- Yes/No đọc đúng `yesNo` và `yesNoMeaning` từ DB.
- Love/Money/Yearly/3 Card Spread rút đúng số lá và không trùng trong một lượt.
- Daily cùng `dateKey` + cùng deck order luôn ra cùng một card.
- Path ảnh trong DB load được cả web build và Android WebView.

### Lifecycle

- Mở app nhiều lần không tạo connection trùng.
- `copyFromAssets(false)` không ghi đè DB đã có.
- Upgrade v1 → v2 giữ dữ liệu và cập nhật version.
- Fresh install ở version mới nhận DB hoàn chỉnh, không cần chạy lại toàn bộ seed bằng UI.
- App hiện error state rõ ràng nếu DB không mở được; không để màn hình trắng.

---

## 11. Tiêu chí hoàn thành

- [x] Runtime không còn import `CARDS` từ `src/data/cards.ts`.
- [x] Mọi flow lấy bài qua card store/repository.
- [ ] DB Browser mở được file source và thấy đủ 78 lá.
- [ ] Asset DB được copy đúng ở fresh install Android.
- [ ] Migration version hoạt động với app đã cài.
- [ ] Web-dev có SQLite/IndexedDB hoặc có fallback được ghi rõ; cần kiểm thử browser tương tác để hoàn tất.
- [ ] Build web và Android pass: web đã pass; Android chưa chạy được vì máy thiếu Android SDK.
- [x] Có schema, seed và migrations dạng text để review trên Git.

---

## 12. Tài liệu tham chiếu

- [DB Browser for SQLite — trang chính thức](https://sqlitebrowser.org/)
- [`@capacitor-community/sqlite` — repository và hướng dẫn cài đặt](https://github.com/capacitor-community/sqlite)
- [Capacitor SQLite API — `copyFromAssets`, connection và query](https://github.com/capacitor-community/sqlite/blob/master/docs/API.md)
- [Capacitor SQLite — database version upgrades](https://github.com/capacitor-community/sqlite/blob/master/docs/UpgradeDatabaseVersion.md)
- [Capacitor SQLite — Web/Vue usage](https://github.com/capacitor-community/sqlite/blob/master/docs/Web-Usage.md)
- [SQLite `CREATE TABLE`](https://www.sqlite.org/lang_createtable.html)
- [SQLite PRAGMA — `foreign_keys`, `integrity_check`, `user_version`](https://www.sqlite.org/pragma.html)
