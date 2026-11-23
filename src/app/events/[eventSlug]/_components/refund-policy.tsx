interface RefundPolicyProps {
  refundPolicy: string;
}

export default function RefundPolicy({ refundPolicy }: RefundPolicyProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-semibold">İptal ve iade politikası</h2>
      <p className="wrap-break-word whitespace-pre-line text-muted-foreground">{refundPolicy}</p>
    </section>
  );
}
