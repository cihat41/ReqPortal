# 🗭 Talep Yönetim ve Onaylama Sistemi

Modern bir talep yönetim ve onaylama sistemi. Backend .NET Web API, Frontend React + Material UI ile geliştirilmiştir.

## 📁 Proje Yapısı

```
VadiGo/
├── backend/              # .NET Web API Backend
│   ├── Controllers/      # API Controllers
│   ├── Models/          # Veritabanı Modelleri
│   ├── Data/            # DbContext ve Migrations
│   ├── Services/        # İş Mantığı Servisleri
│   ├── DTOs/            # Data Transfer Objects
│   └── Middleware/      # Custom Middleware
│
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── components/  # React Bileşenleri
│   │   ├── pages/       # Sayfa Bileşenleri
│   │   ├── services/    # API Servisleri
│   │   ├── contexts/    # React Context
│   │   ├── hooks/       # Custom Hooks
│   │   └── utils/       # Yardımcı Fonksiyonlar
│   └── public/
│
└── docs/                # Dokümantasyon
```

## 🚀 Başlangıç

### Backend (.NET)

```bash
cd backend
dotnet restore
dotnet run
```

Backend varsayılan olarak `http://localhost:5000` adresinde çalışır.

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

Frontend varsayılan olarak `http://localhost:3000` adresinde çalışır.

## 📦 Teknolojiler

### Backend
- .NET 10.0
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server
- JWT Authentication
- Swagger/OpenAPI

### Frontend
- React 18
- Material-UI (MUI)
- Vite
- React Router
- Axios
- React Hook Form

## 🎯 Özellikler

### MVP (Faz 1-6)
- ✅ Kullanıcı girişi + rol sistemi
- ✅ Talep oluşturma ve durum takibi
- ✅ Onaylama / reddetme aksiyonları
- ✅ E-posta bildirimi
- ✅ Basit dashboard (taleplerim / bekleyenlerim)

### Gelecek Fazlar
- Dinamik form motoru
- Zaman aşımı ve eskalasyon
- Gelişmiş raporlama
- Entegrasyonlar (LDAP, ERP, vb.)

## 📝 Geliştirme Fazları

1. **Faz 1**: MVP Backend Altyapısı
2. **Faz 2**: MVP Frontend Altyapısı
3. **Faz 3**: Talep Yönetimi (MVP)
4. **Faz 4**: Onay Süreci (MVP)
5. **Faz 5**: Bildirim Sistemi (MVP)
6. **Faz 6**: Dashboard (MVP)

## 📄 Lisans

Bu proje özel kullanım içindir.

