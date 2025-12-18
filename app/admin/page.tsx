import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminDashboard } from "@/components/admin/dashboard"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  // If Supabase isn't ready yet, don't redirect-loop
  if (!user) {
    redirect("/admin/login?reason=unauth")
  }

  return <AdminDashboard userEmail={user?.email ?? ""} />
}
