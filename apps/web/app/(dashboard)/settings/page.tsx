import Link from "next/link";
import { PageHeader } from "@/components/features/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your workspace settings"
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/settings/team">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Team</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage team members and roles
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/settings/billing">
          <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Manage subscription and payment methods
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
