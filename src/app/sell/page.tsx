import { getCategories } from "@/services/categories";
import { getCurrentUser } from "@/lib/auth/session";
import { SellWizard } from "./SellWizard";

export const metadata = { title: "Post an ad" };

/** Sell entry — loads category schema, renders the client wizard. */
export default async function SellPage() {
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);
  return (
    <SellWizard
      userId={user?.id ?? null}
      categories={categories.map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon ?? "📦" }))}
      profileLocation={{
        city: user?.city ?? "",
        district: user?.district ?? "",
        neighborhood: user?.neighborhood ?? "",
      }}
    />
  );
}
