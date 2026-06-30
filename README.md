# JobSearch Platform (App_NST)

แพลตฟอร์มหางานที่พัฒนาด้วย Next.js, Prisma, และ Tailwind CSS รองรับการใช้งานทั้งสำหรับผู้หางาน (Seeker) และนายจ้าง (Employer) พร้อมฟีเจอร์หลักเช่น การจัดการโปรไฟล์, โพสต์งาน, บันทึกงาน (Saved Jobs), และ Dark Mode

## 🛠️ ขั้นตอนการติดตั้งและการรันโปรเจกต์ (Installation & Setup)

1. **โคลนโปรเจกต์ลงมาที่เครื่อง (Clone the repository)**
   ```bash
   git clone https://github.com/10VE48TKU-KaCha/App_NST.git
   cd App_NST
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

3. **ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables)**
   สร้างไฟล์ `.env` ไว้ที่ root ของโปรเจกต์ แล้วกำหนดค่าดังนี้:
   ```env
   DATABASE_URL="postgresql://<USER>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>?schema=public"
   NEXTAUTH_SECRET="<YOUR_SECRET>"
   NEXTAUTH_URL="http://localhost:3000"
   ```
   *(หมายเหตุ: แทนที่ค่า DATABASE_URL ให้ตรงกับฐานข้อมูล PostgreSQL ของคุณ)*

4. **สร้างและอัปเดตฐานข้อมูลด้วย Prisma**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **รันโปรเจกต์ (Start the development server)**
   ```bash
   npm run dev
   ```
   เปิดเบราว์เซอร์แล้วเข้าไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🔄 คำสั่ง Git พื้นฐาน (Git Push & Pull)

### 📥 การดึงอัปเดตโค้ดล่าสุดจาก GitHub (Git Pull)
หากมีทีมงานอัปเดตโค้ด หรือต้องการดึงโค้ดเวอร์ชันล่าสุดจาก GitHub มาที่เครื่องของคุณ ให้รันคำสั่ง:
```bash
git pull origin main
```
*(ถ้ามีการอัปเดตฐานข้อมูล อย่าลืมรัน `npx prisma generate` และ `npx prisma db push` อีกครั้งด้วย)*

### 📤 การอัปโหลดโค้ดใหม่ขึ้น GitHub (Git Push)
เมื่อคุณเขียนโค้ดเสร็จแล้ว และต้องการอัปโหลด (Push) ขึ้นไปยัง GitHub ให้ทำตามขั้นตอนดังนี้:

1. **เพิ่มไฟล์ที่มีการเปลี่ยนแปลงเข้า Staging**
   ```bash
   git add .
   ```
2. **คอมมิต (Commit) เพื่อบันทึกประวัติการเปลี่ยนแปลง**
   *ควรเปลี่ยนข้อความในเครื่องหมายคำพูดให้ตรงกับสิ่งที่คุณแก้ไข*
   ```bash
   git commit -m "ใส่ข้อความอธิบายว่าแก้ไขอะไรไปบ้าง เช่น Update README"
   ```
3. **พุช (Push) อัปโหลดขึ้น GitHub**
   ```bash
   git push origin main
   ```
