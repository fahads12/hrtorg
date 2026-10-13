# Inactive n8n technical repair copies

These nine JSON files are optional local review artifacts. Nothing has been imported, updated, sent, or activated in n8n. Each copy has `active: false`. Original Downloads exports are unchanged.

## Exact changes

- All nine success responses add `accepted: true` and `emailSent: true`. The existing success node still runs only after Gmail succeeds. These flags describe submission processing and the Gmail send step, not confirmed inbox delivery or medical interpretation.
- The seven specialty success responses read their existing assessment fields from `$('Calculate Scores').first().json`, because incoming Gmail output does not contain those fields. Hormone responses keep their existing `Build HTML Email` references.
- All nine email templates escape `&`, `<`, `>`, double quotes, and apostrophes in the dynamic patient name. Hormone names retain the existing title casing. Clinical wording, content, scores, subjects, and links are unchanged.
- The men's hormone workflow removes the incomplete extra SMTP `Send an Email` node and its connection from Gmail. The configured Gmail node remains.
- All copies remove `pinData`, `meta` (including instance metadata), and `versionId`.

Workflow IDs, retained node IDs, webhook paths, and retained credential references are preserved for comparison with the existing workflows. Credential secret values were neither retrieved nor added. Keep these internal files out of public site deployments.

## Manual review and application

1. Open the matching existing workflow and compare its current version with the source hash and proposed changes in `manifest.json`. Back up the current workflow before applying changes.
2. Apply the listed node edits manually, or use your n8n import/update process for one matching workflow at a time. Confirm the intended workflow identity and credential bindings: an import interface may create a new workflow despite an exported ID. These files are not a bulk activation bundle.
3. Keep review copies inactive. Verify webhook response fields, email rendering, and the real credential binding in an authorized test environment before separately deciding whether to activate an update. This preparation script does not provide live-delivery evidence.

Do not run a bulk import or activation solely because the copies pass offline checks. IDs and existing webhook paths are intentionally retained, so duplicate workflows must not be activated alongside the originals.

## Unresolved workflow behavior

The women's and men's hormone workflows still classify all-zero symptom counts as category 4 and select cardiometabolic-risk email wording. Their category 1–3 clinical meanings also differ from the local checklist labels. Scoring and medical narratives were intentionally left unchanged for source-owner review. The local website guard must remain responsible for withholding an all-zero hormone submission until that behavior is resolved.

These repairs add no CRM registration, newsletter enrollment, opt-in branching, input bounds checks, authentication, duplicate protection, preflight configuration, or custom email-failure response. Existing behavior in those areas remains as described in the audit reports. Exported credential references do not prove the credentials are usable on a live instance.

## Reproduce and verify

Run `node prepare-n8n-repairs.cjs` from the HRT workspace. By default it reads the nine named exports from the parent Downloads directory. An optional first argument can point to a different directory containing those same original filenames.

The script performs local checks before writing any copies: response expressions with simulated Gmail output, correct Gmail-to-success ordering, complete retained score nodes, unchanged clinical template text, ordinary/empty-name rendering equivalence, HTML escaping, identity/credential-reference preservation, and unchanged source hashes. It never calls n8n or an email provider. `manifest.json` records per-file hashes and changes without printing credential references.
