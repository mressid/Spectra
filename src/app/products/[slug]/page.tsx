import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd } from "@/components/JsonLd";
import { ProductGrid } from "@/components/ProductGrid";
import { ProductView } from "@/components/product/ProductView";
import { getProductBySlug, getProductDetails, getRelatedProducts, getReviews, getSitemap, getStoreSettings } from "@/lib/api/catalog";
import { richTextToHtml } from "@/lib/html";
import { words } from "@/lib/words";

// every visible product is built ahead; new ones are built on their first visit
export async function generateStaticParams() {
    const { products } = await getSitemap();
    return products.length ? products.map((product) => ({ slug: product.slug })) : [{ slug: "-" }];
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
    const product = await getProductBySlug((await params).slug);
    if (!product) return {};
    const description = (product.seoDescription ?? product.shortDescription ?? "").slice(0, 160) || undefined;
    return {
        title: product.seoTitle ?? product.name,
        description,
        alternates: { canonical: `/products/${product.slug}` },
        openGraph: { title: product.seoTitle ?? product.name, description, images: product.thumbnailUrl ? [product.thumbnailUrl] : [], type: "website" },
    };
}

const SCHEMA_AVAILABILITY = { IN_STOCK: "https://schema.org/InStock", ON_ORDER: "https://schema.org/PreOrder", OUT_OF_STOCK: "https://schema.org/OutOfStock" };

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
    const product = await getProductBySlug((await params).slug);
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
                crumbs={[
                    ...(category ? [{ name: category.name, href: `/categories/${category.slug}` }] : []),
                    { name: product.name, href: `/products/${product.slug}` },
                ]}
            />
            <ProductView
                product={product}
                variants={details.variants}
                optionGroups={details.optionGroups}
                photos={details.photos}
                delivery={{ fee: settings.deliveryFee, freeFrom: settings.freeDeliveryThreshold ?? null }}
            />

            {descriptionHtml && (
                <section className="mt-12 border-t border-line pt-8">
                    <h2 className="mb-3 text-lg font-semibold">{words.description}</h2>
                    <div className="prose-store max-w-3xl" dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                </section>
            )}

            {details.specifications.length > 0 && (
                <section className="mt-10 border-t border-line pt-8">
                    <h2 className="mb-3 text-lg font-semibold">{words.specifications}</h2>
                    <dl className="grid max-w-2xl grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                        {details.specifications.map((row) => (
                            <div key={row.name} className="contents">
                                <dt className="text-muted">{row.name}</dt>
                                <dd>{row.value}</dd>
                            </div>
                        ))}
                    </dl>
                </section>
            )}

            {product.contentBlocks.length > 0 && (
                <section className="mt-10 space-y-6 border-t border-line pt-8">
                    <h2 className="text-lg font-semibold">{words.more}</h2>
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

            {reviews.length > 0 && (
                <section className="mt-10 border-t border-line pt-8">
                    <h2 className="mb-4 text-lg font-semibold">
                        {words.reviews} · {"★".repeat(Math.round(rating ?? 0))} {rating?.toFixed(1)} ({reviews.length})
                    </h2>
                    <ul className="max-w-2xl space-y-5">
                        {reviews.map((review) => (
                            <li key={review.id}>
                                <p className="text-sm" aria-label={`${review.rating} / 5`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p>
                                {review.title && <p className="font-medium">{review.title}</p>}
                                {review.body && <p className="text-sm text-muted">{review.body}</p>}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {related.length > 0 && (
                <section className="mt-10 border-t border-line pt-8">
                    <h2 className="mb-5 text-lg font-semibold">{words.related}</h2>
                    <ProductGrid products={related.slice(0, 8)} priorityCount={0} />
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

/** YouTube and Vimeo as their players (loaded lazily), any other link as a video file. */
function VideoBlock({ url, caption }: { url: string; caption?: string }) {
    const youtube = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{6,})/);
    const vimeo = url.match(/vimeo\.com\/(\d+)/);
    const embed = youtube ? `https://www.youtube-nocookie.com/embed/${youtube[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : null;
    return (
        <figure>
            <div className="relative aspect-video overflow-hidden rounded-photo bg-ink">
                {embed ? (
                    <iframe src={embed} title={caption ?? "Vidéo"} loading="lazy" allowFullScreen className="absolute inset-0 h-full w-full" />
                ) : (
                    <video src={url} controls preload="none" className="h-full w-full" />
                )}
            </div>
            {caption && <figcaption className="mt-2 text-sm text-muted">{caption}</figcaption>}
        </figure>
    );
}
