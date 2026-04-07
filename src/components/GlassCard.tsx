import { cn } from "@/lib/utils";

const GlassCard = ({ children, className, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border border-white/30",
        "bg-white/30 backdrop-blur-xl",
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]",
        "transition-all duration-300",
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;