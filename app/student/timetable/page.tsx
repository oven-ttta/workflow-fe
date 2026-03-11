'use client';

import { useEffect, useState } from 'react';
import { studentService } from '@/lib/student.service';
import { TimetableResponse } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Upload, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const data = await studentService.getTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = await studentService.uploadTimetable(file);
      setTimetable(data);
      toast.success('อัพโหลดตารางเรียนสำเร็จ!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'เกิดข้อผิดพลาดในการอัพโหลด');
    } finally {
      setIsUploading(false);
    }
  };

  const groupByDay = (slots: TimetableResponse['slots']) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const dayNames: Record<string, string> = {
      Monday: 'จันทร์',
      Tuesday: 'อังคาร',
      Wednesday: 'พุธ',
      Thursday: 'พฤหัสบดี',
      Friday: 'ศุกร์',
      Saturday: 'เสาร์',
      Sunday: 'อาทิตย์'
    };

    return days.map(day => ({
      day,
      dayName: dayNames[day],
      slots: slots.filter(slot => slot.dayOfWeek === day)
    })).filter(dayGroup => dayGroup.slots.length > 0);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 bg-[#FCC360] p-6 rounded-lg shadow-md shadow-gray-500/50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold mt-4 mb-4">ตารางเรียน</h1>
          <div className='flex gap-4'>
            {/* แก้ไขตารางเรียน */}
            <div>
              <input
                type="file"
                id="timetable-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button className='bg-[#ffffff] hover:bg-gray-200 text-[#000000] shadow-lg shadow-orange-500/50 rounded-lg h-[50px]'
                onClick={() => document.getElementById('timetable-upload')?.click()}
                disabled={isUploading}
              >
                <img src="/edit-icon.svg" 
                  alt="" 
                  width="32" 
                  height="32" 
                  className="w-5 h-5 object-cover mr-[10px] text-transparent"/>
                {isUploading ? 'กำลังอัพโหลด...' : 'แก้ไขตารางเรียน'}
              </Button>
            </div>
            {/* อัพโหลดตารางเรียน */}
            <div>
              <input
                type="file"
                id="timetable-upload"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isUploading}
              />
              <Button className='bg-[#ffffff] hover:bg-gray-200 text-[#000000] shadow-lg shadow-orange-500/50 rounded-lg h-[50px]'
                onClick={() => document.getElementById('timetable-upload')?.click()}
                disabled={isUploading}
              >
                <Upload className="w-4 h-4 mr-2" />
                {isUploading ? 'กำลังอัพโหลด...' : 'อัพโหลดตารางเรียน'}
              </Button>
            </div>
          </div>
        
      </div>

      {!timetable || timetable.slots.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 shadow-lg shadow-gray-300">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              คุณยังไม่มีตารางเรียน กรุณาอัพโหลดรูปตารางเรียนของคุณ
            </p>
            {/* <Button className='bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50 rounded-lg'
              onClick={() => document.getElementById('timetable-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              อัพโหลดตารางเรียน
            </Button> */}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {groupByDay(timetable.slots).map((dayGroup) => (
            <Card key={dayGroup.day}>
              <CardHeader>
                <CardTitle>{dayGroup.dayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayGroup.slots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        slot.isFree
                          ? 'bg-green-50 border-green-200'
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">
                            {slot.isFree ? '🟢 ว่าง' : '📚 ' + slot.subject}
                          </p>
                          <p className="text-sm text-gray-600">
                            {slot.startTime} - {slot.endTime}
                          </p>
                        </div>
                        <div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              slot.isFree
                                ? 'bg-green-100 text-green-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {slot.isFree ? 'เวลาว่าง' : 'มีเรียน'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
