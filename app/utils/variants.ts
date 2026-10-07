import { cva, type VariantProps } from 'class-variance-authority'

export const buttonVariants = cva(
  'relative inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,border-color,box-shadow,transform,opacity] duration-150 ease-out active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.12),0_1px_2px_rgb(0_0_0/0.2)] hover:opacity-90',
        secondary: 'border border-border bg-surface-2 text-foreground hover:border-border-strong hover:bg-surface-2/70',
        outline: 'border border-border bg-transparent text-foreground hover:border-border-strong hover:bg-surface-2',
        ghost: 'bg-transparent text-muted hover:bg-surface-2 hover:text-foreground',
        accent: 'bg-accent text-accent-foreground shadow-[inset_0_1px_0_rgb(255_255_255/0.25)] hover:opacity-90',
        danger: 'border border-danger/25 bg-danger/12 text-danger hover:bg-danger/20',
        link: 'h-auto px-0 text-foreground underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        'xs': 'h-7 rounded-[8px] px-2.5 text-xs',
        'sm': 'h-8 rounded-[9px] px-3 text-[13px]',
        'md': 'h-10 rounded-[10px] px-4 text-sm',
        'lg': 'h-12 rounded-[12px] px-6 text-[15px]',
        'icon': 'size-9 rounded-[10px]',
        'icon-sm': 'size-8 rounded-[9px]',
      },
      pill: {
        true: 'rounded-full',
        false: '',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>

export const badgeVariants = cva(
  'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium leading-4 tracking-wide',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface-2 text-muted',
        accent: 'border-accent/30 bg-accent/12 text-accent-ink',
        success: 'border-success/25 bg-success/10 text-success',
        warning: 'border-warning/25 bg-warning/10 text-warning',
        danger: 'border-danger/25 bg-danger/10 text-danger',
        info: 'border-info/25 bg-info/10 text-info',
        muted: 'border-border bg-transparent text-muted',
        solid: 'border-transparent bg-primary text-primary-foreground',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type BadgeVariants = VariantProps<typeof badgeVariants>

export const inputClass = 'flex h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(var(--shadow-color)/0.06)] transition-[border-color,box-shadow] duration-150 placeholder:text-muted/70 hover:border-border-strong focus-visible:border-foreground/40 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-foreground/8 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-danger/60 aria-[invalid=true]:ring-danger/10'

/** Superficie flotante para popovers, menús y selects. */
export const floatingClass = 'z-50 surface-elevated p-1 text-sm text-foreground outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-[0.97] data-[state=open]:zoom-in-[0.97] data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1'
