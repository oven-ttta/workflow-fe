# Student Part-time Management System - Frontend

Frontend application สำหรับระบบจัดการน้องนักเรียน Part-time พัฒนาด้วย Next.js 15 (App Router), TypeScript และ Tailwind CSS

## 🚀 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form
- **Notifications**: React Hot Toast
- **Icons**: Lucide React
- **Authentication**: JWT (Cookies)

## 📦 Features

### 🔐 Authentication
- ✅ Login / Register
- ✅ JWT Token Management
- ✅ Auto-redirect based on role
- ✅ Protected routes

### 👨‍🎓 Student Features
- ✅ Dashboard with stats
- ✅ Upload timetable image (AI-powered)
- ✅ View timetable with free/busy slots
- ✅ View assigned projects
- ✅ Update profile

### 👔 PM Features
- ✅ View managed projects
- ✅ Add/remove team members
- ✅ Update project status
- ✅ Browse students by specialty
- ✅ Project details view

### 👨‍💼 Admin Features
- ✅ User management (CRUD)
- ✅ Project management (CRUD)
- ✅ Change user roles
- ✅ Dashboard with project overview
- ✅ View projects by status
- ✅ Monitor overdue projects
- ✅ Track projects needing help

## 📁 Project Structure

```
frontend/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home (redirect)
│   ├── globals.css             # Global styles
│   ├── login/
│   │   └── page.tsx           # Login page
│   ├── register/
│   │   └── page.tsx           # Register page
│   ├── student/
│   │   ├── layout.tsx         # Student layout
│   │   ├── page.tsx           # Student dashboard
│   │   ├── timetable/
│   │   │   └── page.tsx       # Timetable management
│   │   ├── projects/
│   │   │   └── page.tsx       # Student projects
│   │   └── profile/
│   │       └── page.tsx       # Profile settings
│   ├── pm/
│   │   ├── layout.tsx         # PM layout
│   │   ├── page.tsx           # PM dashboard
│   │   ├── projects/
│   │   │   └── [id]/
│   │   │       └── page.tsx   # Project details
│   │   └── students/
│   │       └── page.tsx       # Students list
│   └── admin/
│       ├── layout.tsx         # Admin layout
│       ├── page.tsx           # Admin dashboard
│       ├── projects/
│       │   └── page.tsx       # Projects management
│       ├── users/
│       │   └── page.tsx       # Users management
│       └── dashboard/
│           └── page.tsx       # Overview dashboard
├── components/
│   ├── Navbar.tsx             # Navigation bar
│   └── ui/
│       ├── Button.tsx         # Button component
│       ├── Input.tsx          # Input component
│       ├── Card.tsx           # Card components
│       └── Loading.tsx        # Loading states
├── lib/
│   ├── api.ts                 # Axios instance
│   ├── types.ts               # TypeScript types
│   ├── utils.ts               # Utility functions
│   ├── auth.service.ts        # Auth API calls
│   ├── student.service.ts     # Student API calls
│   ├── pm.service.ts          # PM API calls
│   └── admin.service.ts       # Admin API calls
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

## 🛠️ Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

สร้างไฟล์ `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### 3. Run Development Server

```bash
npm run dev
```

Application จะรันที่ `http://localhost:3000`

## 📝 Usage

### Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## 🔐 Authentication Flow

1. User เข้าสู่หน้า Login/Register
2. กรอก credentials และส่งไปยัง Backend API
3. Backend return JWT Token
4. Token ถูกเก็บใน Cookies
5. ทุก API request จะส่ง Token ใน Authorization header
6. Redirect ไปยังหน้าที่เหมาะสมตาม Role

## 🎨 UI Components

### Button
```tsx
import { Button } from '@/components/ui/Button';

<Button variant="default">Default</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
```

### Input
```tsx
import { Input } from '@/components/ui/Input';

<Input type="text" placeholder="Enter text" />
<Input type="password" placeholder="Password" />
```

