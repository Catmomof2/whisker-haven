# Security Policy — Whisker Haven

**Last updated:** November 10, 2026

## Supported versions

Whisker Haven is under active development. Security fixes are made on
`main` — the latest version on `main` is the only version we support.
If you are running an older checkout or deployment, please update to the
latest `main` first and check whether the issue is still present.

## Reporting a vulnerability

If you find a security vulnerability, please report it privately. **Do not
open a public issue, and do not post details publicly** until the issue
has been fixed.

Email:

**hinesa751@gmail.com**

Please include, as far as you can:

- a description of the vulnerability and what it could allow;
- the page, feature, or component affected (for example, the public
  adoption page, the sign-in / sign-up flow, staff invitations, or the
  workflow board);
- steps to reproduce it, if you have them;
- what data, if any, you were able to access — without including other
  people's personal information in your report.

If you are unsure whether something is a vulnerability, report it anyway.
We would rather hear about it than miss it.

We will review every report and prioritise fixes, starting with issues
that could expose one rescue's data to another rescue, expose applicant
personal information, or allow unauthorised access to staff functions.
We will let you know once a fix is in place. We do not offer a bug
bounty.

## What we already do

- **Per-rescue isolation:** Staff access is checked server-side, and
  operational data is scoped to the rescue the signed-in staff member
  belongs to, so one rescue cannot access another rescue's cats,
  applications, or staff data.
- **Public pages are narrow by design:** The public adoption pages use
  narrow public functions and a publishable client. Applicant data is
  staff-only and is never exposed through the public pages.
- **Invitations expire:** Staff invitations are bound to an email
  address and expire after seven days.
- **Secrets stay server-side:** Service keys and other secrets are held
  as environment variables and are only used server-side. The publishable
  Supabase key used by the browser is not a secret key and does not grant
  staff access on its own.
- **Dependency updates:** Dependabot is enabled for this repository.
  Security updates to dependencies are prioritised over routine updates.

## Responsible disclosure — please

- Only test against a rescue account you own or have permission to test.
  Do not access, modify, or delete another rescue's data, and do not
  access applicant personal information that is not yours.
- Do not exfiltrate data, disrupt the service, or test against other
  people's live deployments.
- Give us a reasonable chance to fix an issue before disclosing it.
- Do not include secrets, passwords, or other people's personal
  information in a report. If you find an exposed secret, tell us where
  it is and rotate it if it is yours to rotate.

## Out of scope

The following are not treated as vulnerabilities on their own, unless
you can show a concrete impact on Whisker Haven data or access:

- reports that a dependency has a known vulnerability but is not
  reachable in this app;
- missing security headers or best-practice suggestions without a
  demonstrated impact;
- social engineering, phishing, or physical access;
- issues in third-party services themselves (Supabase, Resend, or the
  hosting platform) — those should be reported to the relevant provider,
  though please still tell us if they affect Whisker Haven.
