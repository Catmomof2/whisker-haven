<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Staff screens live under src/routes/_authenticated (gate checks the staff role); staff server functions use requireStaff from src/lib/staff.ts — public pages (/adopt, /auth) only call narrow public functions so applicant data never leaks.
- Rescue access uses one protected shelter membership per account; requireStaff resolves it server-side and operational queries use the authenticated RLS client, preventing cross-rescue access.
- Public adoption reads and submissions use narrow database functions through a publishable client; notifications alone use privileged access after resolving the destination rescue.
- Signup creates a rescue or consumes an email-bound expiring invitation atomically; existing records remain assigned to the original rescue.
- Signup and staff invitation emails return to the public confirmation page on the published app; staff invitations use managed auth email with invitation metadata so recipients choose their own password without a custom sender domain.
