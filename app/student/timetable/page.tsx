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
    <div className="space-y-6 bg-orange-50 p-6 rounded-lg shadow-md shadow-gray-400/50">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">ตารางเรียน</h1>
        <div className="flex items-center gap-3">
          <Button
            className="bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50 rounded-lg"
            onClick={handleSaveTimetable}
            disabled={isSaving || slots.length === 0}
          >
            {isSaving ? 'กำลังบันทึก...' : 'บันทึกตารางเรียน'}
          </Button>
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
            <Button className='bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/50 rounded-lg'
              onClick={() => document.getElementById('timetable-upload')?.click()}
              disabled={isUploading}
            >
              <Upload className="w-4 h-4 mr-2" />
              อัพโหลดตารางเรียน
            </Button>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-semibold mb-4">แก้ไขตารางเรียน</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">วัน</label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">เวลาเริ่ม</label>
                  <input
                    type="time"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={editingSlot.startTime}
                    onChange={(e) => handleEditFieldChange('startTime', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">เวลาสิ้นสุด</label>
                  <input
                    type="time"
                    className="w-full border rounded-md px-3 py-2 text-sm"
                    value={editingSlot.endTime}
                    onChange={(e) => handleEditFieldChange('endTime', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">วิชา</label>
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 text-sm"
                  value={editingSlot.subject}
                  onChange={(e) => handleEditFieldChange('subject', e.target.value)}
                  disabled={editingSlot.isFree}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is-free"
                  type="checkbox"
                  checked={editingSlot.isFree}
                  onChange={(e) => handleEditFieldChange('isFree', e.target.checked)}
                  className="h-4 w-4"
                />
                <label htmlFor="is-free" className="text-sm">
                  เวลาว่าง (ไม่มีเรียน)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg"
                onClick={closeEditModal}
                disabled={isSaving}
              >
                ยกเลิก
              </Button>
              <Button
                className="bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50 rounded-lg"
                onClick={handleSaveEditedSlot}
                disabled={isSaving}
              >
                {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
