import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  shimmer?: boolean;
  strong?: boolean;
}

const GlassCard = ({ children, className, onClick, shimmer, strong }: GlassCardProps) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-[20px] relative overflow-hidden p-4",

        strong
          ? "bg-white/35 backdrop-blur-[32px] border border-white/50 shadow-[0_8px_32px_rgba(120,60,180,0.15),inset_0_1px_0_rgba(255,255,255,0.7)]"
          : "bg-white/20 backdrop-blur-[28px] border border-white/35 shadow-[0_6px_24px_rgba(120,60,180,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]",

        shimmer && "shimmer-bar",

        onClick && "cursor-pointer transition-all duration-200 hover:bg-white/32 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.97]",

        className
      )}
    >
      {/* Top highlight */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent" />
      {children}
    </div>
  );
};

export default GlassCard;
