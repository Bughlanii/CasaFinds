/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LanguageCode = 'EN' | 'ES';

export type PinStatus = 'queued' | 'scheduled' | 'publishing' | 'published' | 'failed';

export type AccessTier = 'trial' | 'standard';

export interface Board {
  id: string;
  name: string;
  description: string;
  pin_count?: number;
  language: LanguageCode;
  privacy: 'PUBLIC' | 'PROTECTED' | 'SECRET';
}

export interface PinItem {
  id: string;
  batch_id: string;
  title: string;
  description: string;
  hashtags: string[];
  image_url: string;
  image_width?: number;
  image_height?: number;
  product_url: string;
  affiliate_link: string;
  board_id: string;
  board_name?: string;
  language: LanguageCode;
  status: PinStatus;
  scheduled_at?: string;
  published_at?: string;
  pin_id?: string;
  pin_url?: string;
  error?: string;
  created_at: string;
}

export interface Batch {
  id: string;
  name: string;
  total_pins: number;
  approved: boolean;
  imported_at: string;
  language_breakdown: {
    EN: number;
    ES: number;
  };
  pins: PinItem[];
}

export interface PublishLog {
  id: string;
  pin_id: string;
  pin_title: string;
  board_name: string;
  board_id: string;
  language: LanguageCode;
  attempted_at: string;
  status: 'published' | 'failed' | 'refreshed';
  http_status: number;
  pin_url?: string;
  error?: string;
  media_id?: string;
  tier: AccessTier;
}

export interface AppSettings {
  store_id: string; // confirmed 'casafinds090-20'
  daily_cap: number; // default ramp 10 -> up to 50
  account_age_days: number; // for ramp calculation
  posting_window_start: string; // e.g. "20:00" (8 PM)
  posting_window_end: string; // e.g. "23:00" (11 PM)
  timezone: string; // 'America/New_York'
  access_tier: AccessTier; // 'trial' vs 'standard'
  client_id: string;
  redirect_uri: string;
  auto_scheduler_enabled: boolean;
  min_spacing_minutes: number;
  max_spacing_minutes: number;
}

export interface AuthState {
  connected: boolean;
  username: string;
  account_id: string;
  profile_image: string;
  access_token_masked: string;
  refresh_token_masked: string;
  token_expires_at: string;
  last_refreshed_at: string;
  scope: string[];
  access_tier: AccessTier;
}

export interface PublishProgressState {
  isPublishing: boolean;
  currentStep: 'idle' | 'upload_media_init' | 'upload_s3' | 'poll_media' | 'create_pin' | 'verify_pin' | 'complete' | 'error';
  stepMessage: string;
  pinId?: string;
  pinTitle?: string;
  error?: string;
}
