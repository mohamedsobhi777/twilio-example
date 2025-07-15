import twilioClient, { twilioConfig } from '../config/twilio';
import { twiml } from 'twilio';
import logger from '../utils/logger';
import {
  OutboundCallOptions,
  CallRecord,
  IVRMenuOption,
  ConferenceOptions,
  SMSOptions,
} from '../types';

class TwilioVoiceService {
  /**
   * Make an outbound call
   */
  async makeCall(options: OutboundCallOptions): Promise<any> {
    try {
      const callOptions = {
        to: options.to,
        from: options.from || twilioConfig.phoneNumber,
        url: options.url || `${twilioConfig.webhookBaseUrl}/api/voice/outbound`,
        statusCallback: options.statusCallback || twilioConfig.statusCallbackUrl,
        statusCallbackMethod: options.statusCallbackMethod || 'POST',
        statusCallbackEvent: options.statusCallbackEvent || ['initiated', 'answered', 'completed'],
        record: options.record || false,
        recordingStatusCallback: options.recordingStatusCallback,
        recordingChannels: options.recordingChannels || 'mono',
        timeout: options.timeout || 60,
        machineDetection: options.machineDetection,
        machineDetectionTimeout: options.machineDetectionTimeout,
      };

      const call = await twilioClient.calls.create(callOptions);
      logger.info(`Outbound call initiated. Call SID: ${call.sid}`);
      return call;
    } catch (error) {
      logger.error(`Error making outbound call: ${error}`);
      throw error;
    }
  }

  /**
   * Get call details
   */
  async getCallDetails(callSid: string): Promise<any> {
    try {
      const call = await twilioClient.calls(callSid).fetch();
      return call;
    } catch (error) {
      logger.error(`Error fetching call details: ${error}`);
      throw error;
    }
  }

  /**
   * End a call
   */
  async endCall(callSid: string): Promise<any> {
    try {
      const call = await twilioClient.calls(callSid).update({ status: 'completed' });
      logger.info(`Call ended. Call SID: ${callSid}`);
      return call;
    } catch (error) {
      logger.error(`Error ending call: ${error}`);
      throw error;
    }
  }

  /**
   * Get recordings for a call
   */
  async getCallRecordings(callSid: string): Promise<any[]> {
    try {
      const recordings = await twilioClient.recordings.list({ callSid, limit: 20 });
      return recordings;
    } catch (error) {
      logger.error(`Error fetching call recordings: ${error}`);
      throw error;
    }
  }

  /**
   * Delete a recording
   */
  async deleteRecording(recordingSid: string): Promise<void> {
    try {
      await twilioClient.recordings(recordingSid).remove();
      logger.info(`Recording deleted. Recording SID: ${recordingSid}`);
    } catch (error) {
      logger.error(`Error deleting recording: ${error}`);
      throw error;
    }
  }

  /**
   * Create an IVR menu
   */
  createIVRMenu(greeting: string, options: IVRMenuOption[]): twiml.VoiceResponse {
    const response = new twiml.VoiceResponse();
    
    const gather = response.gather({
      numDigits: 1,
      action: `${twilioConfig.webhookBaseUrl}/api/voice/ivr-response`,
      method: 'POST',
    });

    // Build menu prompt
    let menuPrompt = greeting + ' ';
    options.forEach((option) => {
      menuPrompt += `Press ${option.digit} for ${option.description}. `;
    });

    gather.say(menuPrompt);

    // If no input, repeat the menu
    response.redirect(`${twilioConfig.webhookBaseUrl}/api/voice/ivr-menu`);

    return response;
  }

  /**
   * Create a conference
   */
  createConference(options: ConferenceOptions): twiml.VoiceResponse {
    const response = new twiml.VoiceResponse();
    
    const dial = response.dial();
    
    const conference = dial.conference({
      startConferenceOnEnter: options.startConferenceOnEnter ?? true,
      endConferenceOnExit: options.endConferenceOnExit ?? false,
      waitUrl: options.waitUrl,
      maxParticipants: options.maxParticipants || 250,
      record: options.record ? 'record-from-start' : 'do-not-record',
      muted: options.muted || false,
      beep: options.beep || true,
      statusCallback: options.statusCallback,
      statusCallbackEvent: options.statusCallbackEvent || ['start', 'end', 'join', 'leave'],
    });

    conference.text = options.name;

    return response;
  }

  /**
   * Send SMS notification
   */
  async sendSMS(options: SMSOptions): Promise<any> {
    try {
      const message = await twilioClient.messages.create({
        to: options.to,
        from: options.from || twilioConfig.phoneNumber,
        body: options.body,
        mediaUrl: options.mediaUrl,
        statusCallback: options.statusCallback,
      });

      logger.info(`SMS sent. Message SID: ${message.sid}`);
      return message;
    } catch (error) {
      logger.error(`Error sending SMS: ${error}`);
      throw error;
    }
  }

  /**
   * Get call history
   */
  async getCallHistory(options: {
    to?: string;
    from?: string;
    startTime?: Date;
    endTime?: Date;
    limit?: number;
  }): Promise<any[]> {
    try {
      const filterOptions: any = {
        limit: options.limit || 50,
      };

      if (options.to) filterOptions.to = options.to;
      if (options.from) filterOptions.from = options.from;
      if (options.startTime) filterOptions.startTimeAfter = options.startTime;
      if (options.endTime) filterOptions.startTimeBefore = options.endTime;

      const calls = await twilioClient.calls.list(filterOptions);
      return calls;
    } catch (error) {
      logger.error(`Error fetching call history: ${error}`);
      throw error;
    }
  }

  /**
   * Transfer a call
   */
  transferCall(to: string, message?: string): twiml.VoiceResponse {
    const response = new twiml.VoiceResponse();
    
    if (message) {
      response.say(message);
    }

    response.dial(to);

    return response;
  }

  /**
   * Put call on hold with music
   */
  holdCall(holdMusic?: string): twiml.VoiceResponse {
    const response = new twiml.VoiceResponse();
    
    response.play({
      loop: 0,
    }, holdMusic || 'http://com.twilio.sounds.music.s3.amazonaws.com/WeAreYoung.mp3');

    return response;
  }

  /**
   * Create voicemail system
   */
  createVoicemail(greeting: string, maxLength: number = 120): twiml.VoiceResponse {
    const response = new twiml.VoiceResponse();
    
    response.say(greeting);
    
    response.record({
      maxLength,
      action: `${twilioConfig.webhookBaseUrl}/api/voice/voicemail-complete`,
      transcribe: true,
      transcribeCallback: `${twilioConfig.webhookBaseUrl}/api/voice/voicemail-transcription`,
    });

    return response;
  }
}

export default new TwilioVoiceService();
