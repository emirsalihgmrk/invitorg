# Proje Roadmap'i: Küçük Etkinlikler için Davet, Ödeme ve QR Giriş Platformu

> Bitirme projesi · Next.js · 12 haftalık plan
> Durum: Taslak (v0.1) · Tarih: 22 Kasım 2026

## 1. Proje Özeti

**Fikir:** Yemek daveti, supper club, atölye ve kulüp etkinliği gibi küçük ve özel etkinlikler için davetiye, kayıt, ödeme ve QR kodlu girişi tek yerde çözen web uygulaması.

**Problem:** Küçük etkinliklerin ev sahipleri bugün WhatsApp grubu, IBAN ile ödeme ve Excel listesiyle ilerliyor. Kimin ödediği, kimin geleceği, alerji ve menü tercihleri ve girişte kimin içeri alınacağı karmaşık ve hataya açık.

**Rakipler ve fark:** Bubilet, Biletinial ve Passo büyük biletlemeye odaklı. Eventbrite ve Luma geneldir. Bu proje **küçük ve özel etkinliklere** odaklanır: kişiye özel davet linki, menü ve alerji tercihi, bekleme listesi, çevrimdışı çalışabilen giriş kontrolü.

**Slogan taslağı:** "Küçük etkinlikler için davet, ödeme ve girişi tek yerde çöz."

## 2. Roller ve Çekirdek Akış

**Roller**

- **Host:** Etkinliği oluşturan ve yöneten kişi.
- **Misafir:** Kayıt olan ve bilet alan kişi.
- **Görevli (Staff):** Girişte QR okutan kişi (host tarafından atanır).

**Ana akış**

1. Host etkinlik oluşturur (başlık, mekân, tarih, kontenjan, fiyat, iptal ve iade politikası).
2. Etkinlik sayfası yayınlanır: herkese açık ya da yalnızca davet linkiyle.
3. Misafir kayıt olur, bilet türünü ve menü tercihini seçer, öder.
4. Misafire benzersiz bir QR bilet verilir (sayfada ve e-postada).
5. Girişte görevli QR'ı telefon kamerasıyla okutur: **geçerli / kullanılmış / geçersiz**.
6. Host panelinde canlı doluluk, ödeme durumu ve giriş yapanlar izlenir.

## 3. Kapsam

### MVP (mutlaka bitecek)

- [ ] Kayıt, giriş ve rol yönetimi
- [x] Etkinlik oluşturma, düzenleme, yayınlama (CRUD)
- [x] Paylaşılabilir etkinlik sayfası (slug)
- [ ] Bilet türleri ve kontenjan kontrolü
- [ ] Ödeme (sandbox) ve sipariş yönetimi
- [ ] QR bilet üretimi ve e-posta ile gönderim
- [ ] "Biletlerim" sayfası
- [ ] Tarayıcı kamerasıyla QR okutma (check-in) sayfası
- [ ] Katılımcı listesi ve CSV dışa aktarma

### Farklılaştırıcı özellikler (2-3 tanesi seçilecek)

- [ ] **Menü seçimi, alerji ve diyet tercihi alanları** (kolay, yüksek değer)
- [ ] **Kişiye özel davet linki ve +1 hakkı** (orta)
- [ ] **Bekleme listesi:** iptal olunca sıradaki kişiye otomatik bilet (orta)
- [ ] Menü ya da tarih oylaması (oylama çekirdeği ile, kolay)
- [ ] Çevrimdışı check-in (PWA) (zor)
- [ ] Grup ödemesi: herkes kendi payını öder (zor)
- [ ] Masa planı ve oturma düzeni (orta-zor)

### Bonus (zaman kalırsa)

- [ ] Etkinlik sonrası geri bildirim anketi
- [ ] Fotoğraf albümü
- [ ] Hatırlatma e-postaları (etkinlikten 24 saat önce)
- [ ] Çoklu dil desteği (TR/EN)

## 4. Teknoloji Yığını

| Katman            | Seçim                                          |
| ----------------- | ---------------------------------------------- |
| Framework         | Next.js (App Router), TypeScript               |
| UI                | Tailwind CSS, shadcn/ui                        |
| Veritabanı        | PostgreSQL (Neon veya Supabase)                |
| ORM               | Prisma veya Drizzle                            |
| Kimlik doğrulama  | Auth.js (NextAuth)                             |
| Doğrulama         | Zod, React Hook Form                           |
| Ödeme             | iyzico veya PayTR (sandbox)                    |
| E-posta           | Resend veya Nodemailer                         |
| QR üretimi        | `qrcode` paketi                                |
| QR okuma          | `@yudiel/react-qr-scanner` veya `html5-qrcode` |
| Zamanlanmış işler | Vercel Cron                                    |
| Test              | Vitest (birim), Playwright (uçtan uca)         |
| Deploy            | Vercel + Neon/Supabase                         |

