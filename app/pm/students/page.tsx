'use client';

import { useEffect, useState } from 'react';
import { pmService } from '@/lib/pm.service';
import { studentService } from '@/lib/student.service';
import { User, SPECIALTIES, TimeSlot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Users, Search, Filter, Calendar, X, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function PMStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showTimetable, setShowTimetable] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [timetable, setTimetable] = useState<TimeSlot[]>([]);
  const [loadingTimetable, setLoadingTimetable] = useState(false);

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchTerm, selectedSpecialty, students, sortBy, sortOrder]);

  const loadStudents = async () => {
    try {
      const data = await pmService.getAvailableStudents();
      setStudents(data);
      setFilteredStudents(data);
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    // Filter by specialty
    if (selectedSpecialty !== 'ALL') {
      filtered = filtered.filter(s => s.specialty === selectedSpecialty);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(s =>
        s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.customId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    if (sortBy === 'name') {
      filtered = [...filtered].sort((a, b) => {
        const aName = a.firstName.toLowerCase();
        const bName = b.firstName.toLowerCase();
        if (sortOrder === 'asc') {
          return aName.localeCompare(bName);
        } else {
          return bName.localeCompare(aName);
        }
      });
    }

    setFilteredStudents(filtered);
  };

  const handleSpecialtyFilter = async (specialty: string) => {
    setSelectedSpecialty(specialty);
    if (specialty === 'ALL') {
      setFilteredStudents(students);
    }
  };

  const handleViewTimetable = async (student: User) => {
    setSelectedStudent(student);
    setShowTimetable(true);
    setLoadingTimetable(true);
    setTimetable([]); // Reset to empty array
    
    try {
      const data = await pmService.getStudentTimetable(student.id);
      
      // Backend returns {slots: [...]} format
      if (data && typeof data === 'object' && 'slots' in data) {
        const slotsArray = (data as any).slots;
        if (Array.isArray(slotsArray)) {
          setTimetable(slotsArray);
        } else {
          console.error('Slots is not an array:', slotsArray);
          toast.error('รูปแบบข้อมูลตารางเรียนไม่ถูกต้อง');
          setTimetable([]);
        }
      } else if (Array.isArray(data)) {
        // Fallback: if backend returns array directly
        setTimetable(data);
      } else {
        console.error('Invalid timetable data format:', data);
        toast.error('รูปแบบข้อมูลตารางเรียนไม่ถูกต้อง');
        setTimetable([]);
      }
    } catch (error: any) {
      console.error('Error loading timetable:', error);
      if (error.response?.status === 404) {
        toast.error('นักเรียนยังไม่ได้อัพโหลดตารางเรียน');
      } else {
        toast.error('ไม่สามารถโหลดตารางเรียนได้');
      }
      setTimetable([]);
    } finally {
      setLoadingTimetable(false);
    }
  };

  const closeTimetableModal = () => {
    setShowTimetable(false);
    setSelectedStudent(null);
    setTimetable([]);
  };

  if (isLoading) return <Loading />;

  const specialtyCounts = SPECIALTIES.reduce((acc, specialty) => {
    acc[specialty] = students.filter(s => s.specialty === specialty).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6 bg-[#FCC360] p-6 rounded-lg shadow-md shadow-gray-400/50">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">รายชื่อนักเรียน</h1>
        <p className="text-gray-600 mt-1">ค้นหาและดูข้อมูลนักเรียนสำหรับเพิ่มเข้าโปรเจค</p>
      </div>

    {/* Filters */}
      <Card className='shadow-gray-400/50'>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            ค้นหาและกรอง
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="ค้นหาด้วยชื่อ, username หรือรหัสนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Specialty Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">กรองตามความถนัด</label>
            <div className="flex flex-wrap gap-2">
              <Button
                className={selectedSpecialty === 'ALL' ? 'bg-orange-500 hover:bg-orange-600 shadow-gray-400/50' : ''}
                variant={selectedSpecialty === 'ALL' ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSpecialtyFilter('ALL')}
              >
                ทั้งหมด ({students.length})
              </Button>
              {SPECIALTIES.map((specialty) => (
                <Button
                  key={specialty}
                  className={selectedSpecialty === specialty ? 'bg-orange-500 hover:bg-orange-600 shadow-gray-400/50' : ''}
                  variant={selectedSpecialty === specialty ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleSpecialtyFilter(specialty)}
                >
                  {specialty} ({specialtyCounts[specialty] || 0})
                </Button>
              ))}
            </div>

              <div>
            <label className="text-sm font-medium mb-2 block">เรียงลำดับ</label>
            <div className="flex flex-wrap gap-2">
              <Button
                className={sortBy === '' ? 'bg-orange-500 hover:bg-orange-600 shadow-gray-400/50' : ''}
                variant={sortBy === '' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortBy('')}
              >
                <ArrowUpDown className="w-4 h-4 mr-2" />
                ค่าเริ่มต้น
              </Button>
              <Button
                className={sortBy === 'name' && sortOrder === 'asc' ? 'bg-orange-500 hover:bg-orange-600 shadow-gray-400/50' : ''}
                variant={sortBy === 'name' && sortOrder === 'asc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSortBy('name');
                  setSortOrder('asc');
                }}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                ชื่อ (A-Z)
              </Button>
              <Button
                className={sortBy === 'name' && sortOrder === 'desc' ? 'bg-orange-500 hover:bg-orange-600 shadow-gray-400/50' : ''}
                variant={sortBy === 'name' && sortOrder === 'desc' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSortBy('name');
                  setSortOrder('desc');
                }}
              >
                <ArrowDown className="w-4 h-4 mr-2" />
                ชื่อ (Z-A)
              </Button>
            </div>
          </div>

          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className='shadow-gray-400/50'>
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold">{students.length}</p>
              <p className="text-sm text-gray-600">นักเรียนทั้งหมด</p>
            </div>
          </CardContent>
        </Card>
        
        {['Frontend', 'Backend', 'UX/UI'].map((specialty) => (
          <Card key={specialty} className='shadow-gray-400/50'>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">
                  {specialtyCounts[specialty] || 0}
                </p>
                <p className="text-sm text-gray-600">{specialty}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div> */}

      {/* Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">
                แสดง {filteredStudents.length} จาก {students.length} นักเรียน
              </p>
              <p className="text-sm text-blue-700">
                กรองตามความถนัด: {selectedSpecialty === 'ALL' ? 'ทั้งหมด' : selectedSpecialty}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>
            รายชื่อนักเรียน ({filteredStudents.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              ไม่พบนักเรียนที่ตรงกับเงื่อนไข
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {student.firstName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{student.firstName}</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="text-sm text-gray-600">{student.customId}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{student.username}</span>
                        <span className="text-sm text-gray-400">•</span>
                        <span className="text-sm text-gray-600">{student.yearLevel}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {student.specialty}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      student.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {student.isActive ? 'พร้อมทำงาน' : 'ไม่พร้อม'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewTimetable(student)}
                    >
                      <Calendar className="w-4 h-4 mr-1" />
                      ดูตารางเรียน
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Timetable Modal */}
      {showTimetable && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="border-b sticky top-0 bg-white z-10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    ตารางเรียนของ {selectedStudent?.firstName}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedStudent?.customId} • {selectedStudent?.specialty}
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={closeTimetableModal}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingTimetable ? (
                <div className="flex items-center justify-center py-12">
                  <Loading />
                </div>
              ) : !Array.isArray(timetable) || timetable.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">นักเรียนยังไม่ได้อัพโหลดตารางเรียน</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
                    const daySlots = timetable.filter(slot => slot.dayOfWeek === day);
                    if (daySlots.length === 0) return null;

                    const dayNameThai = {
                      'Monday': 'จันทร์',
                      'Tuesday': 'อังคาร',
                      'Wednesday': 'พุธ',
                      'Thursday': 'พฤหัสบดี',
                      'Friday': 'ศุกร์',
                      'Saturday': 'เสาร์',
                      'Sunday': 'อาทิตย์'
                    }[day];

                    return (
                      <div key={day}>
                        <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          {dayNameThai}
                        </h3>
                        <div className="grid gap-2 ml-4">
                          {daySlots.map((slot, idx) => (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border-l-4 ${
                                slot.isFree
                                  ? 'bg-green-50 border-green-500'
                                  : 'bg-blue-50 border-blue-500'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium">
                                    {slot.isFree ? '🟢 ว่าง' : `📚 ${slot.subject || 'เรียน'}`}
                                  </p>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {slot.startTime} - {slot.endTime}
                                  </p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                  slot.isFree
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {slot.isFree ? 'Available' : 'Busy'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}