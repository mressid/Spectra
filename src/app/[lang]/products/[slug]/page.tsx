import type { Metadata } from "next";
import { Star } from "lucide-react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductView } from "@/components/product/ProductView";
import { getProductBySlug, getProductDetails, getRelatedProducts, getReviews, getSitemap, getStoreSettings } from "@/lib/api/catalog";
import type { Language } from "@/lib/api/client";
import { richTextToHtml } from "@/lib/html";
import { alternates } from "@/lib/i18n";
import { getWords } from "@/lib/words";

// every visible product is built ahead; new ones are built on their first visit
export async function generateStaticParams() {
    const { products } = await getSitemap();
    return products.length ? products.map((product) => ({ slug: product.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
    const { lang, slug } = await params;
    const product = await getProductBySlug(slug);
    if (!product) return {};
    const description = (product.seoDescription ?? product.shortDescription ?? "").slice(0, 160) || undefined;
    return {
        title: product.seoTitle ?? product.name,
        description,
        alternates: alternates(lang as Language, `/products/${product.slug}`),
        openGraph: { title: product.seoTitle ?? product.name, description, images: product.thumbnailUrl ? [product.thumbnailUrl] : [], type: "website" },
    };
}

const SCHEMA_AVAILABILITY = { IN_STOCK: "https://schema.org/InStock", ON_ORDER: "https://schema.org/PreOrder", OUT_OF_STOCK: "https://schema.org/OutOfStock" };

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[slug]">) {
    const { lang: code, slug } = await params;
    const lang = code as Language;
    const words = getWords(lang);
    const product = await getProductBySlug(slug);
    if (!product) notFound();
    const [details, related, reviews, settings] = await Promise.all([
        getProductDetails(product.id),
        getRelatedProducts(product.id),
        getReviews(product.id),
        getStoreSettings(),
    ]);
    const category = details.categories[0];
    const site = process.env.SITE_URL ?? "http://localhost:3000";
    const rating = reviews.length ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : null;
    const descriptionHtml = richTextToHtml(product.description, product.descriptionFormat);

    return (
        <>
            <Breadcrumb
                lang={lang}
                crumbs={[
                    ...(category ? [{ name: category.name, path: `/categories/${category.slug}` }] : []),
                    { name: product.name, path: `/products/${product.slug}` },
                ]}
            />
            <ProductView
                lang={lang}
                product={product}
                variants={details.variants}
                optionGroups={details.optionGroups}
                photos={details.photos}
                delivery={{ fee: settings.deliveryFee, freeFrom: settings.freeDeliveryThreshold ?? null }}
            />

            {descriptionHtml && (
                <section className="mt-16 border-t border-line pt-10">
                    <h2 className="mb-4 text-xl font-bold tracking-tight">{words.description}</h2>
                    <div className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </section>
            )}

            {details.specifications.length > 0 && (
                <section className="mt-12 border-t border-line pt-10">
                    <h2 className="mb-4 text-xl font-bold tracking-tight">{words.specifications}</h2>
                    <dl className="max-w-2xl divide-y divide-line rounded-photo border border-line text-sm">
                        {details.specifications.map((row) => (
                            <div key={row.name} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-3">
                                <dt className="text-muted">{row.name}</dt>
                                <dd className="font-medium">{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {product.contentBlocks.length > 0 && (
                <section className="mt-12 space-y-8 border-t border-line pt-10">
                    <h2 className="text-xl font-bold tracking-tight">{words.more}</h2>
                    {product.contentBlocks.map((block, index) =>
                        block.type === "TEXT" ? (
                            <div key={index} className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: richTextToHtml(block.content, block.format ?? "MARKDOWN") }} />
                        ) : block.type === "IMAGE" && block.url ? (
                            <figure key={index}>
                                <div className="relative aspect-video overflow-hidden rounded-photo bg-surface">
                                    <Image src={block.url} alt={block.caption ?? product.name} fill sizes="(min-width:1152px) 1152px, 100vw" className="object-cover" />
                                </div>
                                {block.caption && <figcaption className="mt-2 text-sm text-muted">{block.caption}</figcaption>}
                            </figure>
                        ) : block.type === "VIDEO" && block.url ? (
                            <VideoBlock key={index} url={block.url} caption={block.caption} />
                        ) : null,
                    )}
                </section>
            )}

            {reviews.length > 0 && rating != null && (
                <section className="mt-12 border-t border-line pt-10">
                    <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <h2 className="text-xl font-bold tracking-tight">{words.reviews}</h2>
                        <Stars rating={rating} />
                        <span className="text-sm text-muted tabular-nums">{rating.toFixed(1)} · {words.reviewCount(reviews.length)}</span>
                    </div>
                    <ul className="grid gap-4 sm:grid-cols-2">
                        {reviews.map((review) => (
                            <li key={review.id} className="rounded-photo border border-line p-4">
                                <Stars rating={review.rating} />
                                {review.title && <p className="mt-2 font-semibold">{review.title}</p>}
                                {review.body && <p className="mt-1 text-sm leading-relaxed text-muted">{review.body}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {related.length > 0 && (
                <section className="mt-12 border-t border-line pt-10">
                    <h2 className="mb-6 text-xl font-bold tracking-tight">{words.related}</h2>
                    <ProductGrid lang={lang} products={related.slice(0, 8)} priorityCount={0} />
                </section>
            )}

            <JsonLd
                data={{
                    "@context": "https://schema.org",
                    "@type": "Product",
                    name: product.name,
                    description: product.seoDescription ?? product.shortDescription ?? undefined,
                    image: [product.thumbnailUrl, ...details.photos.map((photo) => photo.url)].filter(Boolean),
                    sku: details.variants[0]?.sku,
                    offers: details.variants.map((variant) => ({
                        "@type": "Offer",
                        sku: variant.sku,
                        price: variant.price.toFixed(3),
                        priceCurrency: "TND",
                        availability: SCHEMA_AVAILABILITY[variant.availabilityStatus],
                        url: `${site}/products/${product.slug}`,
                    })),
                    ...(rating ? { aggregateRating: { "@type": "AggregateRating", ratingValue: rating.toFixed(1), reviewCount: reviews.length } } : {}),
                }}
            />
        </>
    );
}

/** Five stars, filled up to the rating (rounded to the nearest half is not needed for 1–5 reviews). */
function Stars({ rating }: { rating: number }) {
    return (
        <span className="flex gap-0.5 text-order" role="img" aria-label={`${rating.toFixed(1)} / 5`}>
            {[1, 2, 3, 4, 5].map((value) => (
                <Star key={value} size={16} aria-hidden fill={value <= Math.round(rating) ? "currentColor" : "none"} strokeWidth={1.6} />
            ))}
        </span>
    );
}

/** YouTube and Vimeo as their players (loaded lazily), any other link as a video file. */
function VideoBlock({ url, caption }: { url: string; caption?: string }) {
    const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    const embed = youtube ? `https://www.youtube-nocookie.com/embed/${youtube[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null;
    return (
        <figure>
            <div className="relative aspect-video overflow-hidden rounded-photo bg-ink">
                {embed ? (
                    <iframe src={embed} title={caption ?? "Video"} loading="lazy" allowFullScreen className="absolute inset-0 h-full w-full" />
                ) : (
                    <video src={url} controls preload="none" className="h-full w-full" />
                )}
            </div>
            {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
        </figure>
    );
}
