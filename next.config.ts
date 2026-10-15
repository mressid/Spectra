import type { NextConfig } from "next";

// where product photos come from: the store's MinIO bucket (http://localhost:9010 in development)
const media = new URL(process.env.MEDIA_URL ?? "http://localhost:9010");
// other image hosts, comma-separated (the backend's demo data uses picsum.photos); empty in production
const extraHosts = (process.env.EXTRA_IMAGE_HOSTS ?? "").split(",").map((host) => host.trim()).filter(Boolean);

const nextConfig: NextConfig = {
    // NEXT_DIST_DIR lets a second build (tests, an AI assistant) run without replacing the files of a
    // server already running from .next; a rebuild under a running `next start` breaks its pages and actions
    distDir: process.env.NEXT_DIST_DIR ?? ".next",
    // 'use cache' + cacheTag; see docs/RENDERING.md
    cacheComponents: true,
    cacheLife: {
        // catalogue data: refreshed on demand by the store API (POST /api/revalidate), and at most
        // hourly in the background in case a refresh call was missed
        catalog: { stale: 300, revalidate: 3600, expire: 60 * 60 * 24 * 30 },
    },
    images: {
        remotePatterns: [
            {
                protocol: media.protocol.replace(":", "") as "http" | "https",
                hostname: media.hostname,
                port: media.port,
                pathname: "/**",
            },
            ...extraHosts.map((hostname) => ({ protocol: "https" as const, hostname, pathname: "/**" })),
        ],
        formats: ["image/avif", "image/webp"],
        // MinIO on this machine resolves to a private IP; only allowed when the photos really are local
        dangerouslyAllowLocalIP: ["localhost", "127.0.0.1"].includes(media.hostname),
    },
};

export default nextConfig;
