import { cn } from "@/lib/utils";
import { Category } from "@/types/expense";
import { CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/constants";

interface BadgeProps {
  category: Category;
  size?: "sm" | "md";
}

export default function Badge({ category, size = "md" }: BadgeProps) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
      style={{
        backgroundColor: `${color}18`,
        color: color,
      }}
    >
      <span>{icon}</span>
      {category}
    </span>
  );
}
