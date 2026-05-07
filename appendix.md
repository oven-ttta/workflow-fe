# 9. ภาคผนวก (Appendix)

---

## 9.1 ปริมาณงานและขอบเขตของโปรแกรม

โปรแกรมนี้ครอบคลุมการทำงานหลักดังนี้:

- จำนวน Class ทั้งหมด: ประมาณ 8–12 คลาส
- จำนวนไฟล์ซอร์สโค้ด: แยกตาม module และ feature
- ฟังก์ชันหลักที่รองรับ:
  - การจัดการข้อมูล (CRUD)
  - การนำเข้าและส่งออกข้อมูลจากไฟล์
  - การค้นหาและเรียงลำดับข้อมูล
- ขอบเขตของระบบ:
  - ทำงานบน Console / CLI
  - ข้อมูลถูกโหลดจากไฟล์ `.txt` หรือ `.csv` เมื่อเริ่มโปรแกรม
  - ไม่มีการเชื่อมต่อฐานข้อมูลภายนอก

---

## 9.2 การประยุกต์ใช้แนวคิด Inheritance (การสืบทอด)

Inheritance คือการที่ Class ลูก (Subclass) สืบทอดคุณสมบัติและพฤติกรรมจาก Class แม่ (Superclass)

### ตัวอย่างโครงสร้าง

```
Person (Superclass)
├── Student (Subclass)
└── Employee (Subclass)
    └── Manager (Subclass ของ Employee)
```

### ตัวอย่างโค้ด (Python)

```python
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def get_info(self):
        return f"ชื่อ: {self.name}, อายุ: {self.age}"

class Student(Person):
    def __init__(self, name, age, student_id):
        super().__init__(name, age)
        self.student_id = student_id

    def get_info(self):
        return f"{super().get_info()}, รหัสนักศึกษา: {self.student_id}"
```

### ประโยชน์
- ลดการเขียนโค้ดซ้ำซ้อน (Code Reuse)
- ง่ายต่อการขยายระบบในอนาคต
- โครงสร้างโค้ดชัดเจนและเป็นระบบ

---

## 9.3 การประยุกต์ใช้แนวคิด Polymorphism (พหุสัณฐาน)

Polymorphism คือความสามารถของออบเจกต์หลายประเภทในการตอบสนองต่อเมธอดเดียวกันในรูปแบบที่แตกต่างกัน

### ประเภทของ Polymorphism ที่ใช้

| ประเภท | คำอธิบาย |
|--------|----------|
| Method Overriding | Class ลูก override เมธอดของ Class แม่ |
| Duck Typing | (Python) เรียก method เดียวกันได้โดยไม่ต้องสืบทอด |

### ตัวอย่างโค้ด

```python
class Shape:
    def area(self):
        return 0

class Circle(Shape):
    def __init__(self, radius):
        self.radius = radius

    def area(self):
        return 3.14159 * self.radius ** 2

class Rectangle(Shape):
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

# การใช้งาน Polymorphism
shapes = [Circle(5), Rectangle(4, 6)]
for shape in shapes:
    print(f"พื้นที่: {shape.area()}")
```

### ประโยชน์
- เพิ่มความยืดหยุ่นในการออกแบบระบบ
- สามารถเพิ่ม Class ใหม่โดยไม่แก้ไขโค้ดเดิม
- รองรับหลักการ Open/Closed Principle

---

## 9.4 การประยุกต์ใช้แนวคิด Aggregation / Composition

### Aggregation
ความสัมพันธ์แบบ "has-a" ที่ออบเจกต์สามารถดำรงอยู่ได้อย่างอิสระ

```python
class Department:
    def __init__(self, name):
        self.name = name

class Employee:
    def __init__(self, name, department: Department):
        self.name = name
        self.department = department  # Aggregation: department มีชีวิตอิสระ
```

### Composition
ความสัมพันธ์แบบ "part-of" ที่ส่วนประกอบไม่สามารถดำรงอยู่ได้หากปราศจากเจ้าของ

```python
class Engine:
    def start(self):
        return "เครื่องยนต์ทำงาน"

class Car:
    def __init__(self):
        self.engine = Engine()  # Composition: Engine สร้างภายใน Car

    def start(self):
        return self.engine.start()
```

### ความแตกต่าง

