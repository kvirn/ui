<!-- kv-lang-ok-file: quotes real Nordic street and place names returned by the geocoder -->

# Kvirn geocoder: data quality report

- **For:** the geo.kvirn.com service (OpenStreetMap import and parsing)
- **From:** KvirnUI, the `AddressInput` street autocomplete and `AddressSearch` (plan 0149)
- **Date:** 2026-10-22 · **Spec:** https://geo.kvirn.com/v1/openapi.json

## How we measured

14 typical queries a resident would type, in Sweden, Norway and Finland, against
`GET /v1/geocode/autocomplete?q=…&country=…&limit=20`. 205 results came back (204 `address`, 1 `street`).
Small sample, but every finding below repeats across queries.

## Findings, most important first

| #   | Finding                                                                                                      | Rate                                                          | Example                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | **Finland returns no addresses at all.** `/v1/regions?country=fi` answers 200, so the country exists.        | 3 of 3 FI queries: `{"results":[]}`                           | `q=Mannerheimintie 10&country=fi`, `q=Hämeenkatu 5 tampere&country=fi`, `q=Esplanadi&country=fi`                 |
| 2   | **Swedish addresses often lack a postal code and town** (`address.postalCode` / `address.city` null).        | SE: 60 % no postal code, 32 % no town, 31 % neither. NO: 0 %. | `q=Storgatan kil` → `"Storgatan 59"` with `{city: null, postalCode: null}`, next to `"Storgatan 41, 665 30 Kil"` |
| 3   | **Identical labels in one answer.** Without a town in the label a resident can't tell them apart.            | 8 duplicate labels in 14 answers                              | `q=Järnvägsgatan 3` → `"Järnvägsgatan 3"` ×4; `q=Drottninggatan 5` → `"Drottninggatan 5"` ×3                     |
| 4   | **A `street` result's `city` is the municipality**, not the postal town.                                     | the 1 street result                                           | `q=Storgatan kil` → `"Storgatan, Kils kommun"`, `address.city: "Kils kommun"` (postal town: Kil)                 |
| 5   | Duplicates that differ only by entrance or are the same building (likely several OSM nodes for one address). | seen in 3 answers                                             | `q=Storgatan 1 umeå` → `"Storgatan 8 B"` ×2, `"Storgatan 10 B"` ×2                                               |

What works well: house-number ranking (the asked number was in the top 3 for all 6 numbered queries), Norway's
completeness, the `precision` field, lower-case `country`, and the labels when the parts are there.

## Why it matters for the form

`AddressInput` fills the street, postal code and town from a pick. With finding 2 a pick fills only the street and
the resident types the rest; with 3 they can't tell which "Järnvägsgatan 3" is theirs; with 4 a pick would write
"Kils kommun" into the **Town** box, which is wrong in a postal address. Finding 1 makes the lookup useless in Finland.

## Requests

1. **Import Finnish addresses** (OSM `addr:*` in Finland, or DVV/Digi- ja väestötietovirasto's building address data,
   which is open).
2. **Fill `postalCode` and `city` for every `address` result** where they can be derived: from the OSM
   `addr:postcode` / `addr:city`, else by point-in-polygon against postal-code areas (SE: open postal-code areas or
   OSM `boundary=postal_code`), and put them in the `label`.
3. **`city` is the postal town, never the municipality**, for `address` and `street` results. Put the municipality in
   the label as context if useful ("Storgatan, Kil (Kils kommun)"), or a separate field.
4. **De-duplicate** results with the same `line1` + `postalCode` + `city` (keep the one with most parts), and never
   return two results with the same `label` in one answer: when parts are missing, add the nearest locality to the
   label so they differ.
5. Optional: return `postalCode`/`city` from `/v1/geocode/structured` for a house found on a `street`-precision road,
   so the form can complete a pick of a street without numbers (we call it when a resident types the number).

## Raw sample

The 205 results (query, country, precision, label, address) are available on request as JSON; re-run with the
queries above to reproduce.
