
"use client";

import { create } from 'zustand';
import { useEffect, useMemo } from 'react';

type SectionKey = 'thanksgiving' | 'whatYouHeard' | 'reflection' | 'prayer' | 'challenges';

interface TimerState {
  endTime: Date | null;
  startTime: Date | null;
  timeRemaining: number;
  totalDuration: number;
  isVisible: boolean;
  currentSection: SectionKey | null;
  currentSectionName: string | null;
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
  _setCurrentSection: (section: SectionKey | null) => void;
  _setCurrentSectionName: (name: string | null) => void;
  _setTotalDuration: (duration: number) => void;
}

const SECTION_CONFIG: { key: SectionKey; name: string; proportion: number }[] = [
    { key: 'thanksgiving', name: 'Thanksgiving', proportion: 1/6 },
    { key: 'whatYouHeard', name: 'MBS | What did you hear?', proportion: 1/3 },
    { key: 'reflection', name: 'MBS | Reflection', proportion: 1/3 },
    { key: 'prayer', name: 'Write out a prayer', proportion: 1/12 },
    { key: 'challenges', name: 'Current Challenges or Prayer Requests', proportion: 1/12 },
];

const useTimerStore = create<TimerState>((set, get) => ({
  endTime: null,
  startTime: null,
  timeRemaining: 0,
  totalDuration: 0,
  isVisible: true,
  currentSection: null,
  currentSectionName: null,
  sectionTimes: {
    thanksgiving: null,
    whatYouHeard: null,
    reflection: null,
    prayer: null,
    challenges: null,
  },
  setEndTime: (time) => {
    const now = new Date();
    const totalDuration = Math.max(0, (time.getTime() - now.getTime()) / 1000);
    set({ endTime: time, startTime: now, totalDuration });
  },
  toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
  _setTimeRemaining: (time) => set({ timeRemaining: time }),
  _setSectionTimes: (times) => set({ sectionTimes: times }),
  _setCurrentSection: (section) => set({ currentSection: section }),
  _setCurrentSectionName: (name) => set({ currentSectionName: name }),
  _setTotalDuration: (duration) => set({ totalDuration: duration }),
}));

export const useTimer = () => {
  const {
    endTime,
    startTime,
    setEndTime,
    timeRemaining,
    _setTimeRemaining,
    totalDuration,
    isVisible,
    toggleVisibility,
    sectionTimes,
    _setSectionTimes,
    currentSection,
    _setCurrentSection,
    currentSectionName,
    _setCurrentSectionName
  } = useTimerStore();

  useEffect(() => {
    if (!endTime || !startTime) return;

    const calculateTimes = () => {
      const now = new Date();
      const remaining = Math.max(0, (endTime.getTime() - now.getTime()) / 1000);
      _setTimeRemaining(remaining);
      
      const elapsed = (now.getTime() - startTime.getTime()) / 1000;

      const totalMinutes = totalDuration / 60;
      _setSectionTimes({
        thanksgiving: totalMinutes * (1/6),
        whatYouHeard: totalMinutes * (1/3),
        reflection: totalMinutes * (1/3),
        prayer: totalMinutes * (1/12),
        challenges: totalMinutes * (1/12),
      });

      let accumulatedDuration = 0;
      let activeSection: SectionKey | null = null;
      let activeSectionName: string | null = null;

      for (const section of SECTION_CONFIG) {
        const sectionDuration = totalDuration * section.proportion;
        accumulatedDuration += sectionDuration;
        if (elapsed < accumulatedDuration) {
          activeSection = section.key;
          activeSectionName = section.name;
          break;
        }
      }
      
      if (remaining <= 0) {
        _setCurrentSection(null);
        _setCurrentSectionName("Session Complete!");
      } else {
        _setCurrentSection(activeSection);
        _setCurrentSectionName(activeSectionName);
      }
    };

    calculateTimes(); 
    const interval = setInterval(calculateTimes, 1000);

    return () => clearInterval(interval);
  }, [endTime, startTime, totalDuration, _setTimeRemaining, _setSectionTimes, _setCurrentSection, _setCurrentSectionName]);
  
  return {
    endTime,
    setEndTime,
    timeRemaining,
    isVisible,
    toggleVisibility,
    sectionTimes,
    currentSection,
    currentSectionName,
  };
};
