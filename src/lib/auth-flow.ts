export const PUBLIC_APP_ORIGIN = "https://purrposeful-shelter-hub.lovable.app";

export function confirmationUrl(invite?: string) {
  const url = new URL("/auth/confirm", PUBLIC_APP_ORIGIN);
  if (invite) url.searchParams.set("invite", invite);
  return url.href;
}