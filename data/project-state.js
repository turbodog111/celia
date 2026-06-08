// Mirror for file:// previews. Keep data/project-state.json canonical.
window.CELIA_PROJECT_STATE = {
  "updatedAt": "2026-06-08T14:50:34Z",
  "source": "celia/planning/progress.md plus local run artifacts",
  "runs": {
    "headline": {
      "label": "Active decision",
      "title": "CA9 chunk 001",
      "status": "Judging first batch",
      "tone": "gold",
      "detail": "SFT9 paused for manual approval",
      "updated": "2026-06-08 08:18 EDT"
    },
    "cards": [
      {
        "label": "Current run",
        "value": "CA9 chunk 001",
        "detail": "1,000 lint-passed candidates from 1,569 raw rows",
        "meta": "Last file-backed status: 580 / 1,000 judged"
      },
      {
        "label": "Next decision",
        "value": "SFT9 manual approval",
        "detail": "Inspect accepted KEEP count after the watcher stops CA9",
        "meta": "No SFT9 auto-launch"
      },
      {
        "label": "Latest trained model",
        "value": "CeliaA0.2.1-SFT8B",
        "detail": "Complete CA8 LoRA SFT, lr7e-5 plateau-p0",
        "meta": "Best checkpoint: checkpoint-1440"
      }
    ],
    "metrics": [
      {
        "label": "SFT8B train rows",
        "value": "5,876",
        "detail": "3,898 CA / 1,978 AG-MI"
      },
      {
        "label": "SFT8B best eval loss",
        "value": "1.2799",
        "detail": "lr7e-5 plateau-p0"
      },
      {
        "label": "SFT8B runtime",
        "value": "49.9m",
        "detail": "early-stopped at step 1,800"
      }
    ],
    "timeline": [
      {
        "name": "CA8 complete",
        "status": "Done",
        "detail": "2,039 CA8 train rows after union cuts"
      },
      {
        "name": "SFT8B best checkpoint",
        "status": "Done",
        "detail": "checkpoint-1440 selected by eval loss"
      },
      {
        "name": "SFT8B Theology V1.0",
        "status": "Reviewing",
        "detail": "20 / 20 generated; 5 / 20 human-scored"
      },
      {
        "name": "CA9 chunk 001",
        "status": "Judging",
        "detail": "First judged batch only; SFT9 paused"
      }
    ],
    "paths": [
      {
        "label": "SFT8B packet",
        "value": "celia/training/celia-a0.2.1-sft8b-complete-ca8-v1/"
      },
      {
        "label": "SFT8B run",
        "value": "/home/xturbo/celia-runs/celia-a0.2-sft/a0.2.1-sft8b-complete-ca8-v1-lora-r32-lr7e-5-plateau-p0-2p5epoch-2026-06-07-1727"
      },
      {
        "label": "CA9 output root",
        "value": "/home/xturbo/judge-runs/celia-current-benchmark-evals/ca-feedback-2026-06-07/judge-v1.5.0-r2-combined/ca9-batch2-accepted1600-judge-writer-b2"
      }
    ]
  },
  "benchmarks": {
    "headline": {
      "label": "Benchmark status",
      "title": "SFT8B review in progress",
      "status": "Partial human score",
      "tone": "gold",
      "detail": "Theology generation complete; human review open"
    },
    "cards": [
      {
        "label": "Latest Theology run",
        "value": "SFT8B",
        "detail": "20 / 20 generated, no format continuations",
        "meta": "5 / 20 reviewed, 3.0 points so far"
      },
      {
        "label": "Best completed Theology score",
        "value": "6.5 / 20",
        "detail": "CeliaA0.2.1-SFT7",
        "meta": "2 full, 9 half, 9 zero"
      },
      {
        "label": "FMG-Bench V1",
        "value": "Completed",
        "detail": "157 prompts in two modes on SFT8A",
        "meta": "Eval-only, do not train"
      }
    ],
    "metrics": [
      {
        "label": "SFT8B eval checkpoint",
        "value": "checkpoint-1440",
        "detail": "eval loss 1.2799"
      },
      {
        "label": "Theology generation",
        "value": "204.4s",
        "detail": "1,316 new tokens"
      },
      {
        "label": "FMG generation",
        "value": "2,457s",
        "detail": "314 total outputs"
      }
    ],
    "rows": [
      {
        "name": "CeliaA0.2.1-SFT8B",
        "benchmark": "Theology Test V1.0",
        "status": "Human review in progress",
        "result": "5 / 20 reviewed, 3.0 points",
        "path": "celia/model/evals/theology-test-v1.0/results/2026-06-07-celia-a0-2-1-sft8b-lr7e5-plateau-p0-best-ckpt1440-celia-direct/"
      },
      {
        "name": "CeliaA0.2.1-SFT7",
        "benchmark": "Theology Test V1.0",
        "status": "Reviewed",
        "result": "6.5 / 20",
        "path": "celia/model/evals/theology-test-v1.0/results/2026-06-05-celia-a0-2-1-sft7-best-ckpt1280-celia-direct/"
      },
      {
        "name": "CeliaA0.2.1-SFT8A",
        "benchmark": "FMG-Bench V1",
        "status": "Generated",
        "result": "157 prompts, two modes",
        "path": "celia/evals/fmg-bench-v1/results/2026-06-06-celia-a0-2-1-sft8a-best-ckpt1200/"
      }
    ],
    "paths": [
      {
        "label": "Theology SFT8B summary",
        "value": "celia/model/evals/theology-test-v1.0/results/2026-06-07-celia-a0-2-1-sft8b-lr7e5-plateau-p0-best-ckpt1440-celia-direct/summary.json"
      },
      {
        "label": "FMG SFT8A summary",
        "value": "celia/evals/fmg-bench-v1/results/2026-06-06-celia-a0-2-1-sft8a-best-ckpt1200/summary.json"
      }
    ]
  }
};
