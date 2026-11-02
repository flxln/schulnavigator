# Screen-Matrix — Soll · Mockup · Code

**Stand:** 2026-06-22  
**Legende Referenz:** ⭐ = Mockup für diesen Screen gut nutzbar · ⚠️ = Mockup vorhanden, IA/Tokens abweichend · — = kein Mockup

**Legende Code:** ✅ = Soll-IA/Feature umgesetzt · 🔄 = Ist v2.1, Cleanup offen (#198–#204) · ⏳ = geplant, nicht implementiert

Verbindliche IA: [`NAVIGATION-SOLL.md`](../NAVIGATION-SOLL.md)

---

## Querschnitt Shell (alle Screens)

| Thema | Soll | Mockup (typisch) | Code (#197) |
|-------|------|------------------|-------------|
| Sidebar-Gruppen | 4 Gruppen, 6 Einträge | ⚠️ oft flach oder Coach falsch | ✅ |
| Design & Hub | `/mpz/studio/design`, Tabs | ⚠️ Tabs „Hub/Brand“ | ✅ „Hub-Karte“ / „Brand & Design“ |
| Dialog-Audio global | entfällt | ✅ meist nicht in Sidebar | 🔄 Route noch da (#198) |
| Medien-Sidebar-CTA | entfällt | ✅ meist nicht | ✅ entfernt (#197) |
| RoomRoster | unter Stationen | — fehlt oft | ✅ |

**Shell-Gold-Mockup:** `s11_hotspots_empty/code.html`

---

## Matrix nach Screen

Basis-Pfad: `stitch_mpz_studio_shell_dashboard/<ordner>/code.html`

| ID | Variante | Prompt-Zieldatei | Mockup-Ordner | Ref. | Code |
|----|----------|------------------|---------------|------|------|
| **S1** | default | `s1-shell-default.png` | `s1_studio_shell_default` | ⚠️ Coach unter Stationen | ✅ Nav |
| S1 | narrow | `s1-shell-narrow.png` | `s1_studio_shell_narrow` | ⚠️ Icon-only | 🔄 Mobile #203 |
| **S2** | visible | `s2-plan-a-banner.png` | `s2_plan_a_banner_visible` | ⭐ | ✅ Banner |
| **S3** | idle | `s3-save-idle.png` | `s3_save_validate_idle` | ⭐ | 🔄 Save #202 |
| S3 | running | `s3-save-running.png` | `s3_save_validate_running` | ⭐ | 🔄 |
| S3 | success | `s3-save-success.png` | `s3_save_validate_success` | ⭐ | 🔄 |
| S3 | rollback-error | `s3-save-rollback-error.png` | `s3_save_validate_rollback_error` | ⚠️ MD3 | 🔄 |
| **S4** | ok | `s4-dashboard-ok.png` | `s4_dashboard_ok` | ⭐ | 🔄 |
| S4 | errors | `s4-dashboard-errors.png` | `s4_dashboard_errors` | ⭐ | 🔄 |
| S4 | loading | `s4-dashboard-loading.png` | `s4_dashboard_loading` | ⭐ | 🔄 |
| **S5** | partial | `s5-stationen-partial.png` | `s5_stationen_grid_partial` | ⭐ | 🔄 |
| S5 | all-ok | `s5-stationen-all-ok.png` | `s5_stationen_grid_all_ok` | ⭐ | 🔄 |
| **S6** | flat | `s6-detail-header-flat.png` | `s6_station_detail_header_flat` | ⭐ | 🔄 |
| S6 | 360° | `s6-detail-header-360.png` | `s6_station_detail_header_360` | ⭐ | 🔄 |
| S6 | issues | `s6-detail-header-issues.png` | `s6_station_detail_header_issues` | ⭐ | 🔄 |
| **S7** | flat | `s7-stammdaten-flat.png` | `s7_stammdaten_flat` | ⭐ | 🔄 |
| S7 | equirectangular | `s7-stammdaten-360.png` | `s7_stammdaten_equirectangular` | ⭐ | 🔄 |
| **S8** | empty | `s8-medien-empty.png` | — | — | 🔄 |
| S8 | list | `s8-medien-list.png` | `s8_medien_list` | ⭐ | 🔄 |
| S8 | editing | `s8-medien-editing.png` | `s8_medien_editing` | ⭐ | 🔄 |
| **S9** | default | `s9-medien-modal-default.png` | `s9_medien_modal_default` | ⭐ | 🔄 |
| S9 | link-embed | `s9-medien-modal-link-embed.png` | `s9_medien_modal_link_embed` | ⭐ | 🔄 |
| S9 | error | `s9-medien-modal-error.png` | `s9_medien_modal_error` | ⭐ | 🔄 |
| **S10** | metadata | `s10-medien-edit-metadata.png` | `s10_medien_bearbeiten_metadata` | ⭐ | 🔄 |
| S10 | replace-file | `s10-medien-edit-replace.png` | `s10_medien_bearbeiten_replace_file` | ⭐ | 🔄 |
| **S11** | empty | `s11-hotspots-empty.png` | `s11_hotspots_empty` | ⭐ **Shell-Ref.** | 🔄 |
| S11 | list | `s11-hotspots-list.png` | `s11_hotspots_list` | ⭐ | 🔄 |
| S11 | dialog-hotspot | `s11-hotspots-dialog.png` | `s11_hotspots_dialog_hotspot` | ⭐ | 🔄 |
| **S12** | medium | `s12-hotspot-medium.png` | `s12_hotspot_formular_medium` | ⭐ | 🔄 |
| S12 | dialog | `s12-hotspot-dialog.png` | `s12_hotspot_formular_dialog` | ⭐ | 🔄 |
| **S13** | idle | `s13-flat-calib-idle.png` | `s13_flat_kalibrierung_idle` | ⭐ | 🔄 Flat live |
| S13 | marker | `s13-flat-calib-marker.png` | `s13_flat_kalibrierung_marker` | ⭐ | 🔄 |
| S13 | applied | `s13-flat-calib-applied.png` | `s13_flat_kalibrierung_applied` | ⭐ | 🔄 |
| **S14** | idle | `s14-sphere-calib-idle.png` | `s14_sphere_kalibrierung_idle` | ⭐ | ⏳ #201 |
| S14 | marker | `s14-sphere-calib-marker.png` | `s14_sphere_kalibrierung_marker` | ⭐ | ⏳ |
| S14 | applied | `s14-sphere-calib-applied.png` | `s14_sphere_kalibrierung_applied` | ⭐ | ⏳ |
| S14 | startblick | `s14-sphere-calib-startblick.png` | `s14_sphere_kalibrierung_startblick` | ⭐ | ⏳ |
| **S15** | no-dialog | `s15-dialog-no-dialog.png` | `s15_dialog_no_dialog` | ⚠️ MD3 | ⏳ #199 |
| S15 | empty-segments | `s15-dialog-empty-segments.png` | `s15_dialog_empty_segments` | ⚠️ | ⏳ |
| S15 | filled | `s15-dialog-filled.png` | `s15_dialog_filled` | ⚠️ | 🔄 |
| S15 | row-upload-play | `s15-dialog-row-audio.png` | `s15_dialog_row_upload_play` | ⭐ Ziel-UX | ⏳ #200 |
| **S17** | empty | `s17-coach-empty.png` | `s17_coach_empty` | ⚠️ | 🔄 |
| S17 | list | `s17-coach-list.png` | `s17_coach_list` | ⚠️ | 🔄 |
| S17 | form | `s17-coach-form.png` | `s17_coach_form` | ⚠️ | 🔄 |
| **S18** | list | `s18-embeds-list.png` | `s18_embeds_links_list` | ⚠️ | 🔄 |
| S18 | edit-suffix | `s18-embeds-edit.png` | `s18_embeds_links_edit_suffix` | ⚠️ | 🔄 |
| **S19** | grid | `s19-design-tab-hub-grid.png` | `s19_design_hub_tab_hub_grid` | ⚠️ Grid≠Tabelle | ✅ Route/Tabs |
| S19 | edit | `s19-design-tab-hub-edit.png` | `s19_design_hub_tab_hub_edit` | ⚠️ | ✅ Hub-Panel |
| **S20** | upload | `s20-design-tab-brand-upload.png` | `s20_design_hub_tab_brand_upload` | ⚠️ | ✅ Brand-Panel |
| S20 | preview | `s20-design-tab-brand-preview.png` | `s20_design_hub_tab_brand_preview` | ⚠️ | ✅ |
| **S21** | ok | `s21-deploy-ok.png` | `s21_deploy_ok` | ⚠️ | 🔄 |
| S21 | warnings | `s21-deploy-warnings.png` | `s21_deploy_warnings` | ⚠️ | 🔄 |
| **S24** | unlock | `s24-unlock.png` | `s24_unlock_optional` | ⭐ | 🔄 |

---

## Implementierungs-Reihenfolge (Epic #195)

| Issue | Screens (Schwerpunkt) | Mockup nutzen |
|-------|----------------------|---------------|
| #196 | IA, Paket | Matrix + NAVIGATION-SOLL |
| #197 ✅ | S1, S19, S20 | `s11` Shell, `s19`/`s20` nur Tabs/Layout |
| #198 | S9, ingest-Redirect | S9-Modal-Serie |
| #199–#200 | S15 | `s15_dialog_no_dialog`, `row_upload_play` |
| #201 | S14 | S14-Serie |
| #202 | S3 | S3-Serie |
| #203 | S1 narrow | `s1_studio_shell_narrow` |
