import { Request } from 'express';

// Call status types
export enum CallStatus {
  QUEUED = 'queued',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled'
}

// Call direction types
export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND_API = 'outbound-api',
  OUTBOUND_DIAL = 'outbound-dial'
}

// Recording status types
export enum RecordingStatus {
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

// Call record interface
export interface CallRecord {
  callSid: string;
  from: string;
  to: string;
  direction: CallDirection;
  status: CallStatus;
  duration?: number;
  startTime: Date;
  endTime?: Date;
  recordingUrl?: string;
  transcription?: string;
  price?: number;
  priceUnit?: string;
}

// Webhook request interface
export interface TwilioWebhookRequest extends Request {
  body: {
    CallSid: string;
    From: string;
    To: string;
    CallStatus: string;
    Direction: string;
    AccountSid: string;
    ApiVersion?: string;
    CallerName?: string;
    CallDuration?: string;
    RecordingUrl?: string;
    RecordingSid?: string;
    RecordingStatus?: string;
    TranscriptionText?: string;
    Digits?: string;
    SpeechResult?: string;
    Confidence?: string;
  };
}

// Outbound call options
export interface OutboundCallOptions {
  to: string;
  from?: string;
  url?: string;
  statusCallback?: string;
  statusCallbackMethod?: 'GET' | 'POST';
  statusCallbackEvent?: string[];
  record?: boolean;
  recordingStatusCallback?: string;
  recordingChannels?: 'mono' | 'dual';
  trim?: 'trim-silence' | 'do-not-trim';
  callerId?: string;
  timeout?: number;
  machineDetection?: 'Enable' | 'DetectMessageEnd';
  machineDetectionTimeout?: number;
  sipAuthUsername?: string;
  sipAuthPassword?: string;
}

// IVR menu options
export interface IVRMenuOption {
  digit: string;
  action: string;
  description: string;
  handler?: (request: TwilioWebhookRequest) => Promise<string>;
}

// Conference options
export interface ConferenceOptions {
  name: string;
  startConferenceOnEnter?: boolean;
  endConferenceOnExit?: boolean;
  waitUrl?: string;
  maxParticipants?: number;
  record?: boolean;
  muted?: boolean;
  beep?: boolean | 'true' | 'false' | 'onEnter' | 'onExit';
  statusCallback?: string;
  statusCallbackEvent?: string[];
}

// SMS options (for notifications)
export interface SMSOptions {
  to: string;
  from?: string;
  body: string;
  mediaUrl?: string[];
  statusCallback?: string;
}

// WebSocket events
export interface CallEvent {
  type: 'call.new' | 'call.answered' | 'call.ended' | 'call.recording.completed';
  callSid: string;
  data: any;
  timestamp: Date;
}

// API response types
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Call analytics
export interface CallAnalytics {
  totalCalls: number;
  answeredCalls: number;
  missedCalls: number;
  averageDuration: number;
  totalCost: number;
  callsByHour: { [hour: string]: number };
  callsByDay: { [day: string]: number };
  topCallers: { number: string; count: number }[];
}
