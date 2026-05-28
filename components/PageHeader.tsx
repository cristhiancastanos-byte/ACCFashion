export function PageHeader({
  title,
  subtitle
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <header className="mb-6">
      <p className="text-sm font-black uppercase tracking-[0.35em] text-magenta">
        AAC Fashion Boutique
      </p>

      <h2 className="mt-2 text-3xl lg:text-5xl font-black gold-text">
        {title}
      </h2>

      <p className="mt-3 max-w-3xl text-tinta/70">
        {subtitle}
      </p>
    </header>
  );
}