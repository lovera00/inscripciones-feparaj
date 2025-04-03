require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const registrationRoutes = require('./src/routes/registrationRoutes');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());
app.use(express.json());
//app.use(express.static('public'));

//hello world
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API Routes
app.use('/api', upload.fields([
  { name: 'payment_proof', maxCount: 1 },
  { name: 'federation_approval', maxCount: 1 }
]), registrationRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});