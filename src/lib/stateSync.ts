import { 
  UserRole, DCRateItem, VendorProfile, CitizenReport, Citation, 
  FieldTask, ZoneItem, FeedEvent, PlatformConfig, Language 
} from '../types';

export type StateSyncEventType = 
  | 'REPORT_ADDED'
  | 'REPORT_UPDATED'
  | 'REPORT_RESOLVED'
  | 'REPORT_DISPATCHED'
  | 'CITATION_ISSUED'
  | 'CITATION_UPDATED'
  | 'VENDOR_UPDATED'
  | 'TASK_COMPLETED'
  | 'DC_RATES_SYNCED'
  | 'DATA_RESET';

export interface StateSyncPayload {
  report?: CitizenReport;
  reports?: CitizenReport[];
  citation?: Citation;
  citations?: Citation[];
  vendor?: VendorProfile;
  vendors?: VendorProfile[];
  task?: FieldTask;
  tasks?: FieldTask[];
  dcRate?: DCRateItem;
  dcRates?: DCRateItem[];
  feedEvent?: FeedEvent;
  meta?: Record<string, unknown>;
}

type SyncListener = (event: StateSyncEventType, payload: StateSyncPayload) => void;

class StateSyncManager {
  private listeners: Set<SyncListener> = new Set();

  /**
   * Subscribe to global data synchronization events
   */
  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Emit an event to all subscribers and persist state to localStorage synchronously
   */
  public emit(event: StateSyncEventType, payload: StateSyncPayload): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event, payload);
      } catch (err) {
        console.error('[StateSync] Listener error on event', event, err);
      }
    });
  }

  public emitVendors(vendors: VendorProfile[]): void {
    this.emit('VENDOR_UPDATED', { vendors });
  }

  public emitReports(reports: CitizenReport[]): void {
    this.emit('REPORT_UPDATED', { reports });
  }

  public emitCitations(citations: Citation[]): void {
    this.emit('CITATION_UPDATED', { citations });
  }

  public emitDCRates(dcRates: DCRateItem[]): void {
    this.emit('DC_RATES_SYNCED', { dcRates });
  }

  public emitTasks(tasks: FieldTask[]): void {
    this.emit('TASK_COMPLETED', { tasks });
  }

  /**
   * Safe storage helpers
   */
  public save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`[StateSync] Failed to save key ${key}:`, e);
    }
  }

  public load<T>(key: string, fallback: T): T {
    try {
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved) as T;
    } catch (e) {
      console.warn(`[StateSync] Failed to parse key ${key}:`, e);
    }
    return fallback;
  }
}

export const StateSync = new StateSyncManager();
