# Accessibility Statement — Whisker Haven

**Last updated:** November 10, 2026

## Our commitment

Whisker Haven is a mobile app for adult cat rescue and shelter operations —
intake and cat profiles, health and medical tracking, a shelter workflow
board, a daily operations checklist, and an adoption application queue, plus
public adoption pages for adopters.

We want staff, volunteers, and adopters to be able to use it, including
people who use a keyboard, a screen reader, magnification, or other
assistive technology. Accessibility is part of how we judge whether a
feature is finished, not an afterthought.

## Standard we aim for

We aim to meet **WCAG 2.2 Level AA** (Web Content Accessibility Guidelines,
version 2.2, conformance level AA).

We have **not yet had a formal accessibility audit**, and we have not yet
completed structured testing with screen readers. This statement describes
what is in place today and what we know still needs work — it is not a
claim that the app already fully meets WCAG 2.2 AA.

## What is in place today

- **Keyboard access:** Interactive elements are built on Radix UI
  primitives, which provide keyboard interaction and visible focus
  indicators. The workflow board can be operated with its Previous stage /
  Next stage buttons — moving a cat between stages does not require
  dragging.
- **Labels:** Form fields use visible labels or `aria-label`s, including
  the sign-in, sign-up, intake, and staff invitation forms. Icon-only
  buttons (for example Settings, New application, Close, and Sign out)
  carry `aria-label`s.
- **Status is not shown by colour alone:** Cat status badges carry text
  labels — Available, Medical Hold, Priority, and similar — alongside
  their colours.
- **Cat photos:** Photos of cats on the dashboard and public adoption
  pages use the cat's name as alt text, so a screen reader can identify
  whose photo it is.
- **Mobile layout:** The app is mobile-optimised, with bottom tab
  navigation (Dashboard, Cats, Tasks, Applications) and large touch
  targets for the main actions.

## Known limitations

We are aware of the following, and they are on our list to fix:

- **No formal audit or structured screen-reader testing yet.** Until
  that happens, some barriers may still be undiscovered.
- **New-cat photo preview:** While a photo is being uploaded on the
  intake form, its preview currently has the generic alt text "Preview"
  rather than identifying the cat.
- **Colour contrast:** The terracotta accent (#E07A5F) on warm cream
  backgrounds has not yet been formally checked against WCAG contrast
  ratios in every place it is used for text.
- **Reduced motion and text scaling:** We have not yet verified behaviour
  for users who prefer reduced motion or who use large text / zoom.

If you find anything else, please tell us — see Feedback below.

## Feedback

If you hit a barrier using Whisker Haven, or you have a suggestion for
making it easier to use, please email:

**hinesa751@gmail.com**

It helps if you include:

- the page or feature where you hit the problem (for example, the
  adoption page, the intake form, or the workflow board);
- what you were trying to do;
- the device, browser, and assistive technology you were using, if you
  know them.

We will review every report and prioritise fixes, starting with barriers
that prevent someone from completing a task — such as submitting an
adoption application, recording medication, or moving a cat through the
workflow.

## Review

We review this statement when we add or change a feature, and after any
accessibility testing or audit, and update it to reflect what has changed.
