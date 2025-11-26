export interface User {
  id: number;
  customId: string;
  firstName: string;
  yearLevel: string;
  specialty: string;
  username: string;
  role: 'STUDENT' | 'PM' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  customId: string;
  username: string;
  firstName: string;
  role: string;
}

export interface RegisterRequest {
  firstName: string;
  yearLevel: string;
  specialty: string;
  username: string;
  password: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface TimeSlot {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  isFree: boolean;
}

export interface TimetableResponse {
  slots: TimeSlot[];
}

export interface ProjectRequest {
  projectName: string;
  difficultyLevel: number;
  durationDays: number;
  pmUserId?: number;
  startDate?: string;
}

export interface PmInfo {
  id: number;
  customId: string;
  firstName: string;
  username: string;
}

export interface MemberInfo {
  id: number;
  customId: string;
  firstName: string;
  specialty: string;
}

export interface ProjectResponse {
  id: number;
  projectName: string;
  difficultyLevel: number;
  durationDays: number;
  status: string;
  startDate: string;
  deadline: string;
  pmUser: PmInfo | null;
  members: MemberInfo[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectStatusOverview {
  allProjects: ProjectResponse[];
  projectsDueSoon: ProjectResponse[];
  overdueProjects: ProjectResponse[];
  projectsNeedingHelp: ProjectResponse[];
}

export const SPECIALTIES = [
  'Frontend',
  'Backend',
  'ML Engineer',
  'UX/UI',
  'QA',
  'DevOps'
] as const;

export const PROJECT_STATUSES = [
  'NOT_STARTED',
  'IN_PROCESS',
  'TEST',
  'REVIEW',
  'DONE',
  'HELP'
] as const;

export const PROJECT_STATUS_LABELS: Record<string, string> = {
  NOT_STARTED: 'ยังไม่เริ่ม',
  IN_PROCESS: 'กำลังดำเนินการ',
  TEST: 'กำลัง Test',
  REVIEW: 'กำลัง Review',
  DONE: 'เสร็จสมบูรณ์',
  HELP: 'ต้องการความช่วยเหลือ!!!'
};

export const PROJECT_STATUS_COLORS: Record<string, string> = {
  NOT_STARTED: 'bg-gray-100 text-gray-800',
  IN_PROCESS: 'bg-blue-100 text-blue-800',
  TEST: 'bg-yellow-100 text-yellow-800',
  REVIEW: 'bg-purple-100 text-purple-800',
  DONE: 'bg-green-100 text-green-800',
  HELP: 'bg-red-100 text-red-800'
};
