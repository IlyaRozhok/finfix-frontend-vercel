import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  CalendarDaysIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { clsx } from "clsx";
import "./Calendar.scss";

interface CalendarProps {
  value?: string;
  onChange: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const Calendar: React.FC<CalendarProps> = ({
  value,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const today = new Date();
    const initialDate = value ? new Date(value) : null;
    return initialDate || today;
  });

  // Get selected date from value prop
  const selectedDate = value ? new Date(value) : null;

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  const formatDisplayDate = (date: Date | null): string => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDate(date);
    onChange(formattedDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentMonth((prev) => {
      const newMonth = new Date(prev);
      if (direction === "prev") {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const getDaysInMonth = (date: Date): Date[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const days: Date[] = [];

    // Add days from previous month to fill the first week
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const days = getDaysInMonth(currentMonth);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (disabled) {
    return (
      <div className={clsx("relative", className)}>
        <div className="w-full px-4 py-3 bg-gray-100 backdrop-blur-sm border border-gray-200 rounded-xl text-gray-400 cursor-not-allowed flex items-center justify-between">
          <span>
            {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
          </span>
          <CalendarDaysIcon className="h-5 w-5 text-gray-300" />
        </div>
      </div>
    );
  }

  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      {/* Input Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-primary-background placeholder-primary-background/50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all duration-200 flex items-center justify-between hover:bg-white/30"
      >
        <span
          className={
            selectedDate
              ? "text-primary-background"
              : "text-primary-background/50"
          }
        >
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <CalendarDaysIcon className="h-5 w-5 text-primary-background/70" />
      </button>

      {/* Dropdown Calendar */}
      {isOpen && (
        <div className="calendar-dropdown">
          {/* Header */}
          <div className="calendar-header">
            <button
              type="button"
              onClick={() => navigateMonth("prev")}
              className="nav-button"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>

            <h3 className="month-year">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h3>

            <button
              type="button"
              onClick={() => navigateMonth("next")}
              className="nav-button"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>
          </div>

          {/* Days of Week */}
          <div className="weekdays">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="weekday">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="days">
            {days.map((day, index) => {
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isSelected =
                selectedDate &&
                day.toDateString() === selectedDate.toDateString();
              const isToday = day.toDateString() === new Date().toDateString();

              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleDateSelect(day)}
                  className={clsx("day", {
                    "other-month": !isCurrentMonth,
                    selected: isSelected,
                    today: isToday && !isSelected,
                  })}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
