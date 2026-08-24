import { api } from './api';
import { Student } from '../types';

export interface StudentListParams {
  search?: string;
  department?: string;
  year?: number;
  risk_level?: string;
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface StudentListResponse {
  total: number;
  page: number;
  limit: number;
  students: Student[];
}

export interface CSVImportResponse {
  total_rows: number;
  successful_imports: number;
  failed_rows: number;
  errors: Array<{
    row_index: number;
    student_id?: string;
    errors: string[];
  }>;
  imported_students: Student[];
}

export const studentService = {
  async getStudents(params: StudentListParams = {}): Promise<StudentListResponse> {
    const res = await api.get<StudentListResponse>('/students', { params });
    return res.data;
  },

  async getStudent(id: string | number): Promise<Student> {
    const res = await api.get<Student>(`/students/${id}`);
    return res.data;
  },

  async createStudent(data: Partial<Student>): Promise<Student> {
    const res = await api.post<Student>('/students', data);
    return res.data;
  },

  async updateStudent(id: string | number, data: Partial<Student>): Promise<Student> {
    const res = await api.put<Student>(`/students/${id}`, data);
    return res.data;
  },

  async deleteStudent(id: string | number): Promise<void> {
    await api.delete(`/students/${id}`);
  },

  async importCSV(file: File): Promise<CSVImportResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<CSVImportResponse>('/students/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  getExportCSVUrl(department?: string, risk_level?: string): string {
    const params = new URLSearchParams();
    if (department && department !== 'ALL') params.append('department', department);
    if (risk_level && risk_level !== 'ALL') params.append('risk_level', risk_level);
    const base = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    return `${base}/students/export/csv?${params.toString()}`;
  }
};
