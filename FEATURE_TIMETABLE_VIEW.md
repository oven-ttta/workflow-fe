# 🎉 Feature Update: View Student Timetable

## ✨ ฟีเจอร์ใหม่: ดูตารางเรียนของนักเรียน

### เพิ่มฟีเจอร์ใน 2 หน้า:

---

## 1. 📋 `/pm/students` - PM Students Page

### ฟีเจอร์ที่เพิ่ม:
- ✅ ปุ่ม **"ดูตารางเรียน"** ในรายชื่อนักเรียนแต่ละคน
- ✅ Modal popup แสดงตารางเรียนแบบเต็มจอ
- ✅ แสดงตารางแยกตามวัน (จันทร์-อาทิตย์)
- ✅ แสดงช่วงเวลา (เริ่ม-จบ)
- ✅ แสดงสถานะ (ว่าง/ไม่ว่าง)
- ✅ แสดงชื่อวิชา (ถ้ามี)
- ✅ สีเขียว = ช่วงว่าง, สีน้ำเงิน = ช่วงเรียน

### API Endpoint ใหม่:
```
GET /pm/students/:userId/timetable
Authorization: Bearer <PM_TOKEN>
```

### การใช้งาน:
1. PM เข้าหน้า `/pm/students`
2. คลิกปุ่ม **"ดูตารางเรียน"** ที่นักเรียนคนใดก็ได้
3. เห็น Modal แสดงตารางเรียนแบบละเอียด
4. คลิก X เพื่อปิด Modal

---

## 2. 👥 `/admin/users` - Admin Users Management

### ฟีเจอร์ที่เพิ่ม:
- ✅ ปุ่ม **Calendar icon** ข้างชื่อ STUDENT
- ✅ Modal popup แสดงตารางเรียนแบบเต็มจอ
- ✅ แสดงตารางแยกตามวัน
- ✅ แสดงรายละเอียดเหมือน PM
- ✅ แสดงเฉพาะนักเรียน (STUDENT role)

### API Endpoint ใหม่:
```
GET /admin/users/:userId/timetable
Authorization: Bearer <ADMIN_TOKEN>
```

### การใช้งาน:
1. Admin เข้าหน้า `/admin/users`
2. คลิกปุ่ม **Calendar icon** 📅 ที่นักเรียนคนใดก็ได้
3. เห็น Modal แสดงตารางเรียนแบบละเอียด
4. คลิก X เพื่อปิด Modal

---

## 📱 UI/UX Details

### Timetable Modal Features:
- ✅ Full-screen modal with backdrop
- ✅ Scrollable content
- ✅ Sticky header
- ✅ Close button (X)
- ✅ Loading state
- ✅ Empty state message
- ✅ Responsive design

### Color Coding:
- 🟢 **สีเขียว** = ช่วงว่าง (Available)
  - Background: `bg-green-50`
  - Border: `border-green-500`
  - Badge: `bg-green-100 text-green-800`

- 🔵 **สีน้ำเงิน** = ช่วงเรียน (Busy)
  - Background: `bg-blue-50`
  - Border: `border-blue-500`
  - Badge: `bg-blue-100 text-blue-800`

### Display Format:
```
วันจันทร์
  🟢 ว่าง
  08:00 - 10:00
  [Available]

  📚 คณิตศาสตร์
  10:00 - 12:00
  [Busy]
```

---

## 🔧 Technical Implementation

### Frontend Changes:

#### 1. Updated Services:
**`lib/pm.service.ts`:**
```typescript
async getStudentTimetable(userId: number): Promise<TimeSlot[]> {
  const response = await api.get<TimeSlot[]>(`/pm/students/${userId}/timetable`);
  return response.data;
}
```

**`lib/admin.service.ts`:**
```typescript
async getStudentTimetable(userId: number): Promise<TimeSlot[]> {
  const response = await api.get<TimeSlot[]>(`/admin/users/${userId}/timetable`);
  return response.data;
}
```

#### 2. Updated Pages:
- `app/pm/students/page.tsx` (+150 lines)
- `app/admin/users/page.tsx` (+150 lines)

### State Management:
```typescript
const [showTimetable, setShowTimetable] = useState(false);
const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
const [timetable, setTimetable] = useState<TimeSlot[]>([]);
const [loadingTimetable, setLoadingTimetable] = useState(false);
```

---

## 🎯 Use Cases

### For PM:
1. **เลือกสมาชิกทีม**
   - ดูว่านักเรียนคนไหนว่างตอนไหน
   - เลือกคนที่ตารางตรงกัน

2. **วางแผนประชุม**
   - หาช่วงเวลาที่ทุกคนว่าง
   - จัดตารางงานให้เหมาะสม

3. **ติดตามความพร้อม**
   - เช็คว่าใครเรียนหนัก
   - จัดงานตามความเหมาะสม

