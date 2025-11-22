var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
// ...existing code...

// ✅ Thêm PhieuXuat (đơn giản, không ánh xạ chi tiết phức tạp)
router.post('/phieuxuat', (req, res) => {
  try {
    const { maPhieu, ngayXuat, kho, xuatDen, ghiChu } = req.body;
    const safe = s => (s ? s.replace(/'/g, "\\'") : '');
    const query = `
      INSERT INTO PhieuXuat SET
        maPhieu='${safe(maPhieu)}',
        ${ngayXuat ? `ngayXuat=DATE('${safe(ngayXuat)}','yyyy-MM-dd'),` : ''}
        ${kho ? `kho=(SELECT FROM Kho WHERE maKho='${safe(kho)}'),` : ''}
        ${xuatDen ? `xuatDen=(SELECT FROM Kho WHERE maKho='${safe(xuatDen)}'),` : ''}
        ghiChu='${safe(ghiChu || '')}'
    `.replace(/,\s*$/, '');
    queryOrientDB(query, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Thêm DonDatHang (cơ bản)
router.post('/dondathang', (req, res) => {
  try {
    const { maDon, ngayLap, nhaCungCap, khoDat } = req.body;
    const safe = s => (s ? s.replace(/'/g, "\\'") : '');
    const query = `
      INSERT INTO DonDatHang SET
        maDon='${safe(maDon)}',
        ${ngayLap ? `ngayLap=DATE('${safe(ngayLap)}','yyyy-MM-dd'),` : ''}
        ${nhaCungCap ? `nhaCungCap=(SELECT FROM NhaCungCap WHERE maNCC='${safe(nhaCungCap)}'),` : ''}
        ${khoDat ? `khoDat=(SELECT FROM Kho WHERE maKho='${safe(khoDat)}'),` : ''}
        trangThai='đang_xử_lý'
    `.replace(/,\s*$/, '');
    queryOrientDB(query, res);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ...existing code...
module.exports = app;
