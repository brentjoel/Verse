# 0001 Guest-only, no accounts

Status: accepted (2026-11)

## Decision
Everyone uses Selah Sky as a guest. There is no sign-up, no sign-in and no server-side user record.

## Why
- Journal notes and feelings are some of the most private things a person writes. The safest copy is the one that does not exist on a server.
- Accounts bring passwords, recovery, breach risk and consent duties that a small noncommercial project should not carry.
- It keeps the product calm: nothing to sign up for before you can be comforted.

## Consequences
- No sync between devices. JSON Export and Import is the backup path.
- Clearing browser data erases records, so the app says so plainly and nudges toward backups.
- Features that need an identity (sharing journals, reminders by email) are out of scope.

## Revisit when
A real need for sync outweighs the privacy cost, and an end-to-end encrypted design is on the table.
