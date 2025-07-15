import express from 'express';
import {
  handleInboundCall,
  handleRecording,
  handleTranscription,
} from '../controllers/voiceController';

const router = express.Router();

// Route for handling incoming voice calls from Twilio
router.post('/webhook', handleInboundCall);

// Route for handling call recordings
router.post('/webhook/recording', handleRecording);

// Route for handling transcriptions
router.post('/webhook/transcription', handleTranscription);

export default router;
