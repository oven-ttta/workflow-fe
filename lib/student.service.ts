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
    // Try presigned upload flow: request presigned PUT URL, upload to MinIO directly,
    // then notify backend to parse and persist. If presign not available, fallback to legacy upload.
    try {
      const presignResp = await api.post<{ url: string; objectName: string }>('/student/timetable/presign', {
        fileName: file.name,
      });
      const { url, objectName } = presignResp.data;

      // Upload file directly to MinIO using presigned URL
      await fetch(url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });

      // Notify backend to parse the uploaded object and return parsed timetable
      const notifyResp = await api.post<TimetableResponse>('/student/timetable/notify', {
        objectName,
      });
      return notifyResp.data;
    } catch (err) {
      // Fallback: direct multipart upload to backend
      const formData = new FormData();
      formData.append('file', file);
      const response = await api.post<TimetableResponse>('/student/timetable/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    }
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
