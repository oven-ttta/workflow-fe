'use client';

import { useEffect, useState } from 'react';
import { studentService } from '@/lib/student.service';
import { TimetableResponse, TimeSlot } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { Upload, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<TimetableResponse | null>(null);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimeSlot | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const data = await studentService.getTimetable();
      setTimetable(data);
      setSlots(data?.slots ?? []);
    } catch (error) {
      console.error('Error loading timetable:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTimetable = async () => {
    try {
      setIsSaving(true);
      const updated = await studentService.updateTimetable(slots);
      setTimetable(updated);
      setSlots(updated.slots ?? []);
      toast.success('บันทึกตารางเรียนสำเร็จ!');
    } catch (error: any) {
      toast.error(error?.message || 'เกิดข้อผิดพลาดในการบันทึกตารางเรียน');
    } finally {
      setIsSaving(false);
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

  type SlotWithIndex = TimeSlot & { index: number };

  const groupByDay = (slots: TimeSlot[]) => {
    const slotsWithIndex: SlotWithIndex[] = slots.map((slot, index) => ({
      ...slot,
      index,
    }));

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
      slots: slotsWithIndex.filter(slot => slot.dayOfWeek === day)
    })).filter(dayGroup => dayGroup.slots.length > 0);
  };

  const openEditModal = (index: number) => {
    const slot = slots[index];
    if (!slot) return;
    setEditingIndex(index);
    setEditingSlot(slot);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingSlot(null);
    setEditingIndex(null);
  };

  const handleEditFieldChange = (field: keyof TimeSlot, value: string | boolean) => {
    if (!editingSlot) return;
    setEditingSlot({
      ...editingSlot,
      [field]: value,
    } as TimeSlot);
  };

  const handleSaveEditedSlot = async () => {
    if (editingIndex === null || editingSlot === null) return;

    const newSlots = [...slots];
    newSlots[editingIndex] = editingSlot;
    setSlots(newSlots);

    try {
      setIsSaving(true);
      const updated = await studentService.updateTimetable(newSlots);
      setTimetable(updated);
      setSlots(updated.slots ?? []);
      toast.success('บันทึกตารางเรียนสำเร็จ!');
      closeEditModal();
    } catch (error: any) {
      toast.error(error?.message || 'เกิดข้อผิดพลาดในการบันทึกตารางเรียน');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 bg-[#FCC360] p-6 rounded-lg shadow-md shadow-gray-500/50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ตารางเรียน</h1>
        <div>
          <input
            type="file"
            id="timetable-upload"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button className='bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50 rounded-lg'
            onClick={() => document.getElementById('timetable-upload')?.click()}
            disabled={isUploading}
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? 'กำลังอัพโหลด...' : 'อัพโหลดตารางเรียน'}
          </Button>
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
          {groupByDay(slots).map((dayGroup) => (
            <Card key={dayGroup.day}>
              <CardHeader>
                <CardTitle>{dayGroup.dayName}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dayGroup.slots.map((slot) => (
                    <div
                      key={slot.index}
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
                          <Button
                            className="ml-3 text-xs px-3 py-1 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-full"
                            onClick={() => openEditModal(slot.index)}
                          >
                            แก้ไข
                          </Button>
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

      {isEditOpen && editingSlot && (
        <div className=''> 
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all border-t-4 border-orange-500">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <span className="w-2 h-8 bg-orange-500 rounded-full"></span>
                แก้ไขตารางเรียน
              </h2>

              <div className="space-y-5">
                {/* วัน */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5 group-focus-within:text-orange-500 transition-colors">วัน</label>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all cursor-pointer"
                    value={editingSlot.dayOfWeek}
                    onChange={(e) => handleEditFieldChange('dayOfWeek', e.target.value)}
                  >
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>

                {/* เวลา */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5 group-focus-within:text-orange-500 transition-colors">เวลาเริ่ม</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                      value={editingSlot.startTime}
                      onChange={(e) => handleEditFieldChange('startTime', e.target.value)}
                    />
                  </div>
                  <div className="group">
                    <label className="block text-sm font-semibold text-gray-600 mb-1.5 group-focus-within:text-orange-500 transition-colors">เวลาสิ้นสุด</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                      value={editingSlot.endTime}
                      onChange={(e) => handleEditFieldChange('endTime', e.target.value)}
                    />
                  </div>
                </div>

                {/* วิชา */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-600 mb-1.5 group-focus-within:text-orange-500 transition-colors">วิชา</label>
                  <input
                    type="text"
                    placeholder="ชื่อวิชา..."
                    className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-all ${
                      editingSlot.isFree 
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'bg-gray-50 focus:bg-white border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-100'
                    }`}
                    value={editingSlot.subject}
                    onChange={(e) => handleEditFieldChange('subject', e.target.value)}
                    disabled={editingSlot.isFree}
                  />
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer group">
                  <input
                    id="is-free"
                    type="checkbox"
                    checked={editingSlot.isFree}
                    onChange={(e) => handleEditFieldChange('isFree', e.target.checked)}
                    className="h-5 w-5 accent-orange-500 rounded border-gray-300 transition-transform group-active:scale-90"
                  />
                  <label htmlFor="is-free" className="text-sm font-medium text-gray-700 cursor-pointer select-none">
                    เวลาว่าง (ไม่มีเรียน)
                  </label>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-8">
                <button
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium rounded-lg transition-all active:scale-95 disabled:opacity-50"
                  onClick={closeEditModal}
                  disabled={isSaving}
                >
                  ยกเลิก
                </button>
                <button
                  className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg shadow-lg shadow-orange-200 hover:shadow-orange-300 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  onClick={handleSaveEditedSlot}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      กำลังบันทึก...
                    </>
                  ) : 'บันทึกข้อมูล'}
                </button>
              </div>
            </div>
          </div>
        </div>
        
      )}
    </div>
  );
}
