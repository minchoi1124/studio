
"use client";

import { create } from 'zustand';
import { useEffect, useMemo } from 'react';

interface TimerState {
  endTime: Date | null;
  timeRemaining: number;
  isVisible: boolean;
  sectionTimes: {
    thanksgiving: number | null;
    whatYouHeard: number | null;
    reflection: number | null;
    prayer: number | null;
    challenges: number | null;
  };
  setEndTime: (time: Date) => void;
  toggleVisibility: () => void;
  _setTimeRemaining: (time: number) => void;
  _setSectionTimes: (times: TimerState['sectionTimes']) => void;
}

const useTimerStore = create<TimerState>((set) => ({
  endTime: null,
  timeRemaining: 0,
  isVisible: true,
  sectionTimes: {
    thanksgiving: null,
    whatYouHeard: null,
    reflection: null,
    prayer: null,
    challenges: null,
  },
  setEndTime: (time) => set({ endTime: time }),
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  _setTimeRemaining: (time) => set({ timeRemaining: time }),
    _setSectionTimes: (times) => set({ sectionTimes: times }),
}));

export const useTimer = () => {
  const {
    endTime,
    setEndTime,
    timeRemaining,
    _setTimeRemaining,
    isVisible,
    toggleVisibility,
    sectionTimes,
    _setSectionTimes,
  } = useTimerStore();

  useEffect(() => {
    if (!endTime) return;

    const calculateTimes = () => {
      const now = new Date();
      const remaining = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
      _setTimeRemaining(remaining);

      const totalMinutes = remaining / 60;
      _setSectionTimes({
        thanksgiving: totalMinutes * (1/6),
        whatYouHeard: totalMinutes * (1/3),
        reflection: totalMinutes * (1/3),
        prayer: totalMinutes * (1/12),
        challenges: totalMinutes * (1/12),
      });
    };

    calculateTimes(); 
    const interval = setInterval(calculateTimes, 1000);

    return () => clearInterval(interval);
  }, [endTime, _setTimeRemaining, _setSectionTimes]);
  
  return {
    endTime,
    setEndTime,
    timeRemaining,
    isVisible,
    toggleVisibility,
    sectionTimes,
  };
};
