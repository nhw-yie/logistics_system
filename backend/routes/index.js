var express = require('express');
var router = express.Router();
const db = require('../config/orientdb');

router.get('/test-db', async (req, res) => {
  try {
    const query = 'SELECT FROM NhaCungCap LIMIT 5';
    const response = await db.get(`/query/${process.env.ORIENTDB_DB_NAME}/sql/${encodeURIComponent(query)}`);
    res.json({
      message: '✅ Kết nối OrientDB thành công!',
      data: response.data.result
    });
  } catch (err) {
    res.status(500).json({
      message: '❌ Lỗi truy vấn OrientDB',
      error: err.message
    });
  }
});

module.exports = router;
