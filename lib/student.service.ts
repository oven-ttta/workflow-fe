import api from './api';
import { User, TimetableResponse, ProjectResponse, RegisterRequest } from './types';

export const studentService = {
  async getProfile(): Promise<User> {
    const response = await api.get<User>('/student/profile');
    return response.data;
  },

  async updateProfile(data: RegisterRequest): Promise<User> {
    const response = await api.put<User>('/student/profile', data);
    return response.data;
  },

  async uploadTimetable(file: File): Promise<TimetableResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<TimetableResponse>('/student/timetable/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async getTimetable(): Promise<TimetableResponse> {
    const response = await api.get<TimetableResponse>('/student/timetable');
    return response.data;
  },

  async getMyProjects(): Promise<ProjectResponse[]> {
    const response = await api.get<ProjectResponse[]>('/student/projects');
    return response.data;
  }
};
