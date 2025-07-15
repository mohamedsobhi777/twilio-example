import { Request, Response } from 'express';
import twilioClient, { twilioConfig } from '../config/twilio';
import { twiml } from 'twilio';
import logger from '../utils/logger';
import { APIResponse, CallDirection, TwilioWebhookRequest } from '../types';

// Handle inbound voice calls
export const handleInboundCall = async (
  req: TwilioWebhookRequest,
  res: Response
): Promise<void> => {
  try {
    const { From, To, CallSid } = req.body;
    logger.info(`Inbound call from ${From} to ${To}. Call SID: ${CallSid}`);

    const response = new twiml.VoiceResponse();
    response.say('Thank you for calling. Please leave a message after the beep.');

    response.record({
      maxLength: 30,
      action: `${twilioConfig.voiceWebhookUrl}/recording`,
      transcribeCallback: `${twilioConfig.voiceWebhookUrl}/transcription`,
    });

    res.type('text/xml').send(response.toString());
  } catch (error) {
    logger.error(`Error handling inbound call: ${error}`);
    res.status(500).json(<APIResponse>{ success: false, error: 'Internal Server Error' });
  }
};

// Handle call recording
export const handleRecording = async (req: TwilioWebhookRequest, res: Response): Promise<void> => {
  try {
    const { RecordingUrl, RecordingSid } = req.body;
    logger.info(`Recording completed. Recording SID: ${RecordingSid}, URL: ${RecordingUrl}`);

    // Respond with empty TwiML
    const response = new twiml.VoiceResponse();
    res.type('text/xml').send(response.toString());
  } catch (error) {
    logger.error(`Error handling recording: ${error}`);
    res.status(500).json(<APIResponse>{ success: false, error: 'Internal Server Error' });
  }
};

// Handle transcription
export const handleTranscription = async (req: TwilioWebhookRequest, res: Response): Promise<void> => {
  try {
    const { TranscriptionText } = req.body;
    logger.info(`Transcription received: ${TranscriptionText}`);

    // Respond with empty TwiML
    const response = new twiml.VoiceResponse();
    res.type('text/xml').send(response.toString());
  } catch (error) {
    logger.error(`Error handling transcription: ${error}`);
    res.status(500).json(<APIResponse>{ success: false, error: 'Internal Server Error' });
  }
};
