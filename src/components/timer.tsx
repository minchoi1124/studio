
"use client";

import { useState } from "react";
import { TimerIcon, EyeIcon, EyeOffIcon } from "lucide-react";

import { useTimer } from "@/hooks/use-timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Timer() {
  const {
    endTime,
    setEndTime,
    timeRemaining,
    isVisible,
    toggleVisibility,
    currentSection,
    currentSectionName
  } = useTimer();
  const [inputValue, setInputValue] = useState("");

  const handleSetTime = () => {
    const now = new Date();
    const [hours, minutes] = inputValue.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      now.setHours(hours, minutes, 0, 0);
      setEndTime(now);
    }
  };

  const formatTime = (totalSeconds: number) => {
    if (totalSeconds < 0) return "00:00:00";
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  };

  return (
    <Card className="w-full shadow-lg rounded-xl border-2 border-primary/10">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="font-headline text-2xl text-accent flex items-center">
            <TimerIcon className="mr-2 h-6 w-6" />
            Reflection Timer
          </CardTitle>
          <CardDescription>Set an end time for your session.</CardDescription>
        </div>
        <Button onClick={toggleVisibility} variant="ghost" size="icon">
          {isVisible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              type="time"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-40"
            />
            <Button onClick={handleSetTime}>Set End Time</Button>
          </div>
          {endTime && isVisible && (
            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">Time Remaining:</p>
              <p className="text-4xl font-bold font-mono text-accent">
                {formatTime(timeRemaining)}
              </p>
              {currentSection && (
                <p className="text-md text-muted-foreground mt-2">
                  Current Section: <span className="font-bold text-accent">{currentSectionName}</span>
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
