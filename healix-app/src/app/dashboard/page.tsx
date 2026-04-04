import { redirect } from "next/navigation";
import { headers, cookies } from "next/headers";
import { auth } from "@/lib/auth";

export default async function DashboardRedirect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const role = session.user.role;
  
  const roleRoutes: Record<string, string> = {
    PATIENT: "/patient", // Patient dashboard
    DOCTOR: "/doctor", // Doctor dashboard
    HOSPITAL: "/hospital", // Hospital dashboard
    PHARMACY: "/pharmacy", // Pharmacy dashboard
    VENDOR: "/vendor", // Vendor dashboard
  };

  const cookieStore = await cookies();
  const subrole = cookieStore.get("healix_subrole")?.value;

  if (role === "HOSPITAL" && subrole === "NURSE") {
    redirect("/nurse");
  }

  redirect(roleRoutes[role] || "/unauthorized");
}
