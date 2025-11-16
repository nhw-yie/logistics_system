-- ============================================
-- ORIENTDB SCHEMA - HỆ THỐNG CHUỖI CUNG ỨNG
-- ============================================

-- ========== LỚP NHÚNG ==========

CREATE CLASS DiaChi;
CREATE PROPERTY DiaChi.soNha STRING;
CREATE PROPERTY DiaChi.duong STRING;
CREATE PROPERTY DiaChi.phuong STRING;
CREATE PROPERTY DiaChi.quan STRING;
CREATE PROPERTY DiaChi.thanhPho STRING;

CREATE CLASS LienHe;
CREATE PROPERTY LienHe.nguoiLienHe STRING;
CREATE PROPERTY LienHe.sdt STRING;
CREATE PROPERTY LienHe.email STRING;





-- ========== 1. NHÀ CUNG CẤP ==========

CREATE CLASS NhaCungCap EXTENDS V;
CREATE PROPERTY NhaCungCap.maNCC STRING;
CREATE PROPERTY NhaCungCap.tenNCC STRING;
CREATE PROPERTY NhaCungCap.diaChi EMBEDDED DiaChi;
CREATE PROPERTY NhaCungCap.lienHe EMBEDDED LienHe;
CREATE PROPERTY NhaCungCap.trangThai STRING; -- 'hoạt_động', 'ngừng_hợp_tác'
CREATE PROPERTY NhaCungCap.ngayHopTac DATE;
CREATE INDEX NhaCungCap.maNCC UNIQUE;

CREATE CLASS ThongTinCungUng;
CREATE PROPERTY ThongTinCungUng.nhaCungCap LINK NhaCungCap;
CREATE PROPERTY ThongTinCungUng.giaNhap DOUBLE;
CREATE PROPERTY ThongTinCungUng.thoiGianCapNhat DATETIME;

-- ========== 2. DANH MỤC VÀ SẢN PHẨM ==========
-- Loại Hàng (Ví dụ: Thực phẩm tươi, Thực phẩm đông lạnh, Hàng khô FMCG)
CREATE CLASS LoaiHang;
CREATE PROPERTY LoaiHang.maLoai STRING;
CREATE PROPERTY LoaiHang.tenLoai STRING;
CREATE PROPERTY LoaiHang.moTa STRING;
CREATE PROPERTY LoaiHang.YC_NhietDo STRING; -- Yêu cầu nhiệt độ lưu trữ (VD: 'Lạnh 0-5C', 'Đông -18C', 'Nhiệt độ phòng')
CREATE PROPERTY LoaiHang.YC_Khac STRING;    -- Yêu cầu kỹ thuật khác (VD: 'Tránh ẩm', 'Tránh ánh sáng')
CREATE INDEX LoaiHang.maLoai UNIQUE;


CREATE CLASS DanhMuc;
CREATE PROPERTY DanhMuc.maDanhMuc STRING;
CREATE PROPERTY DanhMuc.tenDanhMuc STRING;
CREATE PROPERTY DanhMuc.moTa STRING;
CREATE INDEX DanhMuc.maDanhMuc UNIQUE;

CREATE CLASS SanPham;
CREATE PROPERTY SanPham.maSP STRING;
CREATE PROPERTY SanPham.tenSP STRING;
CREATE PROPERTY SanPham.danhMuc LINK DanhMuc;
CREATE PROPERTY SanPham.loaiHang LINK LoaiHang;
CREATE PROPERTY SanPham.donViTinh STRING;
CREATE PROPERTY SanPham.giaBan DOUBLE;
CREATE PROPERTY SanPham.cungUng EMBEDDEDLIST ThongTinCungUng;
CREATE INDEX SanPham.maSP UNIQUE;





-- ========== 3. NHÂN VIÊN & TÀI XẾ ==========

