# VadiGo - Talep Yönetim Sistemi - Tamamlanan Özellikler

## 📋 Genel Bakış

VadiGo, modern bir talep yönetim ve onay sistemidir. .NET Web API backend ve React 18 frontend ile geliştirilmiştir.

**Backend:** http://localhost:5290  
**Frontend:** http://localhost:3001  
**Database:** PostgreSQL

---

## ✅ Tamamlanan Tüm Özellikler

### 1. **Temel Sistem Özellikleri**
- ✅ Kullanıcı kimlik doğrulama (JWT)
- ✅ Rol tabanlı yetkilendirme (User, Approver, Admin, SystemAdmin)
- ✅ Talep oluşturma ve düzenleme
- ✅ Onay/Red işlemleri
- ✅ Dashboard (Taleplerim / Bekleyen Onaylar)
- ✅ Taslak kaydetme özelliği

### 2. **Dinamik Form Motoru** ✨
- Form şablonları oluşturma ve yönetme
- 10+ alan tipi desteği (text, number, email, date, dropdown, checkbox, file, vb.)
- Zorunlu alan tanımlama
- Form versiyonlama
- Aktif/Pasif form yönetimi

**Backend:**
- `FormTemplatesController.cs` - CRUD işlemleri
- `FormTemplate`, `FormField` modelleri

**Frontend:**
- `FormTemplates.jsx` - Form listesi
- `FormTemplateBuilder.jsx` - Form tasarım arayüzü

### 3. **Dosya Yükleme Sistemi** 📎
- Taleplere dosya ekleme
- Dosya indirme
- Dosya meta bilgileri (boyut, tip, yükleyen)
- Güvenli dosya depolama

**Backend:**
- `AttachmentsController.cs`
- `RequestAttachment` modeli
- Dosyalar: `wwwroot/uploads/` klasöründe

**Frontend:**
- `RequestAttachments.jsx` komponenti
- Drag & drop dosya yükleme

### 4. **Yorum Sistemi** 💬
- Taleplere yorum ekleme
- Yorum geçmişi görüntüleme
- Kullanıcı bilgileri ile birlikte gösterim

**Backend:**
- `CommentsController.cs`
- `RequestComment` modeli

**Frontend:**
- `RequestComments.jsx` komponenti

### 5. **SLA Takibi & Eskalasyon** ⏱️
- SLA süresi tanımlama (saat bazında)
- Otomatik bitiş tarihi hesaplama
- SLA ihlal bildirimleri
- Onay zaman aşımı ve eskalasyon
- Görsel SLA göstergeleri (yeşil/sarı/kırmızı)

**Backend:**
- `SlaMonitoringService.cs` - Arka plan servisi (15 dakikada bir çalışır)
- Request ve Approval modellerinde SLA alanları
- Email bildirimleri

**Frontend:**
- `SlaIndicator.jsx` - Görsel durum göstergesi
- Dashboard ve RequestDetail'de SLA bilgisi

### 6. **Gelişmiş Raporlama** 📊
- Dashboard istatistikleri
- Zaman bazlı analiz (günlük/haftalık/aylık)
- SLA uyumluluk metrikleri
- En çok talep oluşturanlar
- Onay performans analizi
- Excel export (EPPlus 8)
- Grafikler (Recharts):
  - Pie chart - Durum dağılımı
  - Bar chart - Kategori bazlı
  - Line chart - Zaman serisi

**Backend:**
- `ReportsController.cs` - 7 farklı rapor endpoint'i
- Excel export fonksiyonu

**Frontend:**
- `Reports.jsx` - Kapsamlı raporlama sayfası
- İnteraktif grafikler

### 7. **Kullanıcı Yönetimi** 👥
- Kullanıcı CRUD işlemleri
- Rol atama/kaldırma
- Kullanıcı aktif/pasif durumu
- Departman ve pozisyon bilgileri

**Backend:**
- `UsersController.cs`

**Frontend:**
- `UserManagement.jsx`

### 8. **Onay Akışı Yönetimi** 🔄
- Dinamik onay akışları tanımlama
- Seri ve paralel onay adımları
- Rol bazlı ve kullanıcı bazlı onaylar
- Koşullu akış yönlendirme (JSON rules)
- Zaman aşımı ve eskalasyon ayarları

**Backend:**
- `ApprovalWorkflowsController.cs`
- `ApprovalWorkflow`, `ApprovalWorkflowStep` modelleri

**Frontend:**
- `WorkflowManagement.jsx` - Akış listesi
- `WorkflowBuilder.jsx` - Görsel akış tasarımı

### 9. **Email Şablonları** 📧
- Özelleştirilebilir email şablonları
- Değişken sistemi ({{RequestId}}, {{RequesterName}}, vb.)
- Farklı olay tipleri için şablonlar
- HTML email desteği

