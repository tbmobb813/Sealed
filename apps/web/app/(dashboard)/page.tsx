import { PageHeader } from "@/components/features/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityFeed } from "@/components/features/shared/activity-feed";
import { apiClient } from "@/lib/api-client";
import type { ActivityEvent } from "@sealed/types";

export default async function DashboardPage() {
  let events: ActivityEvent[] = [];

  try {
    const response = await apiClient<{ data: ActivityEvent[] }>("/activity");
    events = response.data;
  } catch {
    // Activity feed is non-critical — dashboard still renders without it
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your proposals, agreements, and invoices"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Open Proposals", value: "—" },
          { title: "Pending Agreements", value: "—" },
          { title: "Outstanding Invoices", value: "—" },
          { title: "Active Proposals", value: "—" },
        ].map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ActivityFeed events={events} />
        </CardContent>
      </Card>
    </div>
  );
}
