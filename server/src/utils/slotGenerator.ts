import { addMinutes, format, parse, isBefore } from "date-fns";

export const generateAvailableSlots = (
  startTime: string,    
  endTime: string,      
  slotDuration: number, 
  bookedSlots: string[] 
) => {
  const slots: string[] = [];
  let current = parse(startTime, "HH:mm", new Date());
  const end = parse(endTime, "HH:mm", new Date());

  while (isBefore(current, end)) {
    const slotStr = format(current, "HH:mm");
    if (!bookedSlots.includes(slotStr)) {
      slots.push(slotStr);
    }
    current = addMinutes(current, slotDuration);
  }
  return slots;
};