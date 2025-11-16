const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
// Enable CORS with credentials support and echoing origin so frontend can
// send requests with credentials (cookies) safely.
app.use(
	cors({
		origin: true, // reflect request origin
		credentials: true,
	})
);
app.use(express.json());

// Import route API
app.use('/api', require('./routes/api'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server đang chạy ở cổng ${PORT}`));
