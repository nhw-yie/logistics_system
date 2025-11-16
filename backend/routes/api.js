const express = require('express');
const router = express.Router();
const db = require('../config/orientdb');

const DB_NAME = process.env.ORIENTDB_DB_NAME;

// Hàm tiện ích chung để truy vấn
async function queryOrientDB(query, res) {
  try {
    const response = await db.post(`/command/${DB_NAME}/sql`, {
      command: query
    });
    res.json(response.data.result || []);
  } catch (err) {
    console.error('❌ OrientDB query error:', err.message);
    res.status(500).json({
      message: 'Lỗi truy vấn OrientDB',
      error: err.message,
    });
  }
}


// ======================
//       CÁC API GET
// ======================

// 1️⃣ NHÀ CUNG CẤP & SẢN PHẨM
router.get('/nhacungcap', (req, res) => {
  queryOrientDB('SELECT * FROM NhaCungCap', res);
});

router.get('/sanpham', (req, res) => {
  queryOrientDB('SELECT * FROM SanPham', res);
});

router.get('/danhmuc', (req, res) => {
  queryOrientDB('SELECT * FROM DanhMuc', res);
});

router.get('/loaihang', (req, res) => {
  queryOrientDB('SELECT * FROM LoaiHang', res);
});

// 2️⃣ KHO & CHI NHÁNH
router.get('/kho', (req, res) => {
  queryOrientDB('SELECT * FROM Kho', res);
});

router.get('/khukho', (req, res) => {
  queryOrientDB('SELECT * FROM KhuKho', res);
});

router.get('/chinhanh', (req, res) => {
  queryOrientDB('SELECT * FROM ChiNhanh', res);
});

// 3️⃣ NHÂN SỰ & VẬN CHUYỂN
router.get('/nhanvien', (req, res) => {
  queryOrientDB('SELECT * FROM NhanVien', res);
});

router.get('/taixe', (req, res) => {
  queryOrientDB('SELECT * FROM TaiXe', res);
});

router.get('/xetai', (req, res) => {
  queryOrientDB('SELECT * FROM XeTai', res);
});

router.get('/vanchuyen', (req, res) => {
  queryOrientDB('SELECT * FROM VanChuyen', res);
});

