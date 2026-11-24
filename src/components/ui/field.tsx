import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control = "w-full rounded-[8px] border-2 border-ink bg-white px-3 py-3 text-base text-ink";

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(control, props.className)} />;
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(control, "min-h-40 resize-y leading-relaxed", props.className)} />;
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(control, "font-bold", props.className)} />;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <span className="mb-2 block text-sm font-black">{children}</span>;
}
