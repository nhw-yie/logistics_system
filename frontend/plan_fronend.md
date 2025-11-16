Tốt — bạn đã có **backend OrientDB** và cấu trúc **frontend (Vite + React)** sẵn.
Giờ để **GitHub Copilot** tự sinh và hỗ trợ hoàn thiện **frontend dashboard**, bạn nên tạo một file hướng dẫn chi tiết cho Copilot đọc (thường là `COPILOT_PLAN.md` hoặc `README_DEV.md`) trong thư mục `frontend/`.

Dưới đây là nội dung gợi ý **file Markdown hoàn chỉnh** để Copilot hiểu hệ thống và tự động sinh các component, page, và service tương ứng 👇

---

### 🧭 `frontend/COPILOT_PLAN.md`

```markdown
# 🚀 HƯỚNG DẪN XÂY DỰNG FRONTEND DASHBOARD CHUỖI CUNG ỨNG

## 🎯 Mục tiêu
Xây dựng giao diện quản trị chuỗi cung ứng (Supply Chain Dashboard) gồm:
- **Trang chủ (Dashboard)**: hiển thị thống kê nhanh (số kho, chi nhánh, sản phẩm, nhà cung cấp)
- **Quản lý kho**: xem danh sách kho, trạng thái, dung tích, loại kho
- **Quản lý chi nhánh**: hiển thị danh sách chi nhánh, thông tin liên hệ, quản lý
- **Quản lý sản phẩm**: gồm 2 phần:
  - Danh mục sản phẩm
  - Sản phẩm chi tiết (tên, mã, giá bán, trạng thái, danh mục, cung ứng)
- **Quản lý nguồn hàng (Nhà cung cấp)**: hiển thị danh sách nhà cung cấp, địa chỉ, trạng thái, ngày hợp tác

Dữ liệu được lấy từ **backend OrientDB API** đã setup sẵn (Node.js + Express).

---

## ⚙️ API Endpoint Backend (đã có sẵn)
- `/api/nhacungcap` → danh sách nhà cung cấp  
- `/api/chinhanh` → danh sách chi nhánh  
- `/api/nhanvien` → danh sách nhân viên  
- `/api/taixe` → danh sách tài xế  
- `/api/kho` → danh sách kho  
- `/api/sanpham` → danh sách sản phẩm  
- `/api/danhmuc` → danh sách danh mục  
- `/api/vanchuyen` → danh sách tuyến vận chuyển  
- `/api/baocao` → danh sách báo cáo  

Tất cả API trả về JSON.

---

## 🧩 Cấu trúc frontend đề xuất
```

frontend/
├── src/
│   ├── api/              # gọi API backend qua axios
│   │   ├── orientdb.js
│   ├── components/       # các component tái sử dụng
│   │   ├── CardStat.jsx
│   │   ├── TableData.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── pages/            # các trang chính
│   │   ├── Dashboard.jsx
│   │   ├── Kho.jsx
│   │   ├── ChiNhanh.jsx
│   │   ├── SanPham.jsx
│   │   ├── DanhMuc.jsx
│   │   ├── NhaCungCap.jsx
│   └── App.jsx
├── vite.config.js
├── package.json
└── index.html

````

---

## 🧠 Hướng dẫn cho GitHub Copilot

### 1️⃣ Tạo file gọi API
**File:** `src/api/orientdb.js`
```js
import axios from 'axios';
const API_BASE = 'http://localhost:5000/api';
export const getData = async (path) => (await axios.get(`${API_BASE}/${path}`)).data;
````

### 2️⃣ Tạo layout chung

**File:** `src/components/Sidebar.jsx`
Gồm các menu:

* Dashboard
* Quản lý kho
* Quản lý chi nhánh
* Quản lý sản phẩm
* Quản lý nguồn hàng

**File:** `src/components/Navbar.jsx`
Hiển thị tiêu đề và tên trang hiện tại.

### 3️⃣ Trang Dashboard

Hiển thị 4 ô thống kê:

* Số kho
* Số chi nhánh
* Số sản phẩm
* Số nhà cung cấp

### 4️⃣ Trang Quản lý kho

Hiển thị bảng:

* Mã kho
* Tên kho
* Loại kho
* Dung tích
* Trạng thái

### 5️⃣ Trang Quản lý chi nhánh

Hiển thị bảng:

* Mã chi nhánh
* Tên chi nhánh
* Quản lý (tên nhân viên)
* Địa chỉ
* Trạng thái

### 6️⃣ Trang Quản lý sản phẩm

Tab 1: Danh mục
Tab 2: Sản phẩm

### 7️⃣ Trang Quản lý nguồn hàng

Hiển thị bảng:

* Mã NCC
* Tên NCC
* Địa chỉ
* Ngày hợp tác
* Trạng thái

---

## 🧭 Routing React

Dùng React Router:

```js
<Route path="/" element={<Dashboard />} />
<Route path="/kho" element={<Kho />} />
<Route path="/chinhanh" element={<ChiNhanh />} />
<Route path="/sanpham" element={<SanPham />} />
<Route path="/nhacungcap" element={<NhaCungCap />} />
```

---

## 🧱 UI Framework

* **TailwindCSS** (đã cài sẵn bằng `npm install -D tailwindcss postcss autoprefixer`)
* **shadcn/ui** hoặc **MUI** để Copilot sinh component đẹp.

---


## ✅ Kết quả mong muốn

Frontend có thể:

* Truy cập API từ backend OrientDB
* Hiển thị dữ liệu động
* Có navigation giữa các module
* Có giao diện hiện đại, trực quan


