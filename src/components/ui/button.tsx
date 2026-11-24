import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "press inline-flex min-h-11 items-center justify-center gap-2 px-4 text-base font-black disabled:pointer-events-none",
  {
    variants: {
      variant: {
        sun: "bg-sun text-ink",
        hero: "bg-hero text-white",
        white: "bg-white text-ink",
        pink: "bg-party-a text-ink",
        lime: "bg-party-b text-ink",
        danger: "bg-white text-danger",
      },
      size: {
        md: "",
        lg: "min-h-12 px-5 text-lg",
      },
    },
    defaultVariants: { variant: "sun", size: "md" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
