# WBS — About / Footer Refinement

| ID | Work | Depends on | Validation |
|---|---|---|---|
| A0 | Plan and inventory | — | Plan + execution graph present |
| A1 | Refine About disclosures and footer tagline | A0 | Exact diff; unchanged anchors/routes |
| A2 | Cross-update linked llms discovery data from About source | A1 | Generated llms includes About resource + derived disclosure sections |
| A3 | Validate llms freshness, privacy boundary, and build | A1, A2 | production-ci passes |
| A4 | Merge and deploy | A3 | GitHub deploy success to `the-canonical-shelf` |
