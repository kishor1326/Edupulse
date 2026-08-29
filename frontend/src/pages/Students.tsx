import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  UploadCloud,
  Download,
  Trash2,
  Edit2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { RiskBadge } from '../components/common/RiskBadge';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { AddEditStudentModal } from '../components/students/AddEditStudentModal';
import { CSVImportModal } from '../components/students/CSVImportModal';
import { studentService } from '../services/students';
import { Student } from '../types';

const DEPARTMENTS = ['ALL', 'CSE', 'ECE', 'AIDS', 'EEE', 'MECH', 'CIVIL'];

export const Students: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState<Student[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState(searchParams.get('department') || 'ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedRisk, setSelectedRisk] = useState(searchParams.get('risk_level') || 'ALL');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await studentService.getStudents({
        search: search.trim() || undefined,
        department: selectedDept !== 'ALL' ? selectedDept : undefined,
        year: selectedYear !== 'ALL' ? parseInt(selectedYear) : undefined,
        risk_level: selectedRisk !== 'ALL' ? selectedRisk : undefined,
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      setStudents(res.students);
      setTotal(res.total);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [page, selectedDept, selectedYear, selectedRisk, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to remove student "${name}"? This action cannot be undone.`)) {
      try {
        await studentService.deleteStudent(id);
        fetchStudents();
      } catch (err) {
        alert('Failed to delete student.');
      }
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Student Directory & Cohorts
            </h1>
            <span className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-slate-300 text-xs font-mono font-bold">
              {total} Total Enrolled
            </span>
          </div>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-400 font-medium">
            Monitor institutional cohorts, academic trajectory metrics, and enrollment statuses
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href={studentService.getExportCSVUrl(selectedDept, selectedRisk)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Export CSV</span>
          </a>
          <button
            onClick={() => setIsCSVOpen(true)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 text-xs font-bold transition-all shadow-sm"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Import CSV</span>
          </button>
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsAddEditOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40"
          >
            <Plus className="w-4 h-4" />
            <span>Enroll Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, name, or email..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-all"
            />
          </form>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  Dept: {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Risk Level Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedRisk}
              onChange={(e) => {
                setSelectedRisk(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="LOW">Low Risk Only</option>
              <option value="MEDIUM">Medium Risk Only</option>
              <option value="HIGH">High Risk Only</option>
            </select>
          </div>

          {/* Year Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setPage(1);
              }}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-white/10 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500 transition-all"
            >
              <option value="ALL">All Years</option>
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={6} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/70 text-slate-400 uppercase font-bold tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Department & Cohort</th>
                  <th className="px-6 py-3.5">Attendance</th>
                  <th className="px-6 py-3.5">Marks</th>
                  <th className="px-6 py-3.5">Assignments</th>
                  <th className="px-6 py-3.5">Backlogs</th>
                  <th className="px-6 py-3.5">Risk Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] font-medium text-slate-300">
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
                        <p className="text-sm font-semibold text-slate-300">No students found</p>
                        <p className="text-xs text-slate-500 mt-1">Try refining your search or filter options</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const pred = student.latest_prediction;
                    return (
                      <tr key={student.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-emerald-400 font-mono text-xs">
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <Link
                                to={`/students/${student.student_id}`}
                                className="font-bold text-white hover:text-emerald-400 transition-colors block"
                              >
                                {student.name}
                              </Link>
                              <span className="font-mono text-[11px] text-slate-400">
                                {student.student_id}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-0.5 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 font-bold text-[10px]">
                              {student.department}
                            </span>
                            <span className="text-slate-400 text-[11px]">Yr {student.year} (Sem {student.semester})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              student.attendance < 65
                                ? 'bg-rose-500/10 text-rose-400 font-bold'
                                : student.attendance < 75
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {student.attendance}%
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span
                            className={`px-2 py-0.5 rounded ${
                              student.marks < 50
                                ? 'bg-rose-500/10 text-rose-400 font-bold'
                                : student.marks < 65
                                ? 'bg-amber-500/10 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          >
                            {student.marks}%
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-slate-300">
                          {student.assignment_completion}%
                        </td>
                        <td className="px-6 py-4 font-mono">
                          <span className={`px-2 py-0.5 rounded ${student.backlogs > 0 ? 'bg-amber-500/10 text-amber-400 font-bold' : 'text-slate-400'}`}>
                            {student.backlogs}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <RiskBadge
                            level={pred?.risk_level || 'LOW'}
                            score={pred?.risk_score}
                            showIcon={true}
                            size="sm"
                          />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/students/${student.student_id}`}
                              title="View Risk Profile"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all inline-flex items-center"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              onClick={() => {
                                setEditingStudent(student);
                                setIsAddEditOpen(true);
                              }}
                              title="Edit Student"
                              className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/10 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(student.id, student.name)}
                              title="Delete Student"
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 bg-slate-900/40">
          <div>
            Showing <span className="font-semibold text-white">{students.length}</span> of{' '}
            <span className="font-semibold text-white">{total}</span> total students
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono px-2 font-bold text-white">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white disabled:opacity-30 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddEditStudentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSuccess={() => fetchStudents()}
        initialData={editingStudent}
      />

      <CSVImportModal
        isOpen={isCSVOpen}
        onClose={() => setIsCSVOpen(false)}
        onSuccess={() => fetchStudents()}
      />
    </div>
  );
};
