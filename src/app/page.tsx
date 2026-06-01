import { SiteHeader } from "@/components/wedding/SiteHeader";
import { HeroSection } from "@/components/wedding/HeroSection";
import { SectionDivider } from "@/components/wedding/SectionDivider";
import { RsvpForm } from "@/components/wedding/RsvpForm";
import { BankingSection } from "@/components/wedding/BankingSection";
import { getPublicSiteData } from "@/lib/site-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { settings, meals, dietary, banking } = await getPublicSiteData();

  const site = settings ?? {
    initials: "J & Y",
    coupleNames: "JORDAN & YOSSEF",
    weddingDate: "NOVEMBER 21, 2026",
    location: "FRANSCHHOEK, SOUTH AFRICA",
    heroImageUrl: null,
    rsvpHeading: "RSVP",
    bankingHeading: "GIFTING",
  };

  return (
    <main className="min-h-screen pb-20">
      <SiteHeader initials={site.initials} />
      <HeroSection
        coupleNames={site.coupleNames}
        weddingDate={site.weddingDate}
        location={site.location}
        heroImageUrl={site.heroImageUrl}
      />
      <SectionDivider />
      <RsvpForm heading={site.rsvpHeading} meals={meals} dietary={dietary} />
      {banking && (
        <>
          <SectionDivider />
          <BankingSection heading={site.bankingHeading} banking={banking} />
        </>
      )}
      <footer className="text-center pt-16 pb-8">
        <p className="section-title text-muted text-[0.55rem]">
          {site.initials}
        </p>
      </footer>
    </main>
  );
}
