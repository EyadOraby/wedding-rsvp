type SiteHeaderProps = {
  initials: string;
};

export function SiteHeader({ initials }: SiteHeaderProps) {
  return (
    <header className="pt-10 pb-6 text-center">
      <p className="heading-spaced text-sm md:text-base tracking-[0.25em]">
        {initials}
      </p>
    </header>
  );
}
