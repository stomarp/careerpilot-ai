import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This page will be built in the next frontend feature branch.
          </p>
        </CardContent>
      </Card>
    </AppShell>
  );
}
