type SectionTitleProps = {
    eyebrow?: string;
    title: string;
    description?: string;
};

export function SectionTitle({
    eyebrow,
    title,
    description,
}: SectionTitleProps) {
    return (
        <div className="max-w-2xl">
            {eyebrow && (
                <p className="mb-3 text-xs uppercase tracking-[0.2em] text-neutral-500">
                    {eyebrow}
                </p>
            )}

            <h2 className="font-serif text-3xl tracking-tight text-neutral-900 sm:text-4xl">
                {title}
            </h2>

            {description && (
                <p className="mt-4 text-sm leading-6 text-neutral-600 sm:text-base">
                    {description}
                </p>
            )}
        </div>
    );
}