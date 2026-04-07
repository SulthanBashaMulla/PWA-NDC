import { cn } from "@/lib/utils";

const GlassCard = ({ children, className, onClick }: any) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl",

        // GLASS BASE
        "bg-white/10 backdrop-blur-2xl",

        // BORDER (important for glass edge)
        "border border-white/20",

        // SHADOW (soft depth)
        "shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]",

        // LIGHT REFLECTION EFFECT
        "before:absolute before:inset-0 before:rounded-2xl before:bg-white/10 before:opacity-30",

        // INTERACTION
        "transition-all duration-300 active:scale-95",

        // POSITION FIX (needed for pseudo element)
        "relative overflow-hidden",

        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;