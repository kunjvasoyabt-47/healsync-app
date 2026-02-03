"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAvailableSlots = void 0;
const date_fns_1 = require("date-fns");
const generateAvailableSlots = (startTime, endTime, slotDuration, bookedSlots) => {
    const slots = [];
    let current = (0, date_fns_1.parse)(startTime, "HH:mm", new Date());
    const end = (0, date_fns_1.parse)(endTime, "HH:mm", new Date());
    while ((0, date_fns_1.isBefore)(current, end)) {
        const slotStr = (0, date_fns_1.format)(current, "HH:mm");
        if (!bookedSlots.includes(slotStr)) {
            slots.push(slotStr);
        }
        current = (0, date_fns_1.addMinutes)(current, slotDuration);
    }
    return slots;
};
exports.generateAvailableSlots = generateAvailableSlots;
//# sourceMappingURL=slotGenerator.js.map