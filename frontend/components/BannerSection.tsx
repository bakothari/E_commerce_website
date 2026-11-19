const heights: Record<string, string> = {
    small: "min-h-[8rem]",
    medium: "min-h-[12rem] md:min-h-[16rem]",
    big: "min-h-[16rem] md:min-h-[24rem]",
    hero: "min-h-[20rem] md:min-h-[32rem]",
};

const textStyles = `[&_h1]:mb-2 [&_h1]:text-3xl [&_h1]:font-extrabold md:[&_h1]:text-5xl
    [&_h2]:mb-2 [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:text-xl [&_h3]:font-bold
    [&_p]:mb-2 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6`;

export default async function BannerSection() {
  let banners: any[] = [];
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/public/banners`, {
            cache: "no-store",
        });
        if (res.ok) banners = (await res.json()).banners ?? [];
    } catch {
        return null;
        
    }
    if (banners.length === 0) return null;

    return (
        <div className="mx-auto max-w-6xl space-y-4 px-4 pt-6">
            {banners.map((b: any) => {
                const isImage = b.type === "image" && b.image;

                const inner = (
                    <div
                        style={{
                            background: isImage ? undefined : b.backgroundColor,
                            color: b.textColor,
                            textAlign: b.textAlign,
                        }}
                        className={`relative flex w-full items-center overflow-hidden rounded-2xl shadow-sm ${heights[b.size] ?? heights.medium}`}
                    >
                        {isImage && (
                            <>
                                <img
                                    src={b.image}
                                    alt={b.name}
                                    className="absolute inset-0 h-full w-full object-cover"
                                />
                                {b.content && <div className="absolute inset-0 bg-black/35" />}
                            </>
                        )}
                        {b.content && (
                            <div
                                className={`relative w-full px-6 py-8 md:px-12 ${textStyles}`}
                                dangerouslySetInnerHTML={{ __html: b.content }}
                            />
                        )}
                    </div>
                );

                return b.link ? (
                    <a key={b._id} href={b.link} className="block transition hover:opacity-95">
                        {inner}
                    </a>
                ) : (
                    <div key={b._id}>{inner}</div>
                );
            })}
        </div>
    );
}