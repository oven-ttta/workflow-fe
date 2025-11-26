import api from './api';
import { User, ProjectRequest, ProjectResponse, ProjectStatusOverview, RegisterRequest, TimeSlot } from './types';

export const adminService = {
  // User Management
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>('/admin/users');
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUser(id: number, data: RegisterRequest): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: number): Promise<string> {
    const response = await api.delete<string>(`/admin/users/${id}`);
    return response.data;
  },

  async updateUserRole(id: number, role: string): Promise<User> {
    const response = await api.put<User>(`/admin/users/${id}/role?role=${role}`);
    return response.data;
  },

  // Project Management
  async createProject(data: ProjectRequest): Promise<ProjectResponse> {
    const response = await api.post<ProjectResponse>('/admin/projects', data);
    return response.data;
  },

  async getAllProjects(): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>('/admin/projects');
    return response.data;
  },

  async getProjectById(id: number): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/admin/projects/${id}`);
    return response.data;
  },

  async updateProject(id: number, data: ProjectRequest): Promise<ProjectResponse> {
    const response = await api.put<ProjectResponse>(`/admin/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: number): Promise<string> {
    const response = await api.delete<string>(`/admin/projects/${id}`);
    return response.data;
  },

  async updateProjectStatus(id: number, status: string): Promise<ProjectResponse> {
    const response = await api.put<ProjectResponse>(`/admin/projects/${id}/status?status=${status}`);
    return response.data;
  },

  async addMemberToProject(projectId: number, userId: number): Promise<string> {
    const response = await api.post<string>(`/admin/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  async removeMemberFromProject(projectId: number, userId: number): Promise<string> {
    const response = await api.delete<string>(`/admin/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  // Project Monitoring
  async getProjectStatusOverview(): Promise<ProjectStatusOverview> {
    const response = await api.get<ProjectStatusOverview>('/admin/projects/status/overview');
    return response.data;
  },

  async getProjectsByStatus(status: string): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>(`/admin/projects/status/${status}`);
    return response.data;
  },

  async getProjectsDueSoon(days: number = 7): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>(`/admin/projects/due-soon?days=${days}`);
    return response.data;
  },

  async getOverdueProjects(): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>('/admin/projects/overdue');
    return response.data;
  },

  async getProjectsNeedingHelp(): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>('/admin/projects/help');
    return response.data;
  },

  // Get student timetable (Admin privilege)
  async getStudentTimetable(userId: number): Promise<TimeSlot[]> {
    const response = await api.get<TimeSlot[]>(`/admin/users/${userId}/timetable`);
    return response.data;
  }
};