### Card
```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

## 📱 Responsive Design

- **Mobile**: Optimized for mobile devices
- **Tablet**: Responsive grid layouts
- **Desktop**: Full-featured interface

## 🔒 Route Protection

ทุก route ที่ต้องการ authentication จะถูกป้องกันด้วย:

```tsx
useEffect(() => {
  const user = authService.getCurrentUser();
  if (!user) {
    router.push('/login');
  } else if (user.role !== 'EXPECTED_ROLE') {
    router.push(`/${user.role.toLowerCase()}`);
  }
}, [router]);
```

## 🎯 API Integration

### Student API Example

```tsx
import { studentService } from '@/lib/student.service';

// Get profile
const profile = await studentService.getProfile();

// Upload timetable
const timetable = await studentService.uploadTimetable(file);

// Get projects
const projects = await studentService.getMyProjects();
```

### PM API Example

```tsx
import { pmService } from '@/lib/pm.service';

// Get managed projects
const projects = await pmService.getMyManagedProjects();

// Add member
await pmService.addMemberToProject(projectId, userId);

// Update status
await pmService.updateProjectStatus(projectId, 'IN_PROCESS');
```

### Admin API Example

```tsx
import { adminService } from '@/lib/admin.service';

// Get all users
const users = await adminService.getAllUsers();

// Create project
const project = await adminService.createProject(data);

// Get overview
const overview = await adminService.getProjectStatusOverview();
```

## 🚨 Error Handling

Error handling ด้วย try-catch และ toast notifications:

```tsx
try {
  const data = await someService.someMethod();
  toast.success('Success!');
} catch (error: any) {
  toast.error(error.response?.data?.message || 'Error occurred');
}
```

## 🌐 Internationalization

ปัจจุบันรองรับภาษาไทยเท่านั้น แต่สามารถเพิ่มภาษาอื่นได้ในอนาคต

## 📊 State Management

ใช้ React Hooks สำหรับ state management:
- `useState` - Local component state
- `useEffect` - Side effects
- `useForm` - Form state (React Hook Form)

## 🔄 Data Flow

```
User Action → Component → Service → API (Backend)
                ↓
            Update State
                ↓
            Re-render UI
```

## 🎨 Tailwind Configuration

Tailwind ถูก config ด้วย custom colors และ utilities:

```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...},
      // ...
    }
  }
}
```

## 📦 Build & Deploy

### Build

```bash
npm run build
```

Output จะอยู่ใน `.next` directory

### Deploy

สามารถ deploy ได้หลายวิธี:

**Vercel (แนะนำ):**
```bash
npm install -g vercel
vercel
```

**Docker:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Build
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Production
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

## ⚙️ Environment Variables

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## 🧪 Testing

ปัจจุบันยังไม่มี automated tests แต่สามารถเพิ่มได้ด้วย:
- Jest
- React Testing Library
- Cypress

## 📈 Performance

- **Code Splitting**: Automatic with Next.js
- **Image Optimization**: Next.js Image component
- **Lazy Loading**: Dynamic imports
- **Caching**: API response caching

## 🐛 Common Issues

### Issue: CORS Error
**Solution**: ตรวจสอบว่า Backend อนุญาต CORS จาก Frontend URL

### Issue: Token Expired
**Solution**: Re-login เพื่อรับ token ใหม่

### Issue: API Connection Failed
**Solution**: ตรวจสอบว่า Backend กำลังรันอยู่และ URL ถูกต้อง

## 📝 Development Guidelines

1. ใช้ TypeScript สำหรับ type safety
2. ตั้งชื่อ component ด้วย PascalCase
3. ใช้ functional components และ hooks
4. Extract reusable logic เป็น custom hooks
5. ใช้ Tailwind classes แทน CSS-in-JS

## 🔮 Future Enhancements

- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Real-time notifications (WebSocket)
- [ ] File drag & drop
- [ ] Advanced filtering
- [ ] Data visualization charts
- [ ] PWA support
- [ ] Unit tests
- [ ] E2E tests

## 📞 Support

สำหรับปัญหาหรือคำถาม:
1. ตรวจสอบ Backend logs
2. ตรวจสอบ Browser console
3. ตรวจสอบ Network tab (DevTools)

## 📄 License

MIT License

---

**Happy Coding! 🚀**