## 5. Veri Modeli Taslağı

```
User(id, email, name, role)
Event(id, slug, hostId, title, description, venue, startsAt,
      capacity, isPrivate, status, refundPolicy)
TicketType(id, eventId, name, price, quota)
MenuOption(id, eventId, name, dietaryTags)
Order(id, userId, eventId, status, total, expiresAt)
Payment(id, orderId, provider, providerRef, status)
Ticket(id, orderId, eventId, holderName, menuOptionId?,
       qrToken, status, checkedInAt?, checkedInBy?)
Invitation(id, eventId, email?, code, plusOnes, usedAt?)
CheckInLog(id, ticketId, staffId, result, scannedAt)
WaitlistEntry(id, eventId, userId, position)
```

## 6. Kritik Teknik Kararlar

### 6.1 QR bilet güvenliği

- QR içinde yalnızca rastgele, tahmin edilemez bir token (veya HMAC/JWT ile imzalı değer) bulunur. Kişisel veri bulunmaz.
- Check-in atomik yapılır: `UPDATE ... SET checked_in_at = now() WHERE id = ? AND checked_in_at IS NULL`. Aynı QR ikinci kez okutulursa reddedilir.
- Her tarama `CheckInLog` tablosuna yazılır (kim, ne zaman, sonuç).

### 6.2 Kontenjan yarışı (race condition)

- Son yer için iki kişi aynı anda ödemeye giderse: ödeme öncesi **10 dakikalık geçici rezervasyon (hold)**, veritabanı transaction'ı ve satır kilidi kullanılır.
- Süresi dolan rezervasyonlar cron ile temizlenir ve yer serbest bırakılır.

### 6.3 Ödeme

- Webhook ile ödeme onayı alınır; işlemler **idempotent** olmalı (aynı webhook iki kez gelirse çift bilet üretilmez).
- Projede **sandbox/test modu** kullanılır. Gerçek para toplamak şirket veya üye iş yeri hesabı gerektirir. Bu sınırlama raporda açıkça belirtilir.

### 6.4 Gizlilik (KVKK)

- Toplanan kişisel veri minimum tutulur (ad, e-posta, alerji bilgisi).
- Aydınlatma metni ve veri saklama süresi tanımlanır.
- Alerji ve diyet bilgisi "özel nitelikli" olabileceği için yalnızca host'a görünür.

### 6.5 Kötüye kullanım ve güvenlik

- Rate limiting (giriş, kayıt, check-in uçları), girdi doğrulama (Zod), XSS ve CSRF koruması.
- Davet kodları ve slug'lar tahmin edilemez olmalı.
- Rol bazlı yetkilendirme: görevli yalnızca atandığı etkinliğin check-in'ini yapabilir.

## 7. Haftalık Plan (12 Hafta)

### Faz 1: Analiz ve Tasarım

**Hafta 1: Analiz**

- [ ] Rakip analizi (Luma, Eventbrite, Bubilet) ve karşılaştırma tablosu
- [ ] Kullanıcı hikâyeleri ve kabul kriterleri
- [ ] Wireframe (Figma): etkinlik sayfası, host paneli, check-in ekranı
- [ ] **Çıktı:** Gereksinim dokümanı, wireframe'ler

**Hafta 2: Kurulum** ✅

- [x] Next.js projesi, ESLint/Prettier, CI (GitHub Actions)
- [x] Veritabanı şeması ve ilk migration
- [x] Kimlik doğrulama ve rol yapısı
- [x] **Çıktı:** Çalışan iskelet, deploy edilmiş boş uygulama

### Faz 2: MVP Çekirdeği

**Hafta 3-4: Etkinlik yönetimi** ✅

- [x] Etkinlik CRUD, yayın sayfası, bilet türleri
- [x] Kontenjan mantığı
- [x] Host paneli (liste ve detay)
- [x] **Çıktı:** Host etkinlik oluşturup link paylaşabiliyor

**Hafta 5-6: Sipariş ve ödeme**

- [ ] Sepet/sipariş akışı, geçici rezervasyon (hold)
- [ ] Ödeme sağlayıcı entegrasyonu (sandbox), webhook
- [ ] Süresi dolan rezervasyon temizliği (cron)
- [ ] **Çıktı:** Misafir sandbox ödemesiyle bilet alabiliyor

**Hafta 7: QR bilet**

