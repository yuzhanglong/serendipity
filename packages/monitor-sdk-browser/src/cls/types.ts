import { MonitorOptions } from '../types';

export interface LayoutShift extends PerformanceEntry {
  duration: number;
  entryType: 'layout-shift';
  hadRecentInput: boolean;
  lastInputTime: number;
  startTime: number;
  value: number;
  name: string;
}

interface ClsReportData {
  clsValue: number;
  entries: LayoutShift[];
}

export type ClsMonitorOptions = MonitorOptions<ClsReportData>;
