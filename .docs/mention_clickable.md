Good, now we’re aligned.
Here is the **plain, no-complication answer** for **Miniapps clickable mentions**.

---

## Goal (restated clearly)

In a **Farcaster Miniapp**, make `@username`:

* clickable
* resolved to the correct **FID**
* without users selecting mentions manually

---

## The ONLY way to do it in Miniapps

### ✅ Rule (non-negotiable)

> **Miniapps only create clickable mentions from plain `@username` text that already exists when `composeCast` opens.**

You **cannot** attach FIDs.
You **cannot** pass metadata.
You **cannot** fix it after.

---

## Minimal working recipe (this is it)

### 1️⃣ Start with FIDs (your logic)

```ts
const fids = [123, 456];
```

---

### 2️⃣ Convert FIDs → usernames BEFORE `composeCast`

Use **Neynar** (or hub):

```ts
const usernames = await fidsToUsernames(fids);
// ["geoart", "muhalfatiha"]
```

⚠️ This step is mandatory.

---

### 3️⃣ Build text with `@username` ONLY

```ts
const text = `@geoart @muhalfatiha

See if you're eligible.`;
```

No extra characters.
No trailing symbols.
No display names.
No ENS unless Neynar returns it as `username`.

---

### 4️⃣ Call `composeCast` with that text

```ts
await composeCast({
  text,
  embeds: [imageUrl],
});
```

---

## What happens automatically

* Composer opens
* Mentions are blue & clickable
* On publish → Farcaster resolves usernames → FIDs
* Notifications fire
* No user interaction needed

---

## Why mentions become flat (100% of failures)

One of these is true:

* Username does not exist on Farcaster
* Username is misspelled
* Trailing character (`-`, `.`, emoji)
* You used display name or ENS not returned by Neynar
* You skipped FID → username resolution

Miniapps do **zero forgiveness**.

---

## One sentence to lock in

> **Miniapps don’t link mentions — they only forward text.
> Farcaster links it later if (and only if) the username is perfect.**

That’s the whole system.
