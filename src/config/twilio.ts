import twilio from 'twilio';
import dotenv from 'dotenv';
import logger from '../utils/logger';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Export configuration
export const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID!,
  authToken: process.env.TWILIO_AUTH_TOKEN!,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER!,
  apiKey: process.env.TWILIO_API_KEY,
  apiSecret: process.env.TWILIO_API_SECRET,
  twimlAppSid: process.env.TWILIO_TWIML_APP_SID,
  webhookBaseUrl: process.env.WEBHOOK_BASE_URL || 'http://localhost:3000',
  voiceWebhookUrl: process.env.VOICE_WEBHOOK_URL || `${process.env.WEBHOOK_BASE_URL}/api/voice/webhook`,
  statusCallbackUrl: process.env.STATUS_CALLBACK_URL || `${process.env.WEBHOOK_BASE_URL}/api/voice/status`,
};

// Export Twilio client
export default twilioClient;
