import express, { Application } from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import winston from 'winston';
import http from 'http';
import { Server } from 'socket.io';
import voiceRoutes from './routes/voiceRoutes';

// Load environment variables
dotenv.config();

// Create an Express app
const app: Application = express();

// Set port from environment variable or default to 3000
const port = process.env.PORT || 3000;

// Middleware configuration
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Create HTTP server
const server = http.createServer(app);

// Integrate Socket.IO
const io = new Server(server);

// Voice routes
app.use('/api/voice', voiceRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Twilio Voice Integration in TypeScript');
});

// Start server
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

