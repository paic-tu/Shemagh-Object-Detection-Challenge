
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatDistanceToNow, isPast } from "date-fns";
import { Calendar, Flag, Clock } from "lucide-react";
import React from "react";

interface TimelineProps {
  startDate: Date | string;
  endDate: Date | string;
  className?: string;
}

export function CompetitionTimeline({ startDate, endDate, className }: TimelineProps) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  const totalDuration = end.getTime() - start.getTime();
  const elapsed = now.getTime() - start.getTime();
  
  // Calculate percentage (0 to 100)
  let progress = 0;
  if (totalDuration > 0) {
    progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));
  }

  const isFinished = isPast(end);
  const isStarted = isPast(start);

  return (
    <div className={cn("space-y-6 px-1", className)}>
      {/* Visual Timeline Bar */}
      <div className="relative pt-6 pb-2">
        <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
                className="h-full bg-primary transition-all duration-500 ease-in-out" 
                style={{ width: `${progress}%` }}
            />
        </div>
        
        {/* Start Marker */}
        <div className="absolute top-0 left-0 -ml-3 flex flex-col items-center">
             <div className="h-3 w-0.5 bg-muted-foreground/30 mb-1"></div>
             <span className="text-xs text-muted-foreground font-medium">Start</span>
        </div>

        {/* End Marker */}
        <div className="absolute top-0 right-0 -mr-3 flex flex-col items-center">
             <div className="h-3 w-0.5 bg-muted-foreground/30 mb-1"></div>
             <span className="text-xs text-muted-foreground font-medium">Deadline</span>
        </div>
        
        {/* Current Time Marker (if active) */}
        {!isFinished && isStarted && (
           <div 
             className="absolute top-5 -ml-1.5 flex flex-col items-center"
             style={{ left: `${progress}%` }}
           >
             <div className="h-3 w-3 rounded-full bg-primary border-2 border-background shadow-sm mb-1" />
             <span className="text-xs font-bold text-primary whitespace-nowrap">Now</span>
           </div>
        )}
      </div>

      {/* Info Stats */}
      <div className="flex justify-between items-center text-sm border-t pt-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Start Date
          </span>
          <span className="font-medium">{start.toLocaleDateString()}</span>
        </div>
        
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
             <Clock className="h-3 w-3" /> Status
          </span>
          <Badge variant={isFinished ? "destructive" : "secondary"}>
            {isFinished 
              ? "Competition Ended" 
              : formatDistanceToNow(end, { addSuffix: true })}
          </Badge>
        </div>

        <div className="flex flex-col items-end gap-0.5">
          <span className="text-muted-foreground text-xs flex items-center gap-1">
            <Flag className="h-3 w-3" /> End Date
          </span>
          <span className="font-medium">{end.toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
