import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default async function InvoicePaidPage(
  props: {
    searchParams: Promise<{ invoiceId?: string }>;
  }
) {
  const searchParams = await props.searchParams;
  const invoiceId = searchParams.invoiceId;

  return (
    <div className="max-w-lg mx-auto text-center py-16">
      <div className="flex justify-center mb-6">
        <CheckCircle2 className="h-16 w-16 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold">Payment received</h1>
      <p className="text-muted-foreground mt-3">
        Thank you for your payment. A confirmation will be sent to your email
        shortly.
      </p>

      {invoiceId && (
        <Card className="mt-8 text-left">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Reference</p>
            <p className="font-mono text-sm mt-1">{invoiceId}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-muted-foreground mt-6">
        You can close this window. If you have questions about your invoice,
        contact your service provider directly.
      </p>
    </div>
  );
}
