// src/components/DatePills.jsx
import React from "react";

export default function DatePills({ options = [], activeISO, onChange }) {
  // Get current month and year from active date
  const activeDate = new Date(activeISO);
  const currentMonth = activeDate.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = activeDate.getFullYear();

  // Get today's date for comparison (current date only)
  const today = new Date();
  const todayISO = today.toISOString().slice(0, 10);
  
  // Also get local date for comparison
  const localToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const localTodayISO = localToday.toISOString().slice(0, 10);

  return (
    <div className="space-y-2 md:space-y-3">
      {/* Month and Year Header */}
      <div className="text-center">
        <h3 className="text-base md:text-lg font-semibold text-gray-800">
          {currentMonth} {currentYear}
        </h3>
      </div>
      
      {/* Date Pills */}
      <div className="flex flex-wrap gap-1.5 md:gap-2 justify-center">
        {options.map(opt => {
          const active = opt.iso === activeISO;
          const isToday = opt.iso === localTodayISO;
          const isPast = opt.iso < localTodayISO;
          
          return (
            <button
              key={opt.iso}
              onClick={() => !isPast && onChange?.(opt.iso)}
              disabled={isPast}
              className={`
                relative rounded-lg px-2.5 md:px-3 py-1.5 md:py-2 text-sm font-medium transition-all duration-200 min-w-[50px] md:min-w-[60px]
                ${active 
                  ? "bg-blue-600 text-white shadow-md" 
                  : isToday
                    ? "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                    : isPast
                      ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed opacity-50"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-blue-300"
                }
              `}
              title={isPast ? "Past dates cannot be selected" : ""}
            >
              <div className="text-xs opacity-80">{opt.day}</div>
              <div className="text-sm md:text-base font-semibold">{String(opt.dateNum).padStart(2,"0")}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}