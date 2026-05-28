import { LucideIcon } from "lucide-react";

export function StatCard({
  title,
  value,
  detail,
  icon: Icon
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-tinta/60">{title}</p>

          <p className="mt-2 text-3xl font-black">{value}</p>
        </div>

        <div className="rounded-xl bg-rosaClaro/40 p-3 text-magenta">
          <Icon size={26} />
        </div>
      </div>

      <p className="mt-4 text-xs font-semibold text-tinta/55">
        {detail}
      </p>
    </div>
  );
}