- [ ] QR üretimi, e-posta gönderimi
- [ ] "Biletlerim" sayfası
- [ ] **Çıktı:** Ödeme sonrası QR bilet e-postayla geliyor

**Hafta 8: Check-in**

- [ ] Görevli rolü ve atama
- [ ] Kamera ile QR okutma sayfası
- [ ] Çift okutma koruması, `CheckInLog`
- [ ] Host panelinde canlı doluluk
- [ ] **Çıktı:** Uçtan uca akış çalışıyor (**MVP tamam, 8. hafta sonu demo**)

### Faz 3: Farklılaştırma

**Hafta 9-10: Özel özellikler**

- [ ] Menü ve alerji alanları
- [ ] Kişiye özel davet linki ve +1 hakkı
- [ ] Bekleme listesi
- [ ] (Zaman varsa) PWA ve çevrimdışı check-in
- [ ] **Çıktı:** En az 2-3 farklılaştırıcı özellik çalışıyor

### Faz 4: Kalite ve Teslim

**Hafta 11: Test ve pilot**

- [ ] Birim ve uçtan uca testler (ödeme, check-in, kontenjan yarışı)
- [ ] Güvenlik gözden geçirmesi, performans, responsive düzeltmeler
- [ ] **Gerçek bir etkinlikte pilot** (arkadaş yemeği, kulüp etkinliği), 10-15 kişi
- [ ] Kullanılabilirlik anketi (SUS)
- [ ] **Çıktı:** Test raporu, kullanıcı geri bildirimi

**Hafta 12: Rapor ve sunum**

- [ ] Bitirme raporu, UML diyagramları, test sonuçları
- [ ] Sunum ve demo senaryosu, yedek plan (demo çökerse ekran kaydı)
- [ ] **Çıktı:** Teslim edilebilir rapor ve sunum

## 8. Kilometre Taşları

| Hafta | Kilometre taşı                            |
| ----- | ----------------------------------------- |
| 2 ✅  | İskelet uygulama deploy edildi            |
| 4 ✅  | Etkinlik oluşturma ve yayın çalışıyor     |
| 6     | Sandbox ödeme çalışıyor                   |
| **8** | **MVP tamam: ödeme → QR → check-in**      |
| 10    | Farklılaştırıcı özellikler tamam          |
| 11    | Pilot etkinlik ve kullanıcı testi yapıldı |
| 12    | Rapor ve sunum teslim                     |

## 9. Riskler ve Önlemler

| Risk                                      | Olasılık | Etki   | Önlem                                                   |
| ----------------------------------------- | -------- | ------ | ------------------------------------------------------- |
| Ödeme entegrasyonu beklenenden uzun sürer | Orta     | Yüksek | 5. haftadan önce sandbox hesabını aç, erken dene        |
| Kapsam şişmesi (masa planı, grup ödemesi) | Yüksek   | Orta   | MVP bitmeden zor özelliklere başlama                    |
| Demo günü internet veya kamera sorunu     | Orta     | Yüksek | Ekran kaydı yedeği, mobil hotspot, önceden test         |
| Kontenjan yarışında çift satış            | Düşük    | Yüksek | Transaction ve kilit, yük testi                         |
| "Eventbrite varken neden bu?" sorusu      | Yüksek   | Orta   | Niş konumlandırmayı ve karşılaştırma tablosunu hazırla  |
| Kişisel veri ve KVKK eksikleri            | Orta     | Orta   | Aydınlatma metni, veri minimizasyonu, rapora ayrı bölüm |

## 10. Rapor ve Savunma Kontrol Listesi

- [ ] Rakip karşılaştırma tablosu
- [ ] Gereksinim analizi (fonksiyonel ve fonksiyonel olmayan)
- [ ] UML: use case, ER diyagramı, sıralama diyagramı (satın alma ve check-in)
- [ ] Tasarım kararlarının gerekçeleri (QR güvenliği, kontenjan yarışı, idempotent webhook)
- [ ] Test sonuçları ve kullanıcı testi (SUS skoru)
- [ ] Sınırlılıklar: sandbox ödeme, VPN/çoklu hesap, çevrimdışı durum
- [ ] Gelecek çalışmalar
- [ ] Canlı demo: jüriye etkinlik sayfasından bilet aldırıp QR'ı okutma

## 11. Açık Sorular

1. Odak yalnızca **yemek daveti** mi, yoksa genel küçük etkinlikler mi?
2. Ödeme yalnızca sandbox'ta mı gösterilecek?
3. Teslim tarihi ve haftalık ayrılabilecek süre nedir?
4. Hangi 2-3 farklılaştırıcı özellik seçilecek?
5. Projede tek kişi mi çalışılacak, ekip var mı?
