import { parseDate } from '@internationalized/date';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import {
  Button as AriaButton,
  Calendar,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  Dialog as AriaDialog,
  Heading,
} from 'react-aria-components';
import { inputClassName } from '../forms/FormElements';
import { Select } from '../primitives/Select';

type BookingScheduleFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export const BookingScheduleField = ({
  value,
  onChange,
}: BookingScheduleFieldProps) => {
  const [datePart = createTodayDate(), timePart = '09:00'] = value.split('T');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    return () => window.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  return (
    <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_120px]">
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className={`${inputClassName} flex items-center justify-between text-left`}
        >
          <span className="truncate">{formatDateLabel(datePart)}</span>
          <CalendarDays className="h-4 w-4 shrink-0 text-stone-500" />
        </button>
        {isOpen ? (
          <div className="absolute left-0 right-0 top-full z-60 mt-2 animate-in fade-in slide-in-from-top-2 duration-200 sm:right-auto">
            <AriaDialog className="rounded-3xl border border-white/10 bg-[#161719] p-4 shadow-2xl outline-none sm:w-[20rem]">
              <Calendar
                value={parseDate(datePart)}
                onChange={(date) => {
                  onChange(`${date.toString()}T${timePart}`);
                  setIsOpen(false);
                }}
              >
                <header className="mb-4 flex items-center justify-between gap-4">
                  <AriaButton
                    slot="previous"
                    className="rounded-xl bg-white/5 p-2 text-white transition hover:bg-white/10"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </AriaButton>
                  <Heading className="text-xs font-bold uppercase tracking-widest text-white" />
                  <AriaButton
                    slot="next"
                    className="rounded-xl bg-white/5 p-2 text-white transition hover:bg-white/10"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </AriaButton>
                </header>
                <CalendarGrid className="w-full border-separate border-spacing-1">
                  <CalendarGridHeader>
                    {(day) => (
                      <CalendarHeaderCell className="pb-2 text-[10px] font-bold uppercase text-stone-600">
                        {day}
                      </CalendarHeaderCell>
                    )}
                  </CalendarGridHeader>
                  <CalendarGridBody>
                    {(date) => (
                      <CalendarCell
                        date={date}
                        className={({ isSelected, isToday, isOutsideMonth }) =>
                          `flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl text-xs outline-none transition ${
                            isOutsideMonth ? 'text-stone-800' : 'text-stone-300'
                          } ${
                            isSelected
                              ? 'bg-amber-400 !text-black font-bold'
                              : 'hover:bg-white/10'
                          } ${
                            isToday && !isSelected
                              ? 'ring-1 ring-amber-400/50'
                              : ''
                          }`
                        }
                      />
                    )}
                  </CalendarGridBody>
                </CalendarGrid>
              </Calendar>
            </AriaDialog>
          </div>
        ) : null}
      </div>
      <Select
        value={timePart}
        onChange={(event) => onChange(`${datePart}T${event.target.value}`)}
        className={inputClassName}
      >
        {timeOptions.map((time) => (
          <option key={time} value={time}>
            {time}
          </option>
        ))}
      </Select>
    </div>
  );
};

const createDateString = (date: Date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-');
};

const createTodayDate = () => {
  return createDateString(new Date());
};

const formatDateLabel = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
};

const timeOptions = Array.from({ length: 24 * 4 }, (_, index) => {
  const hours = String(Math.floor(index / 4)).padStart(2, '0');
  const minutes = String((index % 4) * 15).padStart(2, '0');
  return `${hours}:${minutes}`;
});
