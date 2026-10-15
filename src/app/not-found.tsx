import Link from "next/link";
import { words } from "@/lib/words";

export default function NotFound() {
    return (
        <div className="py-24 text-center">
            <p className="text-lg">{words.notFound}</p>
            <Link href="/" className="mt-6 inline-block rounded-control bg-ink px-6 py-3 font-semibold text-white">
                {words.backHome}
            </Link>
        </div>
    );
}
