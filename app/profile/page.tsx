import { PageLayout } from "@/app/components/ui/PageLayout";
import { ProfileForm } from "@/app/components/profile/ProfileForm";
import { getUserProfile } from "@/lib/actions/user";

export default async function ProfilePage() {
  const user = await getUserProfile();

  return (
    <PageLayout title="Profile & Settings">
      <ProfileForm initialData={user} />
    </PageLayout>
  );
}
