# 🚀 Frontend Quick Start Guide

## ขั้นตอนการติดตั้งและรันแบบรวดเร็ว

### 1. Prerequisites

```bash
# ตรวจสอบ Node.js (ต้อง 18+)
node -v

# ตรวจสอบ npm
npm -v
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

### 3. Configure Environment

```bash
# Copy example env
cp .env.local.example .env.local

# Edit .env.local
nano .env.local
```

เนื้อหาใน `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 4. Run Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ `http://localhost:3000`

### 5. Login

**ใช้บัญชี Admin:**
- Username: `admin`
- Password: `admin123`

**หรือลงทะเบียนใหม่:**
- ไปที่หน้า Register
- กรอกข้อมูล
- Login ด้วยบัญชีที่สร้าง

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Utilities
npm run lint         # Check code quality
```

## 🎯 Quick Test Scenarios

### Scenario 1: Student Journey

```bash
1. Register → ลงทะเบียนนักเรียนใหม่
2. Login → เข้าสู่ระบบด้วยบัญชีที่สร้าง
3. Upload Timetable → อัพโหลดรูปตารางเรียน
4. View Projects → ดูโปรเจคที่เข้าร่วม
```

### Scenario 2: PM Journey

```bash
1. Admin login → เข้าสู่ระบบด้วย admin
2. Create Project → สร้างโปรเจคใหม่
3. Assign PM → แต่งตั้งให้นักเรียนเป็น PM
4. PM login → PM login และจัดการโปรเจค
5. Add Members → เพิ่มสมาชิกเข้าทีม
6. Update Status → อัพเดตสถานะโปรเจค
```

### Scenario 3: Admin Dashboard

```bash
1. Admin login → เข้าสู่ระบบ admin
2. Dashboard → ดูภาพรวมทั้งหมด
3. View Projects → ดูโปรเจคแต่ละสถานะ
4. Manage Users → จัดการผู้ใช้
```

## 🔧 Troubleshooting

### Port Already in Use

```bash
# Use different port
PORT=3001 npm run dev
```

### API Connection Error

1. ตรวจสอบว่า Backend กำลังรันอยู่ที่ `http://localhost:8080`
2. ตรวจสอบ `NEXT_PUBLIC_API_URL` ใน `.env.local`
3. ตรวจสอบ CORS configuration ใน Backend

### Token Expired

- Login ใหม่เพื่อรับ token ใหม่

### Dependencies Error

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Key Features to Test

### ✅ Authentication
- [x] Login with admin/admin123
- [x] Register new student
- [x] Logout and re-login

### ✅ Student Features
- [x] View dashboard
- [x] Upload timetable image
- [x] View timetable with color coding
- [x] View assigned projects
- [x] Update profile

### ✅ PM Features
- [x] View managed projects
- [x] Add team members
- [x] Remove team members
- [x] Update project status
- [x] Filter students by specialty

### ✅ Admin Features
- [x] Create new project
- [x] Assign PM to project
- [x] View all users
- [x] Change user roles
- [x] Delete users
- [x] View project overview
- [x] Monitor overdue projects

## 🎨 UI Components

### Test All Variants

**Buttons:**
- Default (blue)
- Destructive (red)
- Outline
- Secondary
- Ghost
- Link

**Project Status:**
- NOT_STARTED (gray)
- IN_PROCESS (blue)
- TEST (yellow)
- REVIEW (purple)
- DONE (green)
- HELP (red)

## 📱 Responsive Testing

Test on different screen sizes:
- Mobile: 320px - 768px
- Tablet: 768px - 1024px
- Desktop: 1024px+

## 🔄 Full Workflow Test

### Complete Test Flow (15 minutes)

1. **Setup (2 min)**
   - Start Backend
   - Start Frontend
   - Open browser

2. **Admin Tasks (3 min)**
   - Login as admin
   - Create 2 projects
   - Assign PMs

3. **Register Students (3 min)**
   - Register 3-4 students
   - Different specialties

4. **PM Tasks (3 min)**
   - Login as PM
   - Add members to projects
   - Update project status

5. **Student Tasks (2 min)**
   - Login as student
   - Upload timetable
   - View projects

6. **Admin Monitoring (2 min)**
   - View dashboard
   - Check project status
   - Monitor deadlines

## 📊 Sample Test Data

### Test Users to Create:

```javascript
// Student 1
{
  firstName: "สมชาย",
  yearLevel: "ปี 3",
  specialty: "Backend",
  username: "somchai",
  password: "test123"
}

// Student 2
{
  firstName: "สมหญิง",
  yearLevel: "ปี 4",
  specialty: "Frontend",
  username: "somying",
  password: "test123"
}

// Student 3
{
  firstName: "วิชัย",
  yearLevel: "ปี 2",
  specialty: "UX/UI",
  username: "wichai",
  password: "test123"
}
```

### Test Projects:

```javascript
// Project 1
{
  projectName: "E-Commerce Website",
  difficultyLevel: 4,
  durationDays: 30,
  pmUserId: 2, // somchai
  startDate: "2025-01-01"
}

// Project 2
{
  projectName: "Mobile App",
  difficultyLevel: 5,
  durationDays: 45,
  pmUserId: 3, // somying
  startDate: "2025-01-15"
}
```

## ⏱️ Performance Benchmarks

Expected loading times:
- Initial page load: < 2s
- Dashboard load: < 1s
- API calls: < 500ms
- Navigation: < 100ms

## 🎯 Success Criteria

Frontend is working correctly if:
- ✅ All pages load without errors
- ✅ Login/Register works
- ✅ Role-based routing works
- ✅ API calls succeed
- ✅ UI is responsive
- ✅ Toast notifications appear
- ✅ Forms validate properly

## 📝 Development Tips

1. **Hot Reload**: Changes auto-refresh
2. **Console**: Check for errors in DevTools
3. **Network Tab**: Monitor API calls
4. **React DevTools**: Inspect components

## 🐛 Common Errors & Solutions

### "Module not found"
```bash
npm install
```

### "API call failed"
- Check Backend is running
- Check .env.local configuration

### "Token invalid"
- Clear cookies
- Login again

### "Page not found"
- Check URL spelling
- Check route exists

## 🚀 Next Steps

1. ✅ Complete quick test
2. ✅ Test all features
3. ✅ Test responsive design
4. ✅ Test error handling
5. ✅ Build for production

```bash
npm run build
npm start
```

## 📞 Need Help?

1. Check Browser Console
2. Check Terminal logs
3. Check Network tab
4. Read README.md
5. Check Backend logs

---

**You're all set! Start building! 🎉**
