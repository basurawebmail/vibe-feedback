import { redirect } from "next/navigation";

interface HomeProps {
  searchParams: Promise<{ code?: string; token_hash?: string; type?: string; next?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;

  // If Supabase redirected here with a PKCE code or token_hash, forward to /auth/confirm
  if (params.code) {
    const nextPath = params.next ? `&next=${params.next}` : "";
    redirect(`/auth/confirm?code=${params.code}${nextPath}`);
  }

  if (params.token_hash && params.type) {
    redirect(`/auth/confirm?token_hash=${params.token_hash}&type=${params.type}`);
  }

  redirect("/dashboard");
}

