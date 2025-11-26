import api from './api';
import { ProjectResponse, TimeSlot, User } from './types';

export const pmService = {
  async getMyManagedProjects(): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>('/pm/projects');
    return response.data;
  },

  async getProjectDetails(id: number): Promise<ProjectResponse> {
    const response = await api.get<ProjectResponse>(`/pm/projects/${id}`);
    return response.data;
  },

  async addMemberToProject(projectId: number, userId: number): Promise<string> {
    const response = await api.post<string>(`/pm/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  async removeMemberFromProject(projectId: number, userId: number): Promise<string> {
    const response = await api.delete<string>(`/pm/projects/${projectId}/members/${userId}`);
    return response.data;
  },

  async updateProjectStatus(projectId: number, status: string): Promise<ProjectResponse> {
    const response = await api.put<ProjectResponse>(
      `/pm/projects/${projectId}/status?status=${status}`
    );
    return response.data;
  },

  async getAvailableStudents(): Promise<User[]> {
    const response = await api.get<User[]>('/pm/students');
    return response.data;
  },

  async getStudentsBySpecialty(specialty: string): Promise<User[]> {
    const response = await api.get<User[]>(`/pm/students/specialty/${specialty}`);
    return response.data;
  },

  // Get student timetable (PM privilege)
  async getStudentTimetable(userId: number): Promise<TimeSlot[]> {
    const response = await api.get<TimeSlot[]>(`/pm/students/${userId}/timetable`);
    return response.data;
  }
};