import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AppShell } from "@/components/layout/AppShell";
import { EditProfileForm } from "./EditProfileForm";

export const metadata = { title: "Edit Profile" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/profile/edit");

  return (
    <AppShell>
      <EditProfileForm
        userId={user.id}
        initial={{
          name: user.name ?? "",
          bio: user.bio ?? "",
          avatarUrl: user.avatarUrl ?? null,
          city: user.city ?? "",
          district: user.district ?? "",
          neighborhood: user.neighborhood ?? "",
        }}
      />
    </AppShell>
  );
}
