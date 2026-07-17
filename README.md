# Celia Model Registry

A single static page documenting every Celia-C (main) and Celia-Mini-C
(fast-iteration probe) model: architecture, training configuration, corpus
composition, measured results, and the deltas between sequential models.

Deployed to GitHub Pages from `master` via `.github/workflows/pages.yml`.

## Structure

- `index.html`: the registry (three tabs — Overview matrix, Model cards, Deltas)
- `assets/css/styles.css`: shared design system (matches the Celia visual language)
- `assets/js/site.js`: scroll reveals and page interactions
- `assets/images/`: logo and marks

Figures come from run configs, materialization manifests, and gauntlet scores;
in-progress and planned models are labeled as such.
