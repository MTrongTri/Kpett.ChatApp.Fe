import { cn } from "@/lib/utils";

interface FormFieldProps {
  label:     string;
  required?: boolean;
  hint?:     string;
  children:  React.ReactNode;
  className?: string;
}

export default function FormField({
  label,
  required,
  hint,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("mb-5 last:mb-0", className)}>
      <label className="
        block  text-[11px] font-semibold
        uppercase text-muted-foreground
        mb-1.5
      ">
        {label}
        {required && (
          <span className="text-primary ml-1">*</span>
        )}
      </label>

      {children}

      {hint && (
        <p className=" text-[11px] text-muted-foreground/60 mt-1.5 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}