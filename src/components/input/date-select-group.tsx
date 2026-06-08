import React, { useState, useEffect, useMemo } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateSelectGroupProps {
    value?: Date | string | null;
    onChange: (date: Date | undefined) => void;
    hasError?: boolean;
    className?: string;
}

export function DateSelectGroup({ value, onChange, hasError, className }: DateSelectGroupProps) {
    const parseDateSafe = (val: Date | string | null | undefined) => {
        if (!val) return null;
        const d = val instanceof Date ? val : new Date(val);
        return !isNaN(d.getTime()) ? d : null;
    };

    const initialDate = parseDateSafe(value);

    const [day, setDay] = useState<string>(initialDate ? initialDate.getDate().toString() : "");
    const [month, setMonth] = useState<string>(initialDate ? (initialDate.getMonth() + 1).toString() : "");
    const [year, setYear] = useState<string>(initialDate ? initialDate.getFullYear().toString() : "");

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const daysInMonth = useMemo(() => {
        if (month && year) {
            return new Date(parseInt(year), parseInt(month), 0).getDate();
        }
        return 31;
    }, [month, year]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!value) {
                setDay("");
                setMonth("");
                setYear("");
                return;
            }

            const dateObj = parseDateSafe(value);

            if (dateObj) {
                setDay(dateObj.getDate().toString());
                setMonth((dateObj.getMonth() + 1).toString());
                setYear(dateObj.getFullYear().toString());
            }
        }, 0);

        return () => clearTimeout(timer);
    }, [value]);

    const triggerChange = (newDay: string, newMonth: string, newYear: string) => {
        if (newDay && newMonth && newYear) {
            const maxDays = new Date(parseInt(newYear), parseInt(newMonth), 0).getDate();

            if (parseInt(newDay) > maxDays) {
                setDay("");
                onChange(undefined);
                return;
            }

            const newDate = new Date(parseInt(newYear), parseInt(newMonth) - 1, parseInt(newDay));
            onChange(newDate);
        } else {
            onChange(undefined);
        }
    };

    const handleDayChange = (val: string) => {
        setDay(val);
        triggerChange(val, month, year);
    };

    const handleMonthChange = (val: string) => {
        setMonth(val);
        triggerChange(day, val, year);
    };

    const handleYearChange = (val: string) => {
        setYear(val);
        triggerChange(day, month, val);
    };

    const triggerClassName = cn(
        "focus:ring-0 focus:ring-offset-0",
        hasError && "border-red-500 text-red-500 focus:ring-red-500",
        className
    );

    return (
        <div className="flex space-x-2">

            {/* Cột Ngày */}
            <Select
                key={`day-${day}`}
                value={day || undefined}
                onValueChange={handleDayChange}
            >
                <SelectTrigger className={cn("w-27.5", triggerClassName)}>
                    <SelectValue placeholder="Ngày" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                        <SelectItem key={d} value={d.toString()}>
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Cột Tháng */}
            <Select
                key={`month-${month}`}
                value={month || undefined}
                onValueChange={handleMonthChange}
            >
                <SelectTrigger className={cn("w-27.5", triggerClassName)}>
                    <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                    {months.map((m) => (
                        <SelectItem key={m} value={m.toString()}>
                            Tháng {m}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Cột Năm */}
            <Select
                key={`year-${year}`}
                value={year || undefined}
                onValueChange={handleYearChange}
            >
                <SelectTrigger className={cn("flex-1", triggerClassName)}>
                    <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent className="bg-background">
                    {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                            {y}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
