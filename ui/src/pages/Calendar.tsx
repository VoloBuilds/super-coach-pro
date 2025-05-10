import { useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handlePreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Generate arrays for month and year selection
  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(2024, i, 1);
    return {
      value: i.toString(),
      label: format(date, 'MMMM')
    };
  });

  const years = Array.from({ length: 10 }, (_, i) => {
    const year = new Date().getFullYear() - 2 + i;
    return {
      value: year.toString(),
      label: year.toString()
    };
  });

  const handleMonthChange = (value: string) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(parseInt(value));
    setCurrentDate(newDate);
  };

  const handleYearChange = (value: string) => {
    const newDate = new Date(currentDate);
    newDate.setFullYear(parseInt(value));
    setCurrentDate(newDate);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Schedule Workout
          </Button>
          <Button variant="secondary">
            <Plus className="mr-2 h-4 w-4" />
            Schedule Meal
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-2">
              <Select value={currentDate.getMonth().toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month) => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-px bg-muted text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="p-2 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px bg-muted">
          {days.map((day) => (
            <div
              key={day.toString()}
              className={cn(
                "min-h-[100px] bg-background p-2 transition-colors hover:bg-muted/50",
                isToday(day) && "bg-blue-100 dark:bg-blue-900/20",
                !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/30"
              )}
            >
              <time dateTime={format(day, 'yyyy-MM-dd')} className={cn(
                "font-medium",
                isToday(day) && "text-blue-700 dark:text-blue-400"
              )}>
                {format(day, 'd')}
              </time>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
} 