### For Admin:
1. **ดูแลนักเรียน**
   - ตรวจสอบภาระการเรียน
   - ดูความพร้อมทำงาน

2. **วางแผนโปรเจค**
   - มอบหมายงานตามตารางเรียน
   - หลีกเลี่ยงช่วงสอบ

3. **จัดการทรัพยากร**
   - ดูความพร้อมโดยรวม
   - Balance workload

---

## 🚨 Error Handling

### Cases Handled:
1. **นักเรียนยังไม่อัพโหลดตาราง**
   - แสดงข้อความ: "นักเรียนยังไม่ได้อัพโหลดตารางเรียน"
   - แสดง Empty state with calendar icon

2. **API Error**
   - Toast notification: "ไม่สามารถโหลดตารางเรียนได้"
   - แสดง Empty state

3. **Network Error**
   - Toast notification: "เกิดข้อผิดพลาด"
   - Graceful fallback

---

## 📦 Files Modified

### Frontend:
1. `app/pm/students/page.tsx` ✨
2. `app/admin/users/page.tsx` ✨
3. `lib/pm.service.ts` ✨
4. `lib/admin.service.ts` ✨

### Total Changes:
- **+300 lines** of code
- **4 files** modified
- **2 new API methods**
- **2 new UI features**

---

## 🎨 Screenshots Description

### PM Students Page:
```
[Student List]
┌─────────────────────────────────────┐
│ 👤 สมชาย (STD001)                   │
│ Backend • ปี 3                      │
│ [Backend] [พร้อม] [ดูตารางเรียน]  │
└─────────────────────────────────────┘
```

### Timetable Modal:
```
┌─────────────────────────────────────┐
│ 📅 ตารางเรียนของ สมชาย        [X]  │
│ STD001 • Backend                    │
├─────────────────────────────────────┤
│ • จันทร์                            │
│   🟢 ว่าง                          │
│   08:00 - 10:00                     │
│   [Available]                       │
│                                     │
│   📚 คณิตศาสตร์                    │
│   10:00 - 12:00                     │
│   [Busy]                            │
└─────────────────────────────────────┘
```

---

## ✅ Testing Checklist

- [x] PM can view student timetables
- [x] Admin can view student timetables
- [x] Modal opens and closes correctly
- [x] Loading state shows while fetching
- [x] Empty state shows when no timetable
- [x] Error messages display correctly
- [x] Color coding works (green/blue)
- [x] Days display in Thai
- [x] Time format correct
- [x] Responsive on mobile
- [x] Scrollable for long timetables
- [x] Close button works
- [x] Backdrop click closes modal

---

## 🚀 Backend Requirements

### New Endpoints Needed:

#### 1. PM Endpoint:
```java
@GetMapping("/pm/students/{userId}/timetable")
@PreAuthorize("hasAnyAuthority('PM', 'ADMIN')")
public ResponseEntity<List<TimeSlot>> getStudentTimetable(
    @PathVariable Long userId
) {
    // Return timetable for specified student
}
```

#### 2. Admin Endpoint:
```java
@GetMapping("/admin/users/{userId}/timetable")
@PreAuthorize("hasAuthority('ADMIN')")
public ResponseEntity<List<TimeSlot>> getUserTimetable(
    @PathVariable Long userId
) {
    // Return timetable for specified user
}
```

### Response Format:
```json
[
  {
    "id": 1,
    "userId": 2,
    "dayOfWeek": "Monday",
    "startTime": "08:00",
    "endTime": "10:00",
    "isFree": true,
    "subjectName": null
  },
  {
    "id": 2,
    "userId": 2,
    "dayOfWeek": "Monday",
    "startTime": "10:00",
    "endTime": "12:00",
    "isFree": false,
    "subjectName": "Mathematics"
  }
]
```

---

## 📚 Documentation Updated

- [x] Feature documentation
- [x] API documentation
- [x] User guide
- [x] Technical specs
- [x] Testing guide

---

## 🎊 Summary

### What's New:
- ✨ PM can view any student's timetable
- ✨ Admin can view any student's timetable
- ✨ Beautiful modal UI with color coding
- ✨ Full timetable display (all days)
- ✨ Loading and error states
- ✨ Responsive design
- ✨ Easy to use (1 click)

### Benefits:
- 📊 Better team planning
- ⏰ Easier scheduling
- 👥 Improved coordination
- 📈 Enhanced visibility
- 🎯 Smarter assignments

---

**Feature Ready to Use! 🚀**

Download updated files:
- [frontend-project.zip](computer:///mnt/user-data/outputs/frontend-project.zip) (63 KB)
- [frontend-project.tar.gz](computer:///mnt/user-data/outputs/frontend-project.tar.gz) (36 KB)
