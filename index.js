import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors'; // Import CORS middleware
import cookieParser from 'cookie-parser';
import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import listingRouter from './routes/listing.route.js';

dotenv.config();

// Menghubungkan ke MongoDB dengan timeout dan pengaturan baru
mongoose.connect(process.env.MONGO, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Batasi waktu tunggu untuk koneksi MongoDB
})
  .then(() => console.log('Connected to MongoDB!'))
  .catch(err => console.error('MongoDB connection error:', err));

const app = express();

// Middleware untuk logging setiap request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Middleware untuk mengatur batas waktu request (timeout)
app.use((req, res, next) => {
  req.setTimeout(10000); // Timeout 10 detik
  res.setTimeout(10000); // Timeout 10 detik untuk response
  next();
});

// Konfigurasi CORS
const allowedOrigins = ['http://localhost:5173', 'https://homelyft.vercel.app'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // Izinkan penggunaan cookies
}));

// Middleware untuk parsing JSON body dan cookies
app.use(express.json());
app.use(cookieParser());

// Definisikan API Routes
app.use('/api/user', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/listing', listingRouter);

// Middleware untuk menangani error dengan logging detail
app.use((err, req, res, next) => {
  console.error('Error stack:', err.stack); // Log detail error
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

// Port dinamis untuk server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API server is running on port ${PORT}!`);
});
