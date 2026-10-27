---
name: Linked-secret visibility
description: Interpreting secret-existence metadata when the app uses linked Account Secrets.
---

A negative secret-existence check is not sufficient evidence that a linked Account Secret has been removed.

**Why:** A metadata check reported a credential absent after its duplicate Project Secret was deleted, while the user confirmed that the retained Account Secret was still linked. The metadata result did not independently establish the link state or runtime availability.

**How to apply:** Confirm the app's Linked Account Secrets entry before recommending restoration. Do not recreate a duplicate Project Secret solely to satisfy the metadata check, and never request the credential value in chat. If actual availability matters, verify the affected app behavior without exposing credentials.
