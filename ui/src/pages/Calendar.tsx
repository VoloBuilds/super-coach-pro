import { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { ScheduleWorkoutDialog } from '@/components/workout/ScheduleWorkoutDialog';
import { Workout } from '@/types/workout';
import { WorkoutSchedule } from '@/types/schedule';
import { serverComm } from '@/lib/serverComm';
import { useToast } from '@/components/ui/use-toast';

type DayOfWeek = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [schedules, setSchedules] = useState<WorkoutSchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fetchedWorkouts, fetchedSchedules] = await Promise.all([
          serverComm.getWorkouts(),
          serverComm.getScheduledWorkouts()
        ]);
        console.log('Fetched workouts:', fetchedWorkouts);
        console.log('Fetched schedules:', fetchedSchedules);
        setWorkouts(fetchedWorkouts);
        setSchedules(fetchedSchedules);
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load calendar data',
          variant: 'destructive'
        });
      }
    };

    loadData();
  }, []);

  const handleScheduleWorkout = async (schedule: Omit<WorkoutSchedule, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newSchedule = await serverComm.scheduleWorkout(schedule);
      setSchedules(prev => [...prev, newSchedule]);
      toast({
        title: 'Success',
        description: 'Workout scheduled successfully'
      });
    } catch (error) {
      console.error('Failed to schedule workout:', error);
      toast({
        title: 'Error',
        description: 'Failed to schedule workout',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    try {
      await serverComm.deleteScheduledWorkout(scheduleId);
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
      toast({
        title: 'Success',
        description: 'Schedule deleted successfully'
      });
    } catch (error) {
      console.error('Failed to delete schedule:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive'
      });
    }
  };

  const getSchedulesForDay = (date: Date) => {
    if (!Array.isArray(schedules)) return [];
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.date);
      
      if (schedule.recurrence === 'once') {
        return isSameDay(scheduleDate, date);
      } else {
        const dayName = format(date, 'EEEE').toLowerCase() as DayOfWeek;
        return schedule.daysOfWeek?.includes(dayName);
      }
    });
  };

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

  const handleStartWorkout = (schedule: WorkoutSchedule, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent day selection when clicking workout
    const workout = workouts.find(w => w.id === schedule.workoutId);
    if (workout) {
      navigate('/workouts', { state: { startWorkout: workout } });
    } else {
      toast({
        title: 'Error',
        description: 'Could not find workout details',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <div className="flex gap-2">
          <ScheduleWorkoutDialog
            workouts={workouts}
            onSchedule={handleScheduleWorkout}
            selectedDate={selectedDate}
            trigger={
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Schedule Workout
              </Button>
            }
          />
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
          {days.map((day) => {
            const daySchedules = getSchedulesForDay(day);
            const isSelected = selectedDate && isSameDay(selectedDate, day);
            
            return (
              <div
                key={day.toString()}
                onClick={() => setSelectedDate(day)}
                className={cn(
                  "min-h-[100px] bg-background p-2 transition-colors hover:bg-muted/50 cursor-pointer",
                  isToday(day) && "bg-blue-100 dark:bg-blue-900/20",
                  !isSameMonth(day, currentDate) && "text-muted-foreground bg-muted/30",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                <time dateTime={format(day, 'yyyy-MM-dd')} className={cn(
                  "font-medium",
                  isToday(day) && "text-blue-700 dark:text-blue-400"
                )}>
                  {format(day, 'd')}
                </time>
                <div className="mt-2 space-y-1">
                  {daySchedules.map((schedule) => {
                    const workout = workouts.find(w => w.id === schedule.workoutId);
                    return workout ? (
                      <div
                        key={schedule.id}
                        className="group flex items-center justify-between gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs"
                        onClick={(e) => handleStartWorkout(schedule, e)}
                      >
                        <span className="truncate">{workout.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSchedule(schedule.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
} 