import { notFound } from "next/navigation";

// any unknown path under a language shows that language's not-found page
export default function Missing() {
    notFound();
}
