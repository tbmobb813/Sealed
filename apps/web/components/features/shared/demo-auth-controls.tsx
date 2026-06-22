import { DEMO_USER } from "@/lib/demo";

export function DemoAuthControls() {
  return (
    <div className="space-y-1 text-sm">
      <p className="font-medium">{DEMO_USER.name}</p>
      <p className="text-muted-foreground">{DEMO_USER.email}</p>
      <p className="text-xs text-amber-600">Demo mode</p>
    </div>
  );
}
