type ImagePlaceholderProps = {
    label: string;
    aspect?: "square" | "portrait" | "wide";
    className?: string;
};

const aspectClasses = {
    square: "aspect-square",
    portrait: "aspect-[4/5]",
    wide: "aspect-[16/9]",
};

export function ImagePlaceholder({
    label,
    aspect = "square",
    className = "",
}: ImagePlaceholderProps) {
    return (
        <div
            role="img"
            aria-label={label}
            className={`${aspectClasses[aspect]} ${className} flex items-center justify-center overflow-hidden rounded-sm border border-neutral-200 bg-neutral-100`}
        >
            <div className="text-center">
                <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="mx-auto h-8 w-8 text-neutral-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                >
                    <path d="M6 3h12l3 5-9 13L3 8z" />
                    <path d="M3 8h18M9 3l3 5 3-5M12 8l-3 13M12 8l3 13" />
                </svg>

                <span className="mt-2 block text-xs text-neutral-400">
                    {label}
                </span>
            </div>
        </div>
    );
}