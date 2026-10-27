# Adapter replay | Harbor TPA

Mapping version: harbor-v2
Run: 2026-10-27T18:02:23.281Z
Fixtures passed: 0/5
Field differences: 20
Scope: synthetic regression fixtures only.

## SYN-001: Unambiguous US date

claim_id: expected "00037311", got "37311". Source claim_no="00037311"; transform Convert through number.
service_date: expected "2025-10-15", got null (Date does not match the selected format.). Source service_date="10/15/2025"; transform DD/MM/YYYY.
billed_cents: expected 25000, got 2500000. Source gross_cents="25000"; transform dollars → integer cents.
paid_cents: expected 20000, got 2200000. Source allowed_cents="22000"; transform dollars → integer cents.

## SYN-002: Ambiguous month/day

claim_id: expected "00012345", got "12345". Source claim_no="00012345"; transform Convert through number.
service_date: expected "2025-02-03", got "2025-03-02". Source service_date="02/03/2025"; transform DD/MM/YYYY.
billed_cents: expected 95000, got 9500000. Source gross_cents="95000"; transform dollars → integer cents.
paid_cents: expected 50000, got 7500000. Source allowed_cents="75000"; transform dollars → integer cents.

## SYN-003: Cent precision

claim_id: expected "00061463", got "61463". Source claim_no="00061463"; transform Convert through number.
service_date: expected "2025-03-04", got "2025-04-03". Source service_date="03/04/2025"; transform DD/MM/YYYY.
billed_cents: expected 125050, got 12505000. Source gross_cents="125050"; transform dollars → integer cents.
paid_cents: expected 85025, got 10000000. Source allowed_cents="100000"; transform dollars → integer cents.

## SYN-004: Zero paid value

claim_id: expected "00000720", got "720". Source claim_no="00000720"; transform Convert through number.
service_date: expected "2025-11-12", got "2025-12-11". Source service_date="11/12/2025"; transform DD/MM/YYYY.
billed_cents: expected 7500, got 750000. Source gross_cents="7500"; transform dollars → integer cents.
paid_cents: expected 0, got 650000. Source allowed_cents="6500"; transform dollars → integer cents.

## SYN-005: Matching allowed and paid

claim_id: expected "00000108", got "108". Source claim_no="00000108"; transform Convert through number.
service_date: expected "2025-12-31", got null (Date does not match the selected format.). Source service_date="12/31/2025"; transform DD/MM/YYYY.
billed_cents: expected 9999, got 999900. Source gross_cents="9999"; transform dollars → integer cents.
paid_cents: expected 9999, got 999900. Source allowed_cents="9999"; transform dollars → integer cents.
