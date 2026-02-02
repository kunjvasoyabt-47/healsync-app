'use client';

interface AvailableSlotsProps {
    slots: string[];
    loading: boolean;
    selectedSlot: string | null;
    onSlotSelect: (slot: string) => void;
}

export default function AvailableSlots({ slots, loading, selectedSlot, onSlotSelect }: AvailableSlotsProps) {
    if (loading) {
        return (
            <div className="mt-6 grid grid-cols-3 gap-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl"></div>
                ))}
            </div>
        );
    }

    // Logic: If the array is empty OR doesn't exist yet
    if (!slots || slots.length === 0) {
        return (
            <div className="mt-6 p-8 text-center bg-bg-card rounded-2xl border border-dashed border-border-main">
                <p className="text-text-muted text-sm">No slots available for this date.</p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <h4 className="text-xs font-bold text-text-muted mb-4 uppercase tracking-widest">Available Times</h4>
            <div className="grid grid-cols-3 gap-3">
                {slots.map((slot) => (
                    <button
                        key={slot}
                        type="button"
                        onClick={() => onSlotSelect(slot)}
                        className={`py-3 rounded-xl border-2 text-sm font-bold transition-all
                            ${selectedSlot === slot 
                                ? 'bg-primary border-primary text-white' 
                                : 'bg-bg-card border-border-main text-text-main hover:border-primary'}`}
                    >
                        {slot}
                    </button>
                ))}
            </div>
        </div>
    );
}