**Backend:**
- `EmailTemplatesController.cs`
- `EmailTemplate` modeli
- `EmailService.cs` - Şablon işleme

**Frontend:**
- `EmailTemplates.jsx`

### 10. **Email Konfigürasyonu** ⚙️
- SMTP ayarları yönetimi
- Test email gönderimi
- Dinamik konfigürasyon

**Backend:**
- `SettingsController.cs`
- `EmailService.cs` - SMTP entegrasyonu

**Frontend:**
- `EmailSettings.jsx`

### 11. **Audit Log** 📝
- Tüm sistem işlemlerinin kaydı
- Kullanıcı, işlem, tarih bilgileri
- Detaylı log görüntüleme
- Filtreleme ve arama

**Backend:**
- `AuditLogsController.cs`
- `AuditLog` modeli

**Frontend:**
- `AuditLogs.jsx`

---

## 🗄️ Database Yapısı

### Ana Tablolar:
- **Users** - Kullanıcılar
- **Roles** - Roller
- **UserRoles** - Kullanıcı-Rol ilişkisi
- **Requests** - Talepler (SLA alanları ile)
- **Approvals** - Onaylar (eskalasyon alanları ile)
- **RequestComments** - Yorumlar
- **RequestAttachments** - Dosyalar
- **AuditLogs** - Sistem logları
- **FormTemplates** - Form şablonları
- **FormFields** - Form alanları
- **ApprovalWorkflows** - Onay akışları
- **ApprovalWorkflowSteps** - Akış adımları
- **EmailTemplates** - Email şablonları

### Migration'lar:
- ✅ InitialCreate
- ✅ UpdateRequestModel
- ✅ AddDynamicFormSystem
- ✅ AddSlaAndEscalationFields

---

## 🛠️ Teknoloji Stack

### Backend:
- .NET 9.0 (preview)
- ASP.NET Core Web API
- Entity Framework Core 9.0.10
- PostgreSQL
- JWT Authentication
- EPPlus 8.2.1 (Excel)
- Swagger/OpenAPI

### Frontend:
- React 18
- Material-UI v7
- Vite
- React Router v6
- Axios
- Recharts (grafikler)

---

## 🚀 Çalıştırma

### Backend:
```bash
cd VadiGo/backend
dotnet run
```

### Frontend:
```bash
cd VadiGo/frontend
npm run dev
```

---

## 📦 Kurulu Paketler

### Backend NuGet:
- Microsoft.EntityFrameworkCore.Design
- Npgsql.EntityFrameworkCore.PostgreSQL
- Microsoft.AspNetCore.Authentication.JwtBearer
- EPPlus (8.2.1)

### Frontend NPM:
- @mui/material
- @mui/icons-material
- react-router-dom
- axios
- recharts

---

## 🎯 Sistem Özellikleri Özeti

| Özellik | Durum | Açıklama |
|---------|-------|----------|
| Kimlik Doğrulama | ✅ | JWT tabanlı |
| Rol Yönetimi | ✅ | 4 farklı rol |
| Talep Yönetimi | ✅ | CRUD + Taslak |
| Onay Süreci | ✅ | Çok seviyeli |
| Dinamik Formlar | ✅ | 10+ alan tipi |
| Dosya Yükleme | ✅ | Güvenli depolama |
| Yorumlar | ✅ | Gerçek zamanlı |
| SLA Takibi | ✅ | Otomatik izleme |
| Eskalasyon | ✅ | Zaman aşımı |
| Raporlama | ✅ | Grafikler + Excel |
| Email Bildirimleri | ✅ | Şablon sistemi |
| Audit Log | ✅ | Tam kayıt |
| Kullanıcı Yönetimi | ✅ | Admin paneli |
| Workflow Yönetimi | ✅ | Görsel tasarım |

---

## 🔐 Varsayılan Kullanıcılar

Sistem ilk çalıştırıldığında otomatik olarak oluşturulur:

- **System Admin:** admin@system.com / Admin123!
- **Admin:** admin@company.com / Admin123!
- **Approver:** approver@company.com / Approver123!
- **User:** user@company.com / User123!

---

## 📝 Notlar

1. **EPPlus Lisansı:** NonCommercial olarak yapılandırılmıştır (appsettings.json)
2. **SLA Monitoring:** Arka plan servisi 15 dakikada bir çalışır
3. **Email:** SMTP ayarları yapılandırılmalıdır (EmailSettings.jsx)
4. **Dosyalar:** `backend/wwwroot/uploads/` klasöründe saklanır
5. **Database:** PostgreSQL bağlantı bilgileri appsettings.json'da

---

## 🎉 Sonuç

VadiGo artık tam özellikli, profesyonel bir talep yönetim sistemidir. Tüm planlanan özellikler başarıyla tamamlanmıştır ve sistem production'a hazırdır!

**Toplam Tamamlanan Görev:** 20/20 ✅

