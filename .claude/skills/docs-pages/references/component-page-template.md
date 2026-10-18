# Component page template

Every component page in `apps/docs` follows this order. DOM order is reading order is the contents list. A section with no content is left out, heading and all, unless the table says otherwise.

```
=== Page header ===
h1   Component title
     Component description          one or two plain sentences: what it is, what it does for the user
     Facts: APG pattern             only when one applies
     Facts: Status                  derived word and tier counts from the AT test record, never typed

=== Page content ===
h2   When to use it                 2–5 bullets: when, where, when not (each "not" links the right component)
h2   Example                        the component alone, defaults, then its code
h2   Use cases
h3     <Use case name>              the task, in plain words
         Description                when and why, one or two sentences
         Example + code block
h3     <Use case 2 … 8>

=== Accessibility ===
h2   Accessibility
h3     What it does for you         what the component handles: roles, names, states, native elements
h3     What you need to do          the contract's consumer responsibilities, as instructions
h3     Visual and modes             contrast, focus indicator, forced colours, reduced motion, zoom and reflow, target size
h3     Focus management             where focus goes, and when
h3     WCAG success criteria        number, name, level, and one sentence each on what it means here

h2   Keyboard                       every key, from the contract. Never left out: no keys says so
h2   Announcements                  only when the component announces through the Announcer
h2   API reference                  one h3 per part, the hook, Strings

h2   Known issues                   only when the contract lists any
h2   Testing                        the last section, after everything else: what the automated tests prove, then the AT matrix: each row as recorded (pass, agent-verified, n/a with its reason, or pending)
```

Announcements and API reference come after Keyboard. Known issues and Testing close the page, in that order: Testing is always the last `h2`.

## Section rules

| Section               | Must                                                                                                                                                                                                                             | Must not                                                                                                                                                                                                                                          |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Component description | Say what it does for the person using the service                                                                                                                                                                                | Repeat the title, list props                                                                                                                                                                                                                      |
| When to use it        | Name at least one case where you should not use it, and the alternative                                                                                                                                                          | Restate the description                                                                                                                                                                                                                           |
| Use case              | Be a real public-service task, show something the main example doesn't, run, use only documented props                                                                                                                           | Use lorem ipsum, hard-coded strings, or an inaccessible pattern                                                                                                                                                                                   |
| What you need to do   | Be instructions the reader can act on and check                                                                                                                                                                                  | Be a duplicate of What it does for you                                                                                                                                                                                                            |
| Visual and modes      | Name what the default theme provides and what the adopter must keep if they restyle                                                                                                                                              | State theme values (the threshold, not the token)                                                                                                                                                                                                 |
| WCAG success criteria | List only criteria the component contributes to, each verified                                                                                                                                                                   | Say the component "meets" or "complies with" anything alone                                                                                                                                                                                       |
| Testing               | Say what the automated tests prove, and show each AT matrix row as it is recorded: `pass` (Automated: agent check; Core and Release: agent and human check), `agent-verified` (tests only), `n/a` (with its reason) or `pending` | Call `agent-verified` tested with a screen reader, or show a pass without both checks. A `### What to check` list is allowed here, for interactive components only: 3–6 plain checks, a script and not a result, with no dates, names or outcomes |
| Keyboard              | Equal the contract's Keyboard table (a build check)                                                                                                                                                                              | Add keys the component doesn't handle                                                                                                                                                                                                             |
| Known issues          | Say who is affected, how, and the workaround                                                                                                                                                                                     | Hide a known gap                                                                                                                                                                                                                                  |

## Checklist

- [ ] Header has title, description, APG pattern (or none, when no pattern applies); the derived status (word and counts) comes from the table and is never typed; no other status, maturity or "yet" wording anywhere on the page
- [ ] `pattern` is set whenever the contract names an APG pattern: "APG <Pattern>", plus the variant in brackets when the APG has several ("APG Combobox (editable, list autocomplete)")
- [ ] Sections in the order above; no empty heading
- [ ] 2–8 use cases, each with a name, a description and code
- [ ] Every claim has a verdict, and none is `unverified` on the page
- [ ] Plain-language pass done; terms explained on first use
- [ ] No "compliant", "certified", "fully accessible"
