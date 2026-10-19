/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AppSettings, AuthState, Batch, Board, PinItem, PublishLog, PublishProgressState } from '../types';
import { BATCH_1_PINS, INITIAL_AUTH, INITIAL_BOARDS, INITIAL_LOGS, INITIAL_SETTINGS } from '../data/mockData';
import { alternateLanguages, calculateAllowedDailyCap, isWithinPostingWindow, validatePinRecord } from '../utils/rules';
import { PinterestClient } from './pinterestApi';

const STORAGE_KEYS = {
  SETTINGS: 'casafinds_settings_v2',
  AUTH: 'casafinds_auth_v2',
  BOARDS: 'casafinds_boards_v2',
  BATCHES: 'casafinds_batches_v2',
  QUEUE: 'casafinds_queue_v2',
  LOGS: 'casafinds_logs_v2',
};

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return { ...INITIAL_SETTINGS };
  }

  public saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  public getAuth(): AuthState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUTH);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return { ...INITIAL_AUTH };
  }

  public saveAuth(auth: AuthState): void {
    localStorage.setItem(STORAGE_KEYS.AUTH, JSON.stringify(auth));
  }

  public getBoards(): Board[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOARDS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return [...INITIAL_BOARDS];
  }

  public saveBoards(boards: Board[]): void {
    localStorage.setItem(STORAGE_KEYS.BOARDS, JSON.stringify(boards));
  }

  public getBatches(): Batch[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BATCHES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }

    // Default seed batch 1 (unapproved by default, so owner can test approving it!)
    const seedBatchId = 'batch-seed-01';
    const seedPins: PinItem[] = BATCH_1_PINS.map((p, idx) => ({
      ...p,
      id: `pin-batch1-${idx + 1}`,
      batch_id: seedBatchId,
      status: 'queued',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    }));

    const defaultBatches: Batch[] = [
      {
        id: seedBatchId,
        name: 'Batch 1 — Kitchen Gadgets & Essentials (10 EN + 10 ES)',
        total_pins: 20,
        approved: true, // Initially approved so queue is populated, but user can re-import or import new
        imported_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        language_breakdown: { EN: 10, ES: 10 },
        pins: seedPins,
      },
    ];

    this.saveBatches(defaultBatches);
    return defaultBatches;
  }

  public saveBatches(batches: Batch[]): void {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify(batches));
  }

  public getQueue(): PinItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUEUE);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }

    // Populate initial queue from approved Batch 1
    const batches = this.getBatches();
    const approvedBatch = batches.find((b) => b.approved);
    if (approvedBatch) {
      // Alternate languages and assign schedules
      const alternated = alternateLanguages(approvedBatch.pins);
      const scheduled = this.assignScheduleTimes(alternated);
      this.saveQueue(scheduled);
      return scheduled;
    }

    return [];
  }

  public saveQueue(queue: PinItem[]): void {
    localStorage.setItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
  }

  public getLogs(): PublishLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return [...INITIAL_LOGS];
  }

  public saveLogs(logs: PublishLog[]): void {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  }

  public addLog(log: Omit<PublishLog, 'id'>): PublishLog {
    const logs = this.getLogs();
    const newLog: PublishLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    logs.unshift(newLog);
    this.saveLogs(logs);
    return newLog;
  }

  /**
   * Assigns scheduled publish timestamps spaced inside the posting window (8 PM - 11 PM ET)
   */
  public assignScheduleTimes(pins: PinItem[]): PinItem[] {
    const settings = this.getSettings();
    const now = new Date();
    // Target today's 8:00 PM ET or next day's 8:00 PM ET
    const baseDate = new Date();
    baseDate.setHours(20, 0, 0, 0); // 8:00 PM

    // If already past 11 PM today, schedule for tomorrow
    if (now.getHours() >= 23) {
      baseDate.setDate(baseDate.getDate() + 1);
    }

    return pins.map((pin, index) => {
      // Space pins 12 to 18 minutes apart
      const minutesOffset = index * (settings.min_spacing_minutes + Math.floor(index % 3) * 2);
      const pinDate = new Date(baseDate.getTime() + minutesOffset * 60000);

      return {
        ...pin,
        status: pin.status === 'published' ? 'published' : 'scheduled',
        scheduled_at: pinDate.toISOString(),
      };
    });
  }

  /**
   * Approves a batch and puts pins into active queue
   */
  public approveBatch(batchId: string): void {
    const batches = this.getBatches();
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) return;

    batch.approved = true;
    this.saveBatches(batches);

    // Alternate languages per FR-05
    const alternated = alternateLanguages(batch.pins);
    const scheduled = this.assignScheduleTimes(alternated);

    const existingQueue = this.getQueue().filter((p) => p.status === 'published');
    const combined = [...existingQueue, ...scheduled];
    this.saveQueue(combined);
  }

  /**
   * Proactive token refresh per FR-09
   */
  public async refreshToken(): Promise<AuthState> {
    const auth = this.getAuth();
    const client = new PinterestClient(auth.access_tier, '1498302', '');
    const updated = await client.refreshToken(auth);
    const newAuth: AuthState = {
      ...auth,
      ...updated,
    };
    this.saveAuth(newAuth);

    this.addLog({
      pin_id: 'token-refresh',
      pin_title: 'Proactive Pinterest OAuth Token Refresh',
      board_name: 'System Maintenance',
      board_id: 'system',
      language: 'EN',
      attempted_at: new Date().toISOString(),
      status: 'refreshed',
      http_status: 200,
      tier: newAuth.access_tier,
    });

    return newAuth;
  }

  /**
   * Executes a publish tick on the next available queued pin (FR-06, FR-07)
   */
  public async executePublishTick(
    onProgress?: (progress: PublishProgressState) => void
  ): Promise<{ success: boolean; log: PublishLog; pin?: PinItem }> {
    const queue = this.getQueue();
    const settings = this.getSettings();
    const auth = this.getAuth();

    // Check ramp limit
    const allowedCap = calculateAllowedDailyCap(settings.account_age_days, settings.daily_cap);
    const logs = this.getLogs();
    const todayStr = new Date().toISOString().slice(0, 10);
    const publishedToday = logs.filter(
      (l) => l.status === 'published' && l.attempted_at.startsWith(todayStr)
    ).length;

    if (publishedToday >= allowedCap) {
      const err = `Daily cap reached for today (${publishedToday}/${allowedCap} pins under week ramp). Pacing enforced.`;
      if (onProgress) {
        onProgress({
          isPublishing: false,
          currentStep: 'error',
          stepMessage: err,
          error: err,
        });
      }
      throw new Error(err);
    }

    // Find next pin to publish
    const pinIndex = queue.findIndex((p) => p.status === 'queued' || p.status === 'scheduled');
    if (pinIndex === -1) {
      const err = 'No pins currently waiting in queue.';
      if (onProgress) {
        onProgress({
          isPublishing: false,
          currentStep: 'complete',
          stepMessage: err,
        });
      }
      throw new Error(err);
    }

    const pin = queue[pinIndex];
    pin.status = 'publishing';
    this.saveQueue(queue);

    const client = new PinterestClient(auth.access_tier, settings.client_id, settings.redirect_uri);

    try {
      // Step 1: POST /v5/media
      if (onProgress) {
        onProgress({
          isPublishing: true,
          currentStep: 'upload_media_init',
          stepMessage: 'Registering media upload with Pinterest API v5 (POST /v5/media)...',
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }
      const mediaInit = await client.initMediaUpload();

      // Step 2: Upload to S3
      if (onProgress) {
        onProgress({
          isPublishing: true,
          currentStep: 'upload_s3',
          stepMessage: 'Uploading 2:3 image binary directly to S3 endpoint...',
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }
      await client.uploadMediaToS3(mediaInit.upload_url, mediaInit.upload_parameters, pin.image_url);

      // Step 3: Poll media status
      if (onProgress) {
        onProgress({
          isPublishing: true,
          currentStep: 'poll_media',
          stepMessage: `Polling media processing status for ${mediaInit.media_id}... (registered → processing → succeeded)`,
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }
      const mediaStatus = await client.pollMediaStatus(mediaInit.media_id);
      if (mediaStatus.status === 'failed') {
        throw new Error('Pinterest media processing failed (code: ' + (mediaStatus.failure_code || 500) + ')');
      }

      // Step 4: POST /v5/pins
      if (onProgress) {
        onProgress({
          isPublishing: true,
          currentStep: 'create_pin',
          stepMessage: `Creating pin on board "${pin.board_name || pin.board_id}" with Store ID "${settings.store_id}"...`,
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }
      const createdPin = await client.createPin(pin, mediaInit.media_id);

      // Step 5: Verify via GET /v5/pins/{id}
      if (onProgress) {
        onProgress({
          isPublishing: true,
          currentStep: 'verify_pin',
          stepMessage: `Verifying pin creation via GET /v5/pins/${createdPin.id}...`,
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }
      const verification = await client.verifyPin(createdPin.id);

      // Update Pin in Queue
      pin.status = 'published';
      pin.published_at = new Date().toISOString();
      pin.pin_id = createdPin.id;
      pin.pin_url = verification.pinUrl;
      this.saveQueue(queue);

      // Append to Daily Log
      const log = this.addLog({
        pin_id: pin.id,
        pin_title: pin.title,
        board_name: pin.board_name || 'Pinterest Board',
        board_id: pin.board_id,
        language: pin.language,
        attempted_at: new Date().toISOString(),
        status: 'published',
        http_status: 201,
        pin_url: verification.pinUrl,
        media_id: mediaInit.media_id,
        tier: auth.access_tier,
      });

      if (onProgress) {
        onProgress({
          isPublishing: false,
          currentStep: 'complete',
          stepMessage: `Successfully published pin #${createdPin.id} on Pinterest!`,
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }

      return { success: true, log, pin };
    } catch (err: any) {
      pin.status = 'failed';
      pin.error = err.message || 'Publishing error';
      this.saveQueue(queue);

      const log = this.addLog({
        pin_id: pin.id,
        pin_title: pin.title,
        board_name: pin.board_name || 'Pinterest Board',
        board_id: pin.board_id,
        language: pin.language,
        attempted_at: new Date().toISOString(),
        status: 'failed',
        http_status: 500,
        error: err.message || 'Unknown publish error',
        tier: auth.access_tier,
      });

      if (onProgress) {
        onProgress({
          isPublishing: false,
          currentStep: 'error',
          stepMessage: `Failed to publish pin: ${err.message}`,
          error: err.message,
          pinId: pin.id,
          pinTitle: pin.title,
        });
      }

      return { success: false, log, pin };
    }
  }

  /**
   * Resets demo data
   */
  public resetToDefaults(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.AUTH);
    localStorage.removeItem(STORAGE_KEYS.BOARDS);
    localStorage.removeItem(STORAGE_KEYS.BATCHES);
    localStorage.removeItem(STORAGE_KEYS.QUEUE);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
  }
}