| คุณสมบัติ | Aggregation | Composition |
|-----------|-------------|-------------|
| ชีวิตของส่วนประกอบ | อิสระ | ขึ้นอยู่กับเจ้าของ |
| ความสัมพันธ์ | หลวม (Weak) | แน่น (Strong) |
| ตัวอย่าง | นักศึกษา — ภาควิชา | รถ — เครื่องยนต์ |

---

## 9.5 การนำเข้าข้อมูลจากไฟล์ (File Input)

โปรแกรมรองรับการโหลดข้อมูลจากไฟล์ `.txt` และ `.csv` เมื่อเริ่มต้นระบบ

### รูปแบบไฟล์ที่รองรับ

```
students.csv
-----------
id,name,age,gpa
1001,สมชาย ใจดี,20,3.50
1002,สมหญิง รักเรียน,21,3.75
```

### ตัวอย่างโค้ดการอ่านไฟล์

```python
import csv

def load_students(filename):
    students = []
    try:
        with open(filename, encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                students.append(row)
    except FileNotFoundError:
        print(f"ไม่พบไฟล์: {filename}")
    return students
```

### การจัดการข้อผิดพลาด
- ตรวจสอบการมีอยู่ของไฟล์ก่อนโหลด
- แจ้งเตือนผู้ใช้หากไฟล์ไม่ถูกต้องหรือสูญหาย
- รองรับ encoding `utf-8` สำหรับภาษาไทย

---

## 9.6 การใช้เทคนิคในการเรียงลำดับข้อมูล (Data Sorting)

โปรแกรมรองรับการเรียงลำดับข้อมูลหลายรูปแบบ

### อัลกอริทึมที่ใช้

| อัลกอริทึม | ความซับซ้อน (เฉลี่ย) | เหมาะกับ |
|------------|----------------------|----------|
| Bubble Sort | O(n²) | ข้อมูลขนาดเล็ก / เพื่อการศึกษา |
| Selection Sort | O(n²) | ข้อมูลขนาดเล็ก |
| Built-in Sort (Timsort) | O(n log n) | ข้อมูลทั่วไปใน Python |

### ตัวอย่างโค้ด

```python
# Bubble Sort
def bubble_sort(data, key):
    n = len(data)
    for i in range(n):
        for j in range(0, n - i - 1):
            if data[j][key] > data[j + 1][key]:
                data[j], data[j + 1] = data[j + 1], data[j]
    return data

# Built-in Sort (แนะนำสำหรับข้อมูลจริง)
students.sort(key=lambda x: x['gpa'], reverse=True)
```

### ตัวเลือกการเรียงลำดับในโปรแกรม
- เรียงตามชื่อ (A–Z / ก–ฮ)
- เรียงตาม GPA (มาก → น้อย)
- เรียงตามรหัสนักศึกษา

---

## 9.7 การใช้เทคนิคในการค้นหาข้อมูล (Data Searching)

โปรแกรมรองรับการค้นหาข้อมูลด้วยหลายวิธี

### อัลกอริทึมที่ใช้

| อัลกอริทึม | ความซับซ้อน | เงื่อนไข |
|------------|-------------|----------|
| Linear Search | O(n) | ใช้ได้กับข้อมูลทุกประเภท |
| Binary Search | O(log n) | ข้อมูลต้องเรียงลำดับแล้ว |

### ตัวอย่างโค้ด

```python
# Linear Search — ค้นหาตามชื่อ
def linear_search(data, query):
    results = []
    for item in data:
        if query.lower() in item['name'].lower():
            results.append(item)
    return results

# Binary Search — ค้นหาตาม ID (ต้องเรียงลำดับก่อน)
def binary_search(data, target_id):
    low, high = 0, len(data) - 1
    while low <= high:
        mid = (low + high) // 2
        if data[mid]['id'] == target_id:
            return data[mid]
        elif data[mid]['id'] < target_id:
            low = mid + 1
        else:
            high = mid - 1
    return None
```

### ตัวเลือกการค้นหาในโปรแกรม
- ค้นหาด้วยรหัส (ID) — ใช้ Binary Search
- ค้นหาด้วยชื่อ (ค้นหาบางส่วน) — ใช้ Linear Search
- แสดงผลลัพธ์ทั้งหมดที่ตรงกัน

---

*เอกสารนี้เป็นส่วนหนึ่งของภาคผนวกโครงงานวิชาการเขียนโปรแกรมเชิงวัตถุ*
