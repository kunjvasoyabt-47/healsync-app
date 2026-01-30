export interface Availability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDuration: number;
  isBookable: boolean;
}