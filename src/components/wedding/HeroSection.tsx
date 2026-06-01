type HeroSectionProps = {
  coupleNames: string;
  weddingDate: string;
  location: string;
  heroImageUrl?: string | null;
};

export function HeroSection({
  coupleNames,
  weddingDate,
  location,
  heroImageUrl,
}: HeroSectionProps) {
  return (
    <section className="text-center px-6">
      {heroImageUrl && (
        <div className="mb-10 mx-auto max-w-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImageUrl}
            alt="Couple"
            className="w-full aspect-[4/3] object-cover"
          />
        </div>
      )}

      <p className="section-title text-charcoal mb-2">The</p>
      <h1
        className="font-[family-name:var(--font-great-vibes)] text-6xl md:text-8xl text-charcoal leading-none mb-2"
        style={{ fontFamily: "var(--font-great-vibes)" }}
      >
        Wedding
      </h1>
      <p className="section-title text-charcoal mb-6">of</p>
      <h2 className="heading-spaced text-lg md:text-xl font-semibold mb-6">
        {coupleNames}
      </h2>
      <p className="section-title text-muted text-[0.65rem] md:text-xs">
        {weddingDate} &bull; {location}
      </p>
    </section>
  );
}