CREATE CLASS NhanVien EXTENDS V;
CREATE PROPERTY NhanVien.maNV STRING;
CREATE PROPERTY NhanVien.hoTen STRING;
CREATE PROPERTY NhanVien.chucVu STRING;
CREATE PROPERTY NhanVien.boPhan STRING;
CREATE PROPERTY NhanVien.ngayVaoLam DATE;
CREATE PROPERTY NhanVien.lienHe EMBEDDED LienHe;
CREATE PROPERTY NhanVien.trangThai STRING; -- 'đang_làm_việc', 'nghỉ_việc'
CREATE INDEX NhanVien.maNV UNIQUE;

CREATE CLASS TaiXe EXTENDS NhanVien ;
CREATE PROPERTY TaiXe.soGPLX STRING;
CREATE PROPERTY TaiXe.loaiXe STRING;


-- dùng quan hệ đồ thị (graph model)biểu diễn quan hệ “làm việc tại đâu”:
CREATE CLASS LAM_VIEC_TAI EXTENDS E;

CREATE CLASS XeTai EXTENDS V;

CREATE PROPERTY XeTai.maXe STRING;                -- Mã định danh xe (vd: XE01)
CREATE PROPERTY XeTai.bienSo STRING;              -- Biển số xe
CREATE PROPERTY XeTai.hangXe STRING;              -- Hãng xe (vd: Hino, Isuzu,...)
CREATE PROPERTY XeTai.taiTrong DOUBLE;            -- Tải trọng tối đa (tấn)
CREATE PROPERTY XeTai.tinhTrang STRING;           -- 'hoạt_động', 'bảo_trì', 'ngưng_sử_dụng'
CREATE PROPERTY XeTai.taiXeChinh LINK TaiXe;      -- (tuỳ chọn) tài xế được phân cố định
CREATE PROPERTY XeTai.ghiChu STRING;
CREATE PROPERTY XeTai.viTriHienTai STRING;
CREATE PROPERTY XeTai.kinhDo DOUBLE;
CREATE PROPERTY XeTai.viDo DOUBLE;
CREATE PROPERTY XeTai.khoHienTai LINK Kho;

CREATE INDEX XeTai.maXe UNIQUE;

-- Khi xe đang đỗ tại kho
UPDATE XeTai SET viTriHienTai='Kho Vùng Đông Sài Gòn', khoHienTai=(SELECT FROM Kho WHERE maKho='KHO-V001'), tinhTrang='san_sang' WHERE maXe='XE01';

-- Khi xe đang di chuyển
UPDATE XeTai SET viTriHienTai='Đang vận chuyển đến CN-002', khoHienTai=NULL, tinhTrang='dang_van_chuyen' WHERE maXe='XE02';




-- ========== 4. KHO & KHU KHO ==========


CREATE CLASS Kho EXTENDS V;
CREATE PROPERTY Kho.maKho STRING;
CREATE PROPERTY Kho.tenKho STRING;
CREATE PROPERTY Kho.loaiKho STRING; -- 'kho_chinh', 'kho_vung', 'kho_hau_can'
CREATE PROPERTY Kho.diaChi EMBEDDED DiaChi;
CREATE PROPERTY Kho.kinhDo DOUBLE;
CREATE PROPERTY Kho.viDo DOUBLE;
CREATE PROPERTY Kho.dungTich DOUBLE;
CREATE PROPERTY Kho.trangThai STRING; -- 'hoạt_động', 'bảo_trì', 'đầy'
CREATE INDEX Kho.maKho UNIQUE;

CREATE CLASS KhuKho;
CREATE PROPERTY KhuKho.maKhu STRING;
CREATE PROPERTY KhuKho.tenKhu STRING;
CREATE PROPERTY KhuKho.loaiHang LINK LoaiHang;
CREATE PROPERTY KhuKho.dungTich DOUBLE;
CREATE PROPERTY KhuKho.nhietDo DOUBLE;
CREATE PROPERTY KhuKho.trangThai STRING;
CREATE PROPERTY KhuKho.kho LINK Kho;
CREATE INDEX KhuKho.maKhu UNIQUE;


