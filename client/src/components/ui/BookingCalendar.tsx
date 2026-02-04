'use client';

import React, { useState } from 'react';

interface BookingCalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

export default function BookingCalendar({ onDateSelect, selectedDate }: BookingCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const handlePrevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 6);

  const renderDays = () => {
    const totalDays = daysInMonth(currentMonth);
    const startDay = firstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10 w-10 md:h-12 md:w-12"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
      // 🟢 Creates date in Local Time
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i);
      const isToday = date.getTime() === today.getTime();
      const isSelected = selectedDate?.getTime() === date.getTime();
      const isPast =date < today || date > maxDate;

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => {
            if (!isPast) {
              // 🟢 FIX: Ensure we select the local midnight of the day
              const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              onDateSelect(normalizedDate);
            }
          }}
          disabled={isPast}
          className={`h-10 w-10 md:h-12 md:w-12 flex items-center justify-center rounded-xl text-sm font-semibold transition-all
            ${isSelected 
              ? 'bg-primary text-white shadow-md' 
              : isToday 
                ? 'border-2 border-primary text-primary' 
                : isPast 
                  ? 'text-text-muted/30 cursor-not-allowed' 
                  : 'text-text-main hover:bg-primary/10 hover:text-primary'}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  return (
    <div className="bg-bg-card p-6 rounded-3xl border border-border-main shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-text-card-title">{monthName} {year}</h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-2 rounded-full border border-border-main hover:bg-bg-surface text-text-main">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <button onClick={handleNextMonth} className="p-2 rounded-full border border-border-main hover:bg-bg-surface text-text-main">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="h-10 w-10 md:h-12 md:w-12 flex items-center justify-center text-[10px] font-bold text-text-muted uppercase">{day.charAt(0)}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">{renderDays()}</div>
    </div>
  );
}