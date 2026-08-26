# Firestore data model

Reference for the collections behind the site, and the one-time setup each
recruiting cycle needs. Rules live in [`../firestore.rules`](../firestore.rules);
indexes in [`../firestore.indexes.json`](../firestore.indexes.json).

## Roles

Roles come from `members/{email}.role`. There is no self-service — an admin
creates the record, and nobody can change their own role.

| Role | Member content | Applications | Admin panel |
|---|---|---|---|
| `admin` | yes | read + write | yes |
| `board` | yes | read + review + set public stage | no |
| `member` | yes | no | no |
| `recruiter` | resume book only | **no** | no |
| _(no record)_ | no | own application only | no |

A signed-in Columbia account with no `members` record is an **applicant**. That
is a normal state, not an error.

**Filing** an application is separate from reading one, and is for people who
are not in the society yet. Anyone holding a `members` record — member, board
or recruiter — is refused by the rules as well as by `/apply`, so skipping the
UI does not skip the check. Admins keep an explicit bypass in the create rule
so a broken or missing application can still be repaired by hand.

> Recruiters are external hiring partners. They must never see applications —
> this is the single most important property of the ruleset.

## Collections

### `config/recruitment`
Publicly readable. The site is a static export, so this doc is the only way to
open or close applications without a full CI rebuild.

| Field | Type | Notes |
|---|---|---|
| `cycle` | string | e.g. `fall-2026`. Forms part of every application's doc ID. |
| `isOpen` | boolean | Manual kill switch, independent of the date. |
| `closesAt` | timestamp | Enforced in rules against `request.time`, not just in the UI. |
| `positions` | array\<string\> | Roles being recruited this cycle. |
| `intro` | string | Optional blurb above the form. |

### `applications/{cycle}_{email}`
The doc ID pins one application per person per cycle, so a resubmission
overwrites rather than duplicating, and re-applying next season is a new doc.

Applicant-written: `name`, `pronouns`, `phone`, `school`, `gradYear`, `major`,
`linkedIn`, `resumeLink`, `positions`, `responses`, `status`, `updatedAt`,
`submittedAt`. Set once at creation and then immutable: `cycle`, `email`.

`status` is `draft` or `submitted`. **Submission is one-way** — the rules refuse
every applicant write once status is `submitted`.

Board-written: `publicStage` — what the applicant is allowed to see.

### `applications/{id}/pipeline/state` — board only
`stage`, `reviewCount`, `averageScore`, `updatedBy`. Held in a subcollection
rather than a field on the application so that moving someone to `rejected` in
the tracker does not reveal the outcome to them before the board has written to
them. The applicant cannot read this.

`publicStage` on the parent is promoted deliberately and separately. Telling
someone where they stand is an act, not a side effect of dragging a card.

### `applications/{id}/reviews/{reviewerEmail}` — board only
`score`, `recommendation`, `notes`. One doc per reviewer, so concurrent reviews
don't clobber each other. A reviewer may only write their own. **Applicants can
never read these**, which is what lets reviewers be candid.

### Others
`members` (directory; own record readable to resolve role), `events` (public),
`tips` / `newsletters` / `internships` (members only), `contact_messages`
(anyone may create, admin-only to read).

## Setting up a cycle

Applications **fail closed**: if `config/recruitment` is missing, nothing is
accepted. Create it in the Firebase console before opening:

```
Collection: config      Document ID: recruitment

cycle      string     fall-2026
isOpen     boolean    true
closesAt   timestamp  <deadline>
positions  array      ["General Member", "Junior Board — Events", ...]
```

### Indexes

Only one composite index is declared, for the tracker's main query
(`cycle` + `status` equality, ordered by `submittedAt`).

The tracker's other query — the collection-group read of `pipeline` filtered by
`cycle` — needs **no** declared index. Firestore indexes every field
automatically at both collection and collection-group scope, and a single
equality filter with no ordering is already covered. Declaring it anyway is
rejected at deploy time with *"this index is not necessary, configure using
single field index controls"*. Add a composite index here only if that query
gains a second filter or an `orderBy`.

Note that the emulator does not enforce index requirements, so `npm test`
passing says nothing about whether indexes are correct — only a real deploy
does.

Then deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

**Deploy rules before or with the app code, never after.** The older ruleset
treated any signed-in user as a member, so shipping code first would expose
member content to applicants.

## Bootstrapping an admin

Self-service admin creation is deliberately closed, so the first admin (or a
recovery after lockout) must be created by hand in the Firebase console:
a doc in `members` whose **ID is the lowercased email**, with `role: "admin"`.

The ID must be lowercase — rules normalise the caller's email to lowercase
before comparing, and a mixed-case doc ID will never match.

## Testing the rules

The ruleset is the only thing standing between a recruiting cycle and either a
lockout or a leak of student PII, so it has a test suite. Run it before every
rules deploy:

```bash
npm test
```

That runs the export unit tests, then boots the Firestore emulator and exercises
49 rules cases across all five roles — including the ones that matter most:
an applicant cannot read another applicant's file, a recruiter cannot see
applications at all, a reviewer cannot write in someone else's name, and nobody
can promote themselves to admin.

The suite is checked against deliberate rule breakage: mutating a rule makes the
corresponding tests fail, so a green run means something.

**Java note.** The emulator needs a JDK. `firebase-tools` is pinned to v13
because v14+ requires Java 21, and this project was set up on a machine with
Java 11. If you upgrade to Java 21 or later, you can unpin it:

```bash
npm install --save-dev firebase-tools@latest
```