router.get('/lohang', async (req, res) => {
  try {
    const { page = 1, limit = 20, trangThai, search } = req.query;
    const skip = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    
    if (trangThai) {
      whereClause += ` AND trangThai = '${trangThai}'`;
    }
    
    if (search) {
      whereClause += ` AND (maLo LIKE '%${search}%' OR sanPham.tenSP LIKE '%${search}%')`;
    }
    
    const query = `
      SELECT 
        @rid AS id,
        maLo,
        sanPham.maSP AS maSP,
        sanPham.tenSP AS tenSP,
        sanPham.donViTinh AS donViTinh,
        sanPham.loaiHang.tenLoai AS loaiHang,
        sanPham.loaiHang.YC_NhietDo AS yeuCauNhietDo,
        ngaySanXuat,
        hanSuDung,
        soLuong AS soLuongGoc,
        trangThai,
        (sysdate().asDate() - hanSuDung.asDate()) AS soNgayConLai
      FROM LoHang
      ${whereClause}
      ORDER BY hanSuDung ASC
      SKIP ${skip}
      LIMIT ${limit}
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/tonkhotheolo', (req, res) => {
  queryOrientDB('SELECT * FROM TonKhoTheoLo', res);
});

router.get('/tonkhotonghop', (req, res) => {
  queryOrientDB('SELECT * FROM TonKhoTongHop', res);
});

// 5️⃣ QUẢN LÝ ĐƠN HÀNG & PHIẾU
router.get('/dondathang', (req, res) => {
  queryOrientDB('SELECT * FROM DonDatHang', res);
});

router.get('/phieunhap', (req, res) => {
  queryOrientDB('SELECT * FROM PhieuNhap', res);
});

router.get('/phieuxuat', (req, res) => {
  queryOrientDB('SELECT * FROM PhieuXuat', res);
});

router.get('/phieuhoan', (req, res) => {
  queryOrientDB('SELECT * FROM PhieuHoan', res);
});

router.get('/hoadonmua', (req, res) => {
  queryOrientDB('SELECT * FROM HoaDonMua', res);
});

// 6️⃣ HỢP ĐỒNG & BÁO CÁO
router.get('/hopdong', (req, res) => {
  queryOrientDB('SELECT * FROM HopDong', res);
});

router.get('/baocao', (req, res) => {
  queryOrientDB('SELECT * FROM BaoCao', res);
});

// 7️⃣ TUYẾN ĐƯỜNG & QUAN HỆ
router.get('/tuyenduong', (req, res) => {
  queryOrientDB('SELECT * FROM TuyenDuong', res);
});

// ======================
//   API QUAN HỆ (EDGES)
// ======================

// Quan hệ phân phối giữa các kho
router.get('/phanphoi', (req, res) => {
  queryOrientDB('SELECT * FROM PhanPhoi', res);
});

// Quan hệ vận chuyển từ NCC đến kho
router.get('/shipsto', (req, res) => {
  queryOrientDB('SELECT * FROM SHIPS_TO', res);
});

// Quan hệ làm việc tại
router.get('/lamviectai', (req, res) => {
  queryOrientDB('SELECT * FROM LAM_VIEC_TAI', res);
});

// ======================
//   API TRUY VẤN PHỨC TẠP
// ======================

//khu kho theo kho
router.get('/khukho/:maKho', (req, res) => {
  const { maKho } = req.params;
  const query = `
    SELECT maKhu, tenKhu, dungTich, nhietDo, trangThai, hienChua, loaiHang.tenLoai as tenLoaiHang from khukho
WHERE kho IN (SELECT FROM Kho WHERE maKho = '${maKho}')
  `;
  queryOrientDB(query, res);
});


// ======================
//   API KHO
// ======================

// ✅ Thêm kho mới
router.post('/kho', (req, res) => {
  const { 
    maKho, 
    tenKho, 
    loaiKho, 
    diaChi = {}, 
    kinhDo, 
    viDo, 
    dungTich, 
    trangThai 
  } = req.body;

  // Tạo chuỗi JSON cho trường embedded document `diaChi`
  const diaChiJSON = JSON.stringify(diaChi);

  // Xây dựng truy vấn INSERT cho OrientDB
  const query = `
    INSERT INTO Kho SET 
      maKho='${maKho}',
      tenKho='${tenKho}',
      loaiKho='${loaiKho || 'kho_chinh'}',
      diaChi=${diaChiJSON},
      kinhDo=${kinhDo || 0},
      viDo=${viDo || 0},
      dungTich=${dungTich || 0},
      trangThai='${trangThai || 'hoạt_động'}'
  `;

  // Gọi hàm thực thi truy vấn
  queryOrientDB(query, res);
});

// Helper: escape string an toàn cho OrientDB (cần nếu dùng nhồi trực tiếp)
const escapeField = (s) => s ? `'${s.replace(/'/g, "\\'")}'` : "''";

// Helper: chuyển object thành embedded document OrientDB
const escapeEmbedded = (obj) => {
  const parts = [];
  for (let k in obj) {
    if (obj[k] !== undefined && obj[k] !== null) {
      parts.push(`${k}:${escapeField(obj[k].toString())}`);
    }
  }
  return `{${parts.join(', ')}}`;
};

// ✅ PUT /kho/:maKho
router.put('/kho/:maKho', (req, res) => {
  try {
    const { maKho } = req.params;
    const { tenKho, diaChi, dungTich, trangThai, loaiKho, kinhDo, viDo } = req.body;

    // Nếu dùng nhồi trực tiếp: convert diaChi
    let diaChiStr = null;
    if (diaChi) {
      let obj = typeof diaChi === 'string' ? JSON.parse(diaChi) : diaChi;
      diaChiStr = escapeEmbedded(obj);
    }

    // Gom các field cần update
    const fields = [];
    if (tenKho) fields.push(`tenKho='${tenKho.replace(/'/g,"\\'")}'`);
    if (loaiKho) fields.push(`loaiKho='${loaiKho.replace(/'/g,"\\'")}'`);
    if (diaChiStr) fields.push(`diaChi=${diaChiStr}`);
    if (dungTich !== undefined) fields.push(`dungTich=${Number(dungTich)}`);
    if (kinhDo !== undefined) fields.push(`kinhDo=${Number(kinhDo)}`);
    if (viDo !== undefined) fields.push(`viDo=${Number(viDo)}`);
    if (trangThai) fields.push(`trangThai='${trangThai.replace(/'/g,"\\'")}'`);

    // updatedAt
    fields.push(`updatedAt=sysdate()`);

    const query = `UPDATE Kho SET ${fields.join(', ')} WHERE maKho='${maKho.replace(/'/g,"\\'")}'`;

    console.log('📜 OrientDB Query:', query);
    queryOrientDB(query, res);

  } catch (err) {
    res.status(500).json({ message: 'Lỗi xử lý cập nhật kho', error: err.message });
  }
});
// Hàm query trả promise, không gọi res trực tiếp
function queryOrientDBPromise(query) {
  return db.post(`/command/${DB_NAME}/sql`, { command: query })
    .then(response => response.data.result || [])
    .catch(err => { throw err; });
}
// ✅ Xóa kho theo mã
router.delete('/kho/:maKho', async (req, res) => {
  const { maKho } = req.params;

  try {
    // 1️⃣ Lấy @rid của kho
    const result = await queryOrientDBPromise(`SELECT @rid FROM Kho WHERE maKho='${maKho}'`);
    if (!result.length) {
      return res.status(404).json({ message: `Kho ${maKho} không tồn tại` });
    }
    const khoRid = result[0]['@rid'];

    // 2️⃣ Unlink các liên kết
    await queryOrientDBPromise(`UPDATE KhuKho SET kho = NULL WHERE kho = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE PhieuNhap SET kho = NULL WHERE kho = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE PhieuXuat SET kho = NULL WHERE kho = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE PhieuHoan SET khoHoan = NULL WHERE khoHoan = ${khoRid}`);
    await queryOrientDBPromise(`DELETE EDGE PhanPhoi WHERE out = ${khoRid}`);
    await queryOrientDBPromise(`DELETE EDGE SHIPS_TO WHERE in = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE TonKhoTheoLo SET diaDiem = NULL WHERE diaDiem = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE TonKhoTongHop SET diaDiem = NULL WHERE diaDiem = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE TuyenDuong SET diemDi = NULL WHERE diemDi = ${khoRid}`);
    await queryOrientDBPromise(`UPDATE TuyenDuong SET diemDen = NULL WHERE diemDen = ${khoRid}`);

    // 3️⃣ Xóa kho
    await queryOrientDBPromise(`DELETE VERTEX Kho WHERE @rid = ${khoRid}`);

    res.json({ message: `✅ Xóa kho ${maKho} thành công` });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi xóa kho', error: err.message });
  }
});








// ======================
//   API CHI NHÁNH
// ======================

// ✅ Thêm chi nhánh mới
router.post('/chinhanh', (req, res) => {
  const { maChiNhanh, tenChiNhanh, diaChi, soDienThoai, trangThai } = req.body;

  const query = `
    INSERT INTO ChiNhanh SET 
      maChiNhanh='${maChiNhanh}',
      tenChiNhanh='${tenChiNhanh}',
      diaChi='${diaChi}',
      soDienThoai='${soDienThoai || ''}',
      trangThai='${trangThai || 'đang_hoạt_động'}'
  `;

  queryOrientDB(query, res);
});

// ✅ Cập nhật thông tin chi nhánh
router.put('/chinhanh/:maChiNhanh', (req, res) => {
  const { maChiNhanh } = req.params;
  const { tenChiNhanh, diaChi, soDienThoai, trangThai } = req.body;

  const query = `
    UPDATE ChiNhanh 
    SET 
      ${tenChiNhanh ? `tenChiNhanh='${tenChiNhanh}',` : ''}
      ${diaChi ? `diaChi='${diaChi}',` : ''}
      ${soDienThoai ? `soDienThoai='${soDienThoai}',` : ''}
      ${trangThai ? `trangThai='${trangThai}',` : ''}
      updatedAt=SYS_DATETIME()
    WHERE maChiNhanh='${maChiNhanh}'
  `.replace(/,\s*updatedAt/, ' updatedAt'); // xóa dấu phẩy thừa nếu có

  queryOrientDB(query, res);
});

// ✅ Xóa chi nhánh theo mã
router.delete('/chinhanh/:maChiNhanh', (req, res) => {
  const { maChiNhanh } = req.params;

  const query = `
    DELETE FROM ChiNhanh 
    WHERE maChiNhanh='${maChiNhanh}'
  `;

  queryOrientDB(query, res);
});

// ======================
//   API KHU KHO
// ======================

// ✅ Thêm khu kho mới
router.post('/khukho', (req, res) => {
  try {
    const { 
      maKhu, 
      tenKhu, 
      maLoai, 
      dungTich, 
      nhietDo, 
      trangThai, 
      maKho 
    } = req.body;

    // Escape ký tự '
    const safe = s => (s ? s.replace(/'/g, "\\'") : '');

    // Xây dựng truy vấn INSERT OrientDB
    const query = `
      INSERT INTO KhuKho SET 
        maKhu='${safe(maKhu)}',
        tenKhu='${safe(tenKhu)}',
        loaiHang=(SELECT FROM LoaiHang WHERE maLoai='${safe(maLoai)}'),
        dungTich=${dungTich || 0},
        nhietDo=${nhietDo || 0},
        trangThai='${safe(trangThai || 'hoạt_động')}',
        kho=(SELECT FROM Kho WHERE maKho='${safe(maKho)}')
    `;

    // Gọi hàm queryOrientDB
    queryOrientDB(query, res);

  } catch (err) {
    res.status(500).json({ message: 'Lỗi xử lý dữ liệu khu kho', error: err.message });
  }
});

// ✅ Cập nhật khu kho theo mã
router.put('/khukho/:maKhu', (req, res) => {
  const { maKhu } = req.params;
  const { tenKhu, maLoai, dungTich, nhietDo, trangThai, maKho } = req.body;

  const query = `
    UPDATE KhuKho 
    SET 
      ${tenKhu ? `tenKhu='${tenKhu}',` : ''}
      ${maLoai ? `loaiHang=(SELECT FROM LoaiHang WHERE maLoai='${maLoai}'),` : ''}
      ${dungTich !== undefined ? `dungTich=${dungTich},` : ''}
      ${nhietDo !== undefined ? `nhietDo=${nhietDo},` : ''}
      ${maKho ? `kho=(SELECT FROM Kho WHERE maKho='${maKho}'),` : ''}
      ${trangThai ? `trangThai='${trangThai}',` : ''}
      updatedAt=SYS_DATETIME()
    WHERE maKhu='${maKhu}'
  `.replace(/,\s*updatedAt/, ' updatedAt'); // xóa dấu phẩy thừa nếu có

  queryOrientDB(query, res);
});

// ✅ Xóa khu kho theo mã
router.delete('/khukho/:maKhu', (req, res) => {
  const { maKhu } = req.params;

  const query = `
    DELETE FROM KhuKho 
    WHERE maKhu='${maKhu}'
  `;

  queryOrientDB(query, res);
});

/**
 * GET /api/tonkhotonghop
 * Lấy tất cả tồn kho tổng hợp
 */
router.get('/tonkhotonghop', async (req, res) => {
  try {
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, loaiKho} as diaDiem,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        tongSoLuong,
        soLuongConHan,
        soLuongCanDate,
        reorder_point,
        max_stock_level,
        trangThai
      FROM TonKhoTongHop
      WHERE tongSoLuong > 0
      ORDER BY sanPham.tenSP ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotonghop/kho/:maKho
 * Lấy tồn kho tổng hợp theo kho
 */
router.get('/tonkhotonghop/kho/:maKho', async (req, res) => {
  try {
    const { maKho } = req.params;
    
    const query = `
     SELECT 
  sanPham.@rid AS sanPham_id,
  sanPham.maSP AS maSP,
  sanPham.tenSP AS tenSP,
  sanPham.donViTinh AS donViTinh,
  sanPham.donGia AS donGia,
  sanPham.loaiHang.maLoai AS maLoai,
  sanPham.loaiHang.tenLoai AS tenLoai,
  sanPham.loaiHang.YC_NhietDo AS YC_NhietDo,
  sanPham.loaiHang.YC_Khac AS YC_Khac,
  tongSoLuong,
  soLuongConHan,
  soLuongCanDate,
  reorder_point,
  max_stock_level,
  trangThai
FROM TonKhoTongHop
WHERE diaDiem.maKho = '${maKho}'
  AND tongSoLuong > 0
ORDER BY sanPham.tenSP ASC


    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotonghop/chinhanh/:maCN
 * Lấy tồn kho tổng hợp theo chi nhánh
 */

// ======================
//   API LÔ HÀNG
// ======================

// ✅ Thêm lô hàng mới
router.post('/lohang', (req, res) => {
  const { maLo, maSP, ngaySanXuat, hanSuDung, soLuong, trangThai } = req.body;

  const query = `
    INSERT INTO LoHang SET 
      maLo='${maLo}',
      sanPham=(SELECT FROM SanPham WHERE maSP='${maSP}'),
      ngaySanXuat=DATE('${ngaySanXuat}', 'yyyy-MM-dd'),
      hanSuDung=DATE('${hanSuDung}', 'yyyy-MM-dd'),
      soLuong=${soLuong || 0},
      trangThai='${trangThai || 'còn_hạn'}'
  `;

  queryOrientDB(query, res);
});

// ✅ Cập nhật thông tin lô hàng
router.put('/lohang/:maLo', (req, res) => {
  const { maLo } = req.params;
  const { maSP, ngaySanXuat, hanSuDung, soLuong, trangThai } = req.body;

  const query = `
    UPDATE LoHang 
    SET 
      ${maSP ? `sanPham=(SELECT FROM SanPham WHERE maSP='${maSP}'),` : ''}
      ${ngaySanXuat ? `ngaySanXuat=DATE('${ngaySanXuat}', 'yyyy-MM-dd'),` : ''}
      ${hanSuDung ? `hanSuDung=DATE('${hanSuDung}', 'yyyy-MM-dd'),` : ''}
      ${soLuong !== undefined ? `soLuong=${soLuong},` : ''}
      ${trangThai ? `trangThai='${trangThai}',` : ''}
      updatedAt=SYS_DATETIME()
    WHERE maLo='${maLo}'
  `.replace(/,\s*updatedAt/, ' updatedAt'); // xóa dấu phẩy thừa nếu có

  queryOrientDB(query, res);
});


// ============================================
// 2. LẤY THÔNG TIN CHI TIẾT 1 LÔ HÀNG
// ============================================
router.get('/lohang/:maLo', async (req, res) => {
  try {
    const { maLo } = req.params;
    
    const query = `
      SELECT 
        @rid AS id,
        maLo,
        sanPham.@rid AS sanPham_id,
        sanPham.maSP AS maSP,
        sanPham.tenSP AS tenSP,
        sanPham.donViTinh AS donViTinh,
        sanPham.giaBan AS giaBan,
        sanPham.loaiHang.tenLoai AS loaiHang,
        sanPham.loaiHang.YC_NhietDo AS yeuCauNhietDo,
        sanPham.loaiHang.YC_Khac AS yeuCauKhac,
        ngaySanXuat,
        hanSuDung,
        soLuong AS soLuongGoc,
        trangThai
      FROM LoHang
      WHERE maLo = '${maLo}'
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Xóa lô hàng theo mã
router.delete('/lohang/:maLo', (req, res) => {
  const { maLo } = req.params;

  const query = `
    DELETE FROM LoHang 
    WHERE maLo='${maLo}'
  `;

  queryOrientDB(query, res);
});

router.get('/tonkhotonghop/chinhanh/:maCN', async (req, res) => {
  try {
    const { maCN } = req.params;
    
    const query = `
      SELECT 
        sanPham.@rid AS sanPham_id,
        sanPham.maSP AS maSP,
        sanPham.tenSP AS tenSP,
        sanPham.donViTinh AS donViTinh,
        sanPham.giaBan AS giaBan,
        sanPham.loaiHang.maLoai AS maLoai,
        sanPham.loaiHang.tenLoai AS tenLoai,
        sanPham.loaiHang.YC_NhietDo AS YC_NhietDo,
        sanPham.loaiHang.YC_Khac AS YC_Khac,
        tongSoLuong,
        soLuongConHan,
        soLuongCanDate,
        reorder_point,
        max_stock_level,
        trangThai
      FROM TonKhoTongHop
      WHERE diaDiem.maChiNhanh = '${maCN}'
        AND tongSoLuong > 0
      ORDER BY sanPham.tenSP ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
/**
 * GET /api/tonkhotonghop/sanpham/:maSP
 * Lấy tồn kho của 1 sản phẩm tại tất cả địa điểm
 */
router.get('/tonkhotonghop/sanpham/:maSP', async (req, res) => {
  try {
    const { maSP } = req.params;
    
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        tongSoLuong,
        soLuongConHan,
        soLuongCanDate,
        trangThai
      FROM TonKhoTongHop
      WHERE sanPham.maSP = '${maSP}'
        AND tongSoLuong > 0
    `;

    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotonghop/canh-bao
 * Lấy danh sách sản phẩm cần đặt hàng (dưới reorder_point) hoặc cận date
 */
router.get('/tonkhotonghop/canh-bao', async (req, res) => {
  try {
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        tongSoLuong,
        soLuongConHan,
        soLuongCanDate,
        reorder_point,
        trangThai
      FROM TonKhoTongHop
      WHERE (tongSoLuong <= reorder_point OR soLuongCanDate > 0)
        AND tongSoLuong > 0
      ORDER BY 
        CASE trangThai
          WHEN 'het_hang' THEN 1
          WHEN 'can_date' THEN 2
          ELSE 3
        END,
        tongSoLuong ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/nhanvien/chinhanh/:maCN
 * Lấy danh sách nhân viên đang làm việc tại chi nhánh
 */
router.get('/nhanvien/chinhanh/:maCN', async (req, res) => {
  try {
    const { maCN } = req.params;

    const query = `
      MATCH {
  class: ChiNhanh, 
  as: cn, 
  where: (maChiNhanh = '${maCN}')
}<-LAM_VIEC_TAI-{
  as: nv, 
  where: (trangThai = 'đang_làm_việc')
}
RETURN 
  nv.@rid as id,
  nv.maNV as maNV,
  nv.hoTen as hoTen,
  nv.chucVu as chucVu,
  nv.boPhan as boPhan,
  nv.ngayVaoLam as ngayVaoLam,
  nv.lienHe.sdt as sdt,
  nv.lienHe.email as email,
  cn.maChiNhanh as maChiNhanh,
  cn.tenChiNhanh as tenChiNhanh

    `;

    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// ============================================
// 2. API TỒN KHO THEO LÔ
// ============================================

/**
 * GET /api/tonkhotheolo/kho/:maKho
 * Lấy tồn kho chi tiết theo lô tại kho
 */
router.get('/tonkhotheolo/kho/:maKho', async (req, res) => {
  try {
    const { maKho } = req.params;
    
    const query = `
      SELECT 
  @rid as id,
  diaDiem.@rid as diaDiem_id,
  diaDiem.maKho as diaDiem_maKho,
  diaDiem.tenKho as diaDiem_tenKho,
  loHang.@rid as loHang_id,
  loHang.maLo as loHang_maLo,
  loHang.hanSuDung as loHang_hanSuDung,
  loHang.ngaySanXuat as loHang_ngaySanXuat,
  sanPham.@rid as sanPham_id,
  sanPham.maSP as sanPham_maSP,
  sanPham.tenSP as sanPham_tenSP,
  sanPham.donViTinh as sanPham_donViTinh,
  soLuongHienTai,
  ngayNhapKho,
  viTriLuuTru,
  trangThai,
  (loHang.hanSuDung.asDate() - sysdate().asDate()) as soNgayConLai
FROM TonKhoTheoLo
WHERE diaDiem.maKho = '${maKho}'
  AND soLuongHienTai > 0
ORDER BY loHang.hanSuDung ASC

    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotheolo/chinhanh/:maCN
 * Lấy tồn kho theo lô tại chi nhánh
 */
router.get('/tonkhotheolo/chinhanh/:maCN', async (req, res) => {
  try {
    const { maCN } = req.params;

    const query = `
      SELECT 
        @rid as id,
        diaDiem.@rid as diaDiem_id,
        diaDiem.maChiNhanh as diaDiem_maChiNhanh,
        diaDiem.tenChiNhanh as diaDiem_tenChiNhanh,
        loHang.@rid as loHang_id,
        loHang.maLo as loHang_maLo,
        loHang.hanSuDung as loHang_hanSuDung,
        loHang.ngaySanXuat as loHang_ngaySanXuat,
        sanPham.@rid as sanPham_id,
        sanPham.maSP as sanPham_maSP,
        sanPham.tenSP as sanPham_tenSP,
        sanPham.donViTinh as sanPham_donViTinh,
        soLuongHienTai,
        ngayNhapKho,
        viTriLuuTru,
        trangThai,
        (loHang.hanSuDung.asDate() - sysdate().asDate()) as soNgayConLai
      FROM TonKhoTheoLo
      WHERE diaDiem.maChiNhanh = '${maCN}'
        AND soLuongHienTai > 0
      ORDER BY loHang.hanSuDung ASC
    `;

    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// routes/lohang.js
router.get('/lohang/:maLo/phanbo', async (req, res) => {
  try {
    const { maLo } = req.params;
  console.log('Received request for maLo:', maLo);
    const query = `
      SELECT 
        @rid AS id,
        CASE 
          WHEN diaDiem.@class = 'Kho' THEN 'Kho'
          WHEN diaDiem.@class = 'ChiNhanh' THEN 'Chi Nhánh'
          ELSE 'Khác'
        END AS loaiDiaDiem,
        CASE 
          WHEN diaDiem.@class = 'Kho' THEN diaDiem.maKho
          WHEN diaDiem.@class = 'ChiNhanh' THEN diaDiem.maChiNhanh
          ELSE ''
        END AS maDiaDiem,
        CASE 
          WHEN diaDiem.@class = 'Kho' THEN diaDiem.tenKho
          WHEN diaDiem.@class = 'ChiNhanh' THEN diaDiem.tenChiNhanh
          ELSE ''
        END AS tenDiaDiem,
        soLuongHienTai,
        ngayNhapKho,
        viTriLuuTru,
        trangThai
      FROM TonKhoTheoLo
      WHERE loHang.maLo = '${maLo}'
      ORDER BY ngayNhapKho DESC
    `;
    console.log('Received request for maLo:', maLo);

    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ============================================
// 4. LẤY TỔNG SỐ LƯỢNG CÒN LẠI CỦA LÔ
// ============================================
router.get('/lohang/:maLo/tonghop', async (req, res) => {
  try {
    const { maLo } = req.params;
    
    const query = `
      SELECT 
        loHang.maLo AS maLo,
        loHang.sanPham.tenSP AS tenSP,
        loHang.soLuong AS soLuongGoc,
        SUM(soLuongHienTai) AS tongSoLuongConLai,
        COUNT(*) AS soDiaDiem,
        loHang.hanSuDung AS hanSuDung,
        loHang.trangThai AS trangThai
      FROM TonKhoTheoLo
      WHERE loHang.maLo = '${maLo}'
      GROUP BY loHang.maLo, loHang.sanPham.tenSP, loHang.soLuong, loHang.hanSuDung, loHang.trangThai
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// ============================================
// 5. LÔ HÀNG SẮP HẾT HẠN (Dashboard Alert)
// ============================================
router.get('/lohang/canh-bao/sap-het-han', async (req, res) => {
  try {
    const { soNgay = 7 } = req.query; // Mặc định cảnh báo trước 7 ngày
    
    const query = `
      SELECT 
        L.maLo,
        L.sanPham.tenSP AS tenSP,
        L.sanPham.loaiHang.tenLoai AS loaiHang,
        L.hanSuDung,
        L.trangThai,
        (L.hanSuDung.asDate() - sysdate().asDate()) AS soNgayConLai,
        SUM(T.soLuongHienTai) AS tongSoLuongConLai,
        COUNT(T.@rid) AS soDiaDiem
      FROM LoHang L
      LEFT JOIN TonKhoTheoLo T ON T.loHang = L.@rid
      WHERE (L.hanSuDung.asDate() - sysdate().asDate()) <= ${soNgay}
        AND (L.hanSuDung.asDate() - sysdate().asDate()) >= 0
        AND L.trangThai != 'het_han'
      GROUP BY L.maLo, L.sanPham.tenSP, L.sanPham.loaiHang.tenLoai, L.hanSuDung, L.trangThai
      ORDER BY soNgayConLai ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 6. LÔ HÀNG THEO SẢN PHẨM
// ============================================
router.get('/lohang/sanpham/:maSP', async (req, res) => {
  try {
    const { maSP } = req.params;
    
    const query = `
      SELECT 
        maLo,
        ngaySanXuat,
        hanSuDung,
        soLuong AS soLuongGoc,
        trangThai,
        (hanSuDung.asDate() - sysdate().asDate()) AS soNgayConLai
      FROM LoHang
      WHERE sanPham.maSP = '${maSP}'
      ORDER BY hanSuDung ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 7. THỐNG KÊ LÔ HÀNG THEO TRẠNG THÁI
// ============================================
router.get('/lohang/thongke/trangthai', async (req, res) => {
  try {
    const query = `
      SELECT 
        trangThai,
        COUNT(*) AS soLuongLo,
        SUM(soLuong) AS tongSoLuongGoc
      FROM LoHang
      GROUP BY trangThai
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 8. TÌM KIẾM LÔ HÀNG NÂNG CAO
// ============================================
router.post('/lohang/search', async (req, res) => {
  try {
    const { 
      maSP, 
      loaiHang, 
      tuNgay, 
      denNgay, 
      trangThai,
      diaDiem 
    } = req.body;
    
    let whereClause = 'WHERE 1=1';
    
    if (maSP) {
      whereClause += ` AND sanPham.maSP = '${maSP}'`;
    }
    
    if (loaiHang) {
      whereClause += ` AND sanPham.loaiHang.maLoai = '${loaiHang}'`;
    }
    
    if (tuNgay) {
      whereClause += ` AND hanSuDung >= '${tuNgay}'`;
    }
    
    if (denNgay) {
      whereClause += ` AND hanSuDung <= '${denNgay}'`;
    }
    
    if (trangThai) {
      whereClause += ` AND trangThai = '${trangThai}'`;
    }
    
    const query = `
      SELECT 
        maLo,
        sanPham.maSP AS maSP,
        sanPham.tenSP AS tenSP,
        sanPham.loaiHang.tenLoai AS loaiHang,
        ngaySanXuat,
        hanSuDung,
        soLuong,
        trangThai
      FROM LoHang
      ${whereClause}
      ORDER BY hanSuDung ASC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 9. CẬP NHẬT TRẠNG THÁI LÔ HÀNG
// ============================================
router.patch('/lohang/:maLo/trangthai', async (req, res) => {
  try {
    const { maLo } = req.params;
    const { trangThai } = req.body;
    
    const query = `
      UPDATE LoHang 
      SET trangThai = '${trangThai}'
      WHERE maLo = '${maLo}'
      RETURN AFTER
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 10. LẤY LỊCH SỬ DI CHUYỂN LÔ HÀNG
// ============================================
router.get('/lohang/:maLo/lichsu', async (req, res) => {
  try {
    const { maLo } = req.params;
    
    const query = `
      SELECT 
        @rid AS id,
        ngayNhapKho,
        CASE 
          WHEN diaDiem.@class = 'Kho' THEN diaDiem.tenKho
          WHEN diaDiem.@class = 'ChiNhanh' THEN diaDiem.tenChiNhanh
          ELSE ''
        END AS tenDiaDiem,
        soLuongHienTai,
        viTriLuuTru,
        trangThai
      FROM TonKhoTheoLo
      WHERE loHang.maLo = '${maLo}'
      ORDER BY ngayNhapKho DESC
    `;
    
    queryOrientDB(query, res);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotheolo/sanpham/:maSP
 * Lấy tất cả các lô của 1 sản phẩm
 */
router.get('/tonkhotheolo/sanpham/:maSP', async (req, res) => {
  try {
    const { maSP } = req.params;
    
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        loHang.{@rid, maLo, hanSuDung, ngaySanXuat} as loHang,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        soLuongHienTai,
        ngayNhapKho,
        viTriLuuTru,
        trangThai,
        (loHang.hanSuDung.asDate() - sysdate().asDate()) as soNgayConLai
      FROM TonKhoTheoLo
      WHERE sanPham.maSP = :maSP
        AND soLuongHienTai > 0
      ORDER BY loHang.hanSuDung ASC
    `;
    
    const result = await db.query(query, { maSP });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotheolo/lo/:maLo
 * Lấy thông tin tồn kho của 1 lô hàng cụ thể
 */
router.get('/tonkhotheolo/lo/:maLo', async (req, res) => {
  try {
    const { maLo } = req.params;
    
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        loHang.{@rid, maLo, hanSuDung, ngaySanXuat} as loHang,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        soLuongHienTai,
        ngayNhapKho,
        viTriLuuTru,
        trangThai
      FROM TonKhoTheoLo
      WHERE loHang.maLo = :maLo
    `;
    
    const result = await db.query(query, { maLo });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotheolo/can-date
 * Lấy danh sách lô hàng cận date (còn dưới 30 ngày)
 */
router.get('/tonkhotheolo/can-date', async (req, res) => {
  try {
    const { days = 30 } = req.query; // Mặc định 30 ngày
    
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        loHang.{@rid, maLo, hanSuDung} as loHang,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        soLuongHienTai,
        viTriLuuTru,
        trangThai,
        (loHang.hanSuDung.asDate() - sysdate().asDate()) as soNgayConLai
      FROM TonKhoTheoLo
      WHERE soLuongHienTai > 0
        AND (loHang.hanSuDung.asDate() - sysdate().asDate()) <= :days
        AND (loHang.hanSuDung.asDate() - sysdate().asDate()) >= 0
      ORDER BY soNgayConLai ASC
    `;
    
    const result = await db.query(query, { days: parseInt(days) });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkhotheolo/het-han
 * Lấy danh sách lô hàng đã hết hạn
 */
router.get('/tonkhotheolo/het-han', async (req, res) => {
  try {
    const query = `
      SELECT 
        @rid as id,
        diaDiem.{@rid, maKho, tenKho, maCN, tenCN} as diaDiem,
        loHang.{@rid, maLo, hanSuDung} as loHang,
        sanPham.{@rid, maSP, tenSP, donViTinh} as sanPham,
        soLuongHienTai,
        viTriLuuTru,
        (loHang.hanSuDung.asDate() - sysdate().asDate()) as soNgayConLai
      FROM TonKhoTheoLo
      WHERE soLuongHienTai > 0
        AND loHang.hanSuDung < sysdate()
      ORDER BY loHang.hanSuDung ASC
    `;
    
    const result = await db.query(query);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============================================
// 3. API THỐNG KÊ TỒN KHO
// ============================================

/**
 * GET /api/tonkho/thongke/tong-quan
 * Thống kê tổng quan toàn hệ thống
 */
router.get('/tonkho/thongke/tong-quan', async (req, res) => {
  try {
    const query = `
      SELECT 
        sum(tongSoLuong) as tongSoLuongToanBo,
        sum(soLuongConHan) as tongSoLuongConHan,
        sum(soLuongCanDate) as tongSoLuongCanDate,
        count(*) as soSanPhamKhacNhau,
        count(CASE WHEN tongSoLuong <= reorder_point THEN 1 END) as soSanPhamCanDatHang,
        count(CASE WHEN trangThai = 'het_hang' THEN 1 END) as soSanPhamHetHang
      FROM TonKhoTongHop
      WHERE tongSoLuong > 0
    `;
    
    const result = await db.query(query);
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkho/thongke/theo-kho/:maKho
 * Thống kê tồn kho của 1 kho
 */
router.get('/tonkho/thongke/theo-kho/:maKho', async (req, res) => {
  try {
    const { maKho } = req.params;
    
    const query = `
      SELECT 
        sum(tongSoLuong) as tongSoLuong,
        sum(soLuongConHan) as soLuongConHan,
        sum(soLuongCanDate) as soLuongCanDate,
        count(*) as soSanPham,
        count(CASE WHEN tongSoLuong <= reorder_point THEN 1 END) as soSanPhamCanDatHang
      FROM TonKhoTongHop
      WHERE diaDiem.maKho = :maKho
        AND tongSoLuong > 0
    `;
    
    const result = await db.query(query, { maKho });
    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/tonkho/thongke/gia-tri
 * Thống kê giá trị tồn kho
 */
router.get('/tonkho/thongke/gia-tri', async (req, res) => {
  try {
    const query = `
      SELECT 
        diaDiem.{maKho, tenKho} as kho,
        sanPham.{maSP, tenSP} as sanPham,
        tongSoLuong,
        sanPham.donGia as donGia,
        (tongSoLuong * sanPham.donGia) as giaTriTonKho
      FROM TonKhoTongHop
      WHERE tongSoLuong > 0
      ORDER BY giaTriTonKho DESC
    `;
    
    const result = await db.query(query);
    
    const tongGiaTri = result.reduce((sum, item) => sum + (item.giaTriTonKho || 0), 0);
    
    res.json({
      chiTiet: result,
      tongGiaTri
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Sản phẩm theo danh mục
router.get('/sanpham/danhmuc/:maDanhMuc', (req, res) => {
  const { maDanhMuc } = req.params;
  const query = `SELECT * FROM SanPham WHERE danhMuc.maDanhMuc = '${maDanhMuc}'`;
  queryOrientDB(query, res);
});

// Nhân viên theo chi nhánh/kho
router.get('/nhanvien/diadiem/:maDiaDiem', (req, res) => {
  const { maDiaDiem } = req.params;
  const query = `
    SELECT EXPAND(IN('LAM_VIEC_TAI')) 
    FROM (
      SELECT FROM Kho WHERE maKho = '${maDiaDiem}'
      UNION
      SELECT FROM ChiNhanh WHERE maChiNhanh = '${maDiaDiem}'
    )
  `;
  queryOrientDB(query, res);
});

// Tuyến đường từ kho đến chi nhánh
router.get('/tuyenduong/:maKho/:maChiNhanh', (req, res) => {
  const { maKho, maChiNhanh } = req.params;
  const query = `
    SELECT * FROM TuyenDuong 
    WHERE diemDi.maKho = '${maKho}' 
    AND diemDen.maChiNhanh = '${maChiNhanh}'
  `;
  queryOrientDB(query, res);
});

// Sản phẩm sắp hết hạn (cận date)
router.get('/sanpham/candate', (req, res) => {
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      diaDiem.maKho as maKho,
      diaDiem.tenKho as tenKho,
      soLuongCanDate
    FROM TonKhoTongHop 
    WHERE soLuongCanDate > 0
  `;
  queryOrientDB(query, res);
});

// Thống kê tồn kho theo loại hàng
router.get('/thongke/tonkho', (req, res) => {
  const query = `
    SELECT 
      loaiHang.tenLoai as loaiHang,
      SUM(tongSoLuong) as tongTonKho,
      SUM(soLuongConHan) as tongConHan,
      SUM(soLuongCanDate) as tongCanDate
    FROM TonKhoTongHop 
    GROUP BY loaiHang
  `;
  queryOrientDB(query, res);
});

// ======================
//        TEST
// ======================
router.get('/ping', (req, res) => {
  res.json({ message: '✅ API OrientDB hoạt động!' });
});

// Thống kê tổng quan hệ thống
router.get('/thongke/tongquan', (req, res) => {
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM Kho) as soLuongKho,
      (SELECT COUNT(*) FROM ChiNhanh) as soLuongChiNhanh,
      (SELECT COUNT(*) FROM NhanVien) as soLuongNhanVien,
      (SELECT COUNT(*) FROM SanPham) as soLuongSanPham,
      (SELECT COUNT(*) FROM NhaCungCap) as soLuongNhaCungCap,
      (SELECT SUM(tongSoLuong) FROM TonKhoTongHop) as tongSoLuongTonKho
  `;
  queryOrientDB(query, res);
});
// ======================
// API SẢN PHẨM THEO CHI NHÁNH
// ======================

// 1. Danh sách sản phẩm có tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      sanPham.giaBan as giaBan,
      tongSoLuong,
      soLuongConHan,
      soLuongCanDate,
      trangThai
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND tongSoLuong > 0
    AND trangThai != 'ngung_kinh_doanh'
  `;
  queryOrientDB(query, res);
});

// 2. Sản phẩm còn hàng tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/conhang', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      sanPham.giaBan as giaBan,
      tongSoLuong,
      soLuongConHan
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND soLuongConHan > 0
    AND trangThai = 'con_hang'
  `;
  queryOrientDB(query, res);
});

// 3. Sản phẩm sắp hết hàng tại chi nhánh (dưới điểm đặt hàng)
router.get('/sanpham/chinhanh/:maChiNhanh/saphethang', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      tongSoLuong,
      reorder_point,
      max_stock_level
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND tongSoLuong <= reorder_point
    AND trangThai = 'con_hang'
  `;
  queryOrientDB(query, res);
});

// 4. Sản phẩm sắp hết hạn tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/saphethan', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      soLuongCanDate
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND soLuongCanDate > 0
  `;
  queryOrientDB(query, res);
});

// 5. Sản phẩm theo danh mục tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/danhmuc/:maDanhMuc', (req, res) => {
  const { maChiNhanh, maDanhMuc } = req.params;
  const query = `
    SELECT 
      sp.maSP as maSP,
      sp.tenSP as tenSP,
      sp.donViTinh as donViTinh,
      sp.giaBan as giaBan,
      tk.tongSoLuong as tongSoLuong,
      tk.soLuongConHan as soLuongConHan
    FROM TonKhoTongHop tk
    LET sp = tk.sanPham
    WHERE tk.diaDiem.maChiNhanh = '${maChiNhanh}'
    AND sp.danhMuc.maDanhMuc = '${maDanhMuc}'
    AND tk.tongSoLuong > 0
  `;
  queryOrientDB(query, res);
});

// 6. Chi tiết sản phẩm cụ thể tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/:maSP', (req, res) => {
  const { maChiNhanh, maSP } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      sanPham.giaBan as giaBan,
      sanPham.danhMuc.tenDanhMuc as danhMuc,
      sanPham.loaiHang.tenLoai as loaiHang,
      tongSoLuong,
      soLuongConHan,
      soLuongCanDate,
      reorder_point,
      max_stock_level,
      trangThai
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND sanPham.maSP = '${maSP}'
  `;
  queryOrientDB(query, res);
});

// 7. Sản phẩm ngừng kinh doanh tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/ngungkinhdoanh', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      trangThai
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND trangThai = 'ngung_kinh_doanh'
  `;
  queryOrientDB(query, res);
});

// 8. So sánh tồn kho sản phẩm giữa các chi nhánh
router.get('/sanpham/:maSP/so-sanh-chi-nhanh', (req, res) => {
  const { maSP } = req.params;
  const query = `
    SELECT 
      diaDiem.maChiNhanh as maChiNhanh,
      diaDiem.tenChiNhanh as tenChiNhanh,
      tongSoLuong,
      soLuongConHan,
      soLuongCanDate,
      trangThai
    FROM TonKhoTongHop 
    WHERE sanPham.maSP = '${maSP}'
    AND diaDiem.@class = 'ChiNhanh'
    ORDER BY tongSoLuong DESC
  `;
  queryOrientDB(query, res);
});

// 9. Thống kê sản phẩm theo loại hàng tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/thongke-loaihang', (req, res) => {
  const { maChiNhanh } = req.params;
  const query = `
    SELECT 
      sanPham.loaiHang.tenLoai as loaiHang,
      COUNT(*) as soLuongSanPham,
      SUM(tongSoLuong) as tongSoLuong,
      SUM(soLuongConHan) as tongConHan
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND tongSoLuong > 0
    GROUP BY sanPham.loaiHang
  `;
  queryOrientDB(query, res);
});

// 10. Tìm kiếm sản phẩm tại chi nhánh
router.get('/sanpham/chinhanh/:maChiNhanh/timkiem/:keyword', (req, res) => {
  const { maChiNhanh, keyword } = req.params;
  const query = `
    SELECT 
      sanPham.maSP as maSP,
      sanPham.tenSP as tenSP,
      sanPham.donViTinh as donViTinh,
      sanPham.giaBan as giaBan,
      tongSoLuong,
      soLuongConHan
    FROM TonKhoTongHop 
    WHERE diaDiem.maChiNhanh = '${maChiNhanh}'
    AND (sanPham.tenSP.toLowerCase() LIKE '%${keyword.toLowerCase()}%' 
         OR sanPham.maSP = '${keyword}')
    AND tongSoLuong > 0
  `;
  queryOrientDB(query, res);
});
module.exports = router;