-- ========== 5. CHI NHÁNH ==========

CREATE CLASS ChiNhanh EXTENDS V;
CREATE PROPERTY ChiNhanh.maChiNhanh STRING;
CREATE PROPERTY ChiNhanh.tenChiNhanh STRING;
CREATE PROPERTY ChiNhanh.diaChi EMBEDDED DiaChi;
CREATE PROPERTY ChiNhanh.lienHe EMBEDDED LienHe;
CREATE PROPERTY ChiNhanh.quanLy LINK NhanVien;
CREATE PROPERTY ChiNhanh.kinhDo DOUBLE;
CREATE PROPERTY ChiNhanh.viDo DOUBLE;
CREATE PROPERTY ChiNhanh.trangThai STRING; -- 'hoạt_động', 'đóng_cửa'
CREATE INDEX ChiNhanh.maChiNhanh UNIQUE;

CREATE CLASS ChiNhanh_SP EXTENDS E;
CREATE PROPERTY ChiNhanh_SP.trangThai STRING; -- 'còn_hàng', 'hết_hàng', 'ngưng_kinh_doanh'


CREATE CLASS TuyenDuong;
CREATE PROPERTY TuyenDuong.maTuyen STRING;
CREATE PROPERTY TuyenDuong.diemDi LINK Kho;
CREATE PROPERTY TuyenDuong.diemDen LINK ChiNhanh;
CREATE PROPERTY TuyenDuong.cacDiemQua EMBEDDEDLIST STRING; -- danh sách mã kho trung gian
CREATE PROPERTY TuyenDuong.tongKhoangCach DOUBLE;
CREATE PROPERTY TuyenDuong.thoiGianDuKien DOUBLE;
CREATE PROPERTY TuyenDuong.trangThai STRING; -- 'hoạt_động', 'tạm_ngưng'
CREATE INDEX TuyenDuong.maTuyen UNIQUE;

CREATE CLASS VanChuyen;
CREATE PROPERTY VanChuyen.maVanChuyen STRING;
CREATE PROPERTY VanChuyen.taiXe LINK TaiXe;
CREATE PROPERTY VanChuyen.xeTai LINK XeTai;
CREATE PROPERTY VanChuyen.tuyenDuong LINK TuyenDuong;
CREATE PROPERTY VanChuyen.ngayKhoiHanh DATE;
CREATE PROPERTY VanChuyen.ngayDen DATE;
CREATE PROPERTY VanChuyen.trangThai STRING;
CREATE PROPERTY VanChuyen.diemDi STRING;
CREATE PROPERTY VanChuyen.diemDen STRING;


-- ========== 6. LÔ HÀNG ==========

CREATE CLASS LoHang EXTENDS V;
CREATE PROPERTY LoHang.maLo STRING;
CREATE PROPERTY LoHang.sanPham LINK SanPham;
CREATE PROPERTY LoHang.ngaySanXuat DATE;
CREATE PROPERTY LoHang.hanSuDung DATE;
CREATE PROPERTY LoHang.soLuong INTEGER;
CREATE PROPERTY LoHang.trangThai STRING; -- 'còn_hạn', 'cận_date', 'hết_hạn'
CREATE INDEX LoHang.maLo UNIQUE;

CREATE CLASS Loctate_in EXTENDS E; -- lô hàng đang ở đâu kho / chi nhanh

-- ========== 7. TỒN KHO ==========

CREATE CLASS TonKho EXTENDS V;
CREATE PROPERTY TonKho.diaDiem LINK; -- kho / chi nhanh
CREATE PROPERTY TonKho.sanPham LINK SanPham;
CREATE PROPERTY TonKho.soLuong INTEGER;
CREATE PROPERTY TonKho.reorder_point INTEGER;  -- ngưỡng để đặt hàng
CREATE PROPERTY TonKho.max_stock_level INTEGER;   -- sức chứa tối đa
CREATE PROPERTY TonKho.order_frequency STRING;  -- 'hàng_ngày', 'hàng_tuần', 'hàng_tháng', NULL
CREATE PROPERTY TonKho.trangThai STRING;       -- 'ổn_định', 'thiếu_hàng'
CREATE INDEX TonKho.Kho_sanPham ON TonKho (diaDiem, sanPham) UNIQUE;


-- ========== 8. CHI TIẾT PHIẾU ==========

CREATE CLASS ChiTietPhieu;
CREATE PROPERTY ChiTietPhieu.sanPham LINK SanPham;
CREATE PROPERTY ChiTietPhieu.soLuong INTEGER;
CREATE PROPERTY ChiTietPhieu.donGia DOUBLE;
CREATE PROPERTY ChiTietPhieu.loHang LINK LoHang;
CREATE PROPERTY ChiTietPhieu.thanhTien DOUBLE;

-- ========== 9. ĐƠN ĐẶT HÀNG ==========

CREATE CLASS DonDatHang;
CREATE PROPERTY DonDatHang.maDon STRING;
CREATE PROPERTY DonDatHang.ngayLap DATE;
CREATE PROPERTY DonDatHang.ngayGiaoDuKien DATE;
CREATE PROPERTY DonDatHang.trangThai STRING; -- 'đang_xử_lý', 'đã_giao', 'hủy'
CREATE PROPERTY DonDatHang.khoDat LINK Kho;
CREATE PROPERTY DonDatHang.khoNhan LINK Kho;
CREATE PROPERTY DonDatHang.nhaCungCap LINK NhaCungCap;
CREATE PROPERTY DonDatHang.tongTien DOUBLE;
CREATE PROPERTY DonDatHang.chiTiet EMBEDDEDLIST ChiTietPhieu;
CREATE INDEX DonDatHang.maDon UNIQUE;





-- ========== 10. CÁC PHIẾU NHẬP/XUẤT/HOÀN ==========

CREATE CLASS PhieuNhap;
CREATE PROPERTY PhieuNhap.maPhieu STRING;
CREATE PROPERTY PhieuNhap.ngayNhap DATE;
CREATE PROPERTY PhieuNhap.kho LINK Kho;
CREATE PROPERTY PhieuNhap.chiTiet EMBEDDEDLIST ChiTietPhieu;
CREATE PROPERTY PhieuNhap.ghiChu STRING;
CREATE INDEX PhieuNhap.maPhieu UNIQUE;

CREATE CLASS PhieuXuat;
CREATE PROPERTY PhieuXuat.maPhieu STRING;
CREATE PROPERTY PhieuXuat.ngayXuat DATE;
CREATE PROPERTY PhieuXuat.kho LINK Kho;
CREATE PROPERTY PhieuXuat.chiTiet EMBEDDEDLIST ChiTietPhieu;
CREATE PROPERTY PhieuXuat.xuatDen LINK Kho;
CREATE PROPERTY PhieuXuat.ghiChu STRING;
CREATE INDEX PhieuXuat.maPhieu UNIQUE;

CREATE CLASS PhieuHoan;
CREATE PROPERTY PhieuHoan.maPhieu STRING;
CREATE PROPERTY PhieuHoan.ngayHoan DATE;
CREATE PROPERTY PhieuHoan.khoHoan LINK Kho;
CREATE PROPERTY PhieuHoan.hoanVe LINK Kho;
CREATE PROPERTY PhieuHoan.chiTiet EMBEDDEDLIST ChiTietPhieu;
CREATE PROPERTY PhieuHoan.ghiChu STRING;
CREATE INDEX PhieuHoan.maPhieu UNIQUE;

-- ========== 11. HÓA ĐƠN MUA HÀNG ==========
CREATE CLASS HoaDonMua;

CREATE PROPERTY HoaDonMua.maHoaDon STRING;
CREATE PROPERTY HoaDonMua.ngayLap DATE;
CREATE PROPERTY HoaDonMua.nhaCungCap LINK NhaCungCap;
CREATE PROPERTY HoaDonMua.phieuNhap LINK PhieuNhap;   -- liên kết phiếu nhập kho
CREATE PROPERTY HoaDonMua.chiTiet EMBEDDEDLIST ChiTietPhieu; -- danh sách sản phẩm, số lượng, đơn giá
CREATE PROPERTY HoaDonMua.tongTien DOUBLE;
CREATE PROPERTY HoaDonMua.thueVAT DOUBLE;         -- phần trăm hoặc số tiền VAT
CREATE PROPERTY HoaDonMua.giamGia DOUBLE;         -- giảm giá toàn hóa đơn (nếu có)
CREATE PROPERTY HoaDonMua.tongThanhToan DOUBLE;   -- tổng tiền sau thuế, sau giảm giá
CREATE PROPERTY HoaDonMua.trangThai STRING;       -- 'chua_thanh_toan', 'da_thanh_toan', 'mot_phan'
CREATE PROPERTY HoaDonMua.hinhThucThanhToan STRING;  -- 'chuyen_khoan', 'tien_mat', 'ghi_no'
CREATE PROPERTY HoaDonMua.ghiChu STRING;

CREATE INDEX HoaDonMua.maHoaDon UNIQUE;


-- ========== 12. HỢP ĐỒNG ==========
CREATE CLASS HopDong ;
CREATE PROPERTY HopDong.maHopDong STRING;
CREATE PROPERTY HopDong.nhaCungCap LINK NhaCungCap;
CREATE PROPERTY HopDong.ngayKy DATE;
CREATE PROPERTY HopDong.ngayHetHan DATE;
CREATE PROPERTY HopDong.giaTri DOUBLE;
CREATE PROPERTY HopDong.trangThai STRING;     -- 'hieu_luc', 'het_han', 'tam_dung'

-- Dữ liệu phi cấu trúc (ví dụ metadata hoặc file đính kèm)
CREATE PROPERTY HopDong.noiDung EMBEDDEDMAP;  -- linh hoạt: có thể chứa json metadata
CREATE PROPERTY HopDong.fileDinhKem EMBEDDEDLIST;  -- danh sách file hoặc link lưu trong hệ thống lưu trữ (GridFS, S3, v.v.)


-- ========== 13. BÁO CÁO ==========
CREATE CLASS BaoCao;

CREATE PROPERTY BaoCao.maBaoCao STRING;
CREATE PROPERTY BaoCao.loaiBaoCao STRING;   -- 'doanh_thu', 'ton_kho', 'van_chuyen', ...
CREATE PROPERTY BaoCao.thoiGianLap DATETIME;
CREATE PROPERTY BaoCao.nguoiLap LINK NhanVien;
CREATE PROPERTY BaoCao.doiTuongLienQuan LINK;  -- có thể link tới ChiNhanh, Kho, hoặc NCC
CREATE PROPERTY BaoCao.duLieu EMBEDDEDLIST;    -- danh sách kết quả (semi-structured JSON)
CREATE PROPERTY BaoCao.ghiChu STRING;


-- ========== 14. QUAN HỆ ĐỒ THỊ (CÁC CẠNH - EDGE) ==========

-- NCC → Kho
CREATE CLASS SHIPS_TO EXTENDS E;
CREATE PROPERTY SHIPS_TO.khoangCach DOUBLE;
CREATE PROPERTY SHIPS_TO.thoiGianCho DOUBLE; -- TÍNH BẰNG GIỜ
CREATE PROPERTY SHIPS_TO.trangThai STRING;
CREATE PROPERTY SHIPS_TO.phiVanChuyen DOUBLE;
CREATE PROPERTY SHIPS_TO.tanSuat STRING; -- 'hằng ngày', ....

-- Kho chính → Kho vùng
CREATE CLASS PhanPhoi EXTENDS E;
CREATE PROPERTY PhanPhoi.khoangCach DOUBLE;
CREATE PROPERTY PhanPhoi.thoiGian DOUBLE;
CREATE PROPERTY PhanPhoi.trangThai STRING;


