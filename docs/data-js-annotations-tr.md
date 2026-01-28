# Data.js Anotasyon Rehberi

Bu rehber, `data.js` dosyanızı inspector.json oluşturma için nasıl yapılandıracağınızı açıklar.

## Bölüm & Grup Etiketleri

Değişkenleri bölüm ve gruplara ayırmak için markdown tarzı yorumlar kullanın:

```javascript
const data = window.gameData ?? {
  // # Bölüm Adı
  // ## Grup Adı
  degiskenAdi: deger,

  // ## Başka Grup
  baskaDegisken: deger,

  // # Başka Bölüm
  // ## Onun Grubu
  dahaDegiskenler: deger,
};
```

### Örnek

```javascript
const data = window.gameData ?? {
  // # Kamera
  // ## Pozisyon
  camPosX: 0,
  camPosY: 5,
  camPosZ: 10,

  // ## Zoom
  camFov: 65,
  camRadius: 10,

  // # Ses
  // ## Arka Plan Müziği
  bgmVolume: 0.5,
  bgmSrc: null,
};
```

---

## Kontrol Tipi Anotasyonları

Otomatik algılanan kontrol tiplerini satır içi anotasyonlarla geçersiz kılın:

| Anotasyon                    | Kontrol Tipi | Örnek                                            |
| ---------------------------- | ------------ | ------------------------------------------------ |
| `@slider: min, max, step`    | Slider       | `speed: 1.0, // @slider: 0, 10, 0.1`             |
| `@dropdown: opt1, opt2, ...` | Dropdown     | `mode: "easy", // @dropdown: easy, medium, hard` |
| `@text`                      | Metin girişi | `value: 123, // @text`                           |
| `@number`                    | Sayı girişi  | `count: "5", // @number`                         |
| `@color`                     | Renk seçici  | `tint: 0xff0000, // @color`                      |
| `@switch`                    | Aç/Kapa      | `count: 1, // @switch`                           |
| `@asset`                     | Asset yükle  | `data: "", // @asset`                            |

### Örnek

```javascript
const data = window.gameData ?? {
  // # Oyun Ayarları
  // ## Zorluk
  difficulty: "normal", // @dropdown: easy, normal, hard, extreme
  gameSpeed: 1.0, // @slider: 0.5, 2.0, 0.1

  // ## Görsel
  backgroundColor: 0x1a1a2e, // @color
  debugMode: false, // (otomatik switch olarak algılanır)
};
```

---

## Otomatik Algılama Kuralları

Anotasyon sağlanmadığında, kontrol tipleri otomatik olarak çıkarılır:

| Değer/Pattern                                      | Algılanan Tip  |
| -------------------------------------------------- | -------------- |
| null                                               | `asset_upload` |
| true / false                                       | `switch`       |
| "#RRGGBB" veya 0xRRGGBB                            | `color_picker` |
| Sayı + isimde "opacity/scale/volume/pos..." varsa  | `slider`       |
| Diğer sayılar                                      | `number`       |
| String'ler                                         | `text`         |

### Slider Otomatik Parametreleri

Slider'lar için min/max/step değişken isminden çıkarılır:

| İsim Kalıbı                  | Aralık              |
| ---------------------------- | ------------------- |
| `opacity`, `alpha`           | 0 → 1, step 0.01    |
| `volume`                     | 0 → 1, step 0.05    |
| `scale`                      | 0 → 5, step 0.05    |
| `fov`                        | 20 → 120, step 1    |
| `theta`, `phi`, `rotation`   | -2π → 2π, step 0.01 |

---

## Hızlı Referans

```javascript
const data = window.gameData ?? {
  // # Bölüm Adı             ← Yeni bölüm oluşturur
  // ## Grup Adı             ← Bölüm içinde yeni grup oluşturur

  // Otomatik algılanan tipler
  enabled: true, // → switch
  logoSrc: null, // → asset_upload
  bgColor: "#ffffff", // → color_picker
  opacity: 0.8, // → slider (0-1)
  count: 5, // → number
  title: "Hello", // → text

  // Manuel geçersiz kılmalar
  mode: "a", // @dropdown: a, b, c
  speed: 1, // @slider: 0, 10, 0.5
};

export default data;
```
