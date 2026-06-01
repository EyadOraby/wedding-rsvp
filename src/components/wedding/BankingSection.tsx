import { SectionDivider } from "./SectionDivider";

type BankingInfo = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  branchCode: string;
  notes?: string | null;
};

type BankingSectionProps = {
  heading: string;
  banking: BankingInfo;
};

export function BankingSection({ heading, banking }: BankingSectionProps) {
  const rows = [
    { label: "Account name", value: banking.accountName },
    { label: "Bank", value: banking.bankName },
    { label: "Account number", value: banking.accountNumber },
    { label: "Branch code", value: banking.branchCode },
  ];

  return (
    <section className="px-6 max-w-lg mx-auto w-full">
      <h2 className="heading-spaced text-center text-xl md:text-2xl font-medium mb-8">
        {heading}
      </h2>
      <SectionDivider />
      <div className="bg-card mt-8 rounded-sm shadow-sm border border-black/5 p-8 md:p-10 space-y-5">
        {rows.map((row) => (
          <div key={row.label} className="text-center">
            <p className="section-title text-muted text-[0.6rem] mb-1">
              {row.label}
            </p>
            <p className="text-base md:text-lg tracking-wide">{row.value}</p>
          </div>
        ))}
        {banking.notes && (
          <p className="text-center text-sm text-muted italic pt-2 border-t border-black/10">
            {banking.notes}
          </p>
        )}
      </div>
    </section>
  );
}
