// Mirror for file:// previews. Keep data/project-state.json canonical.
window.CELIA_PROJECT_STATE = {
  "updatedAt": "2026-06-08T15:18:02Z",
  "source": "celia/planning/progress.md plus local run artifacts",
  "runs": {
    "headline": {
      "label": "Active decision",
      "title": "CA9 chunk 001 complete",
      "status": "Stopped for approval",
      "tone": "gold",
      "detail": "996 KEEP, 4 REJECT, 0 unparsed",
      "updated": "2026-06-08 11:18 EDT"
    },
    "cards": [
      {
        "label": "Current run",
        "value": "CA9 chunk 001 complete",
        "detail": "1,000 judged candidates from 1,569 raw rows",
        "meta": "996 KEEP / 4 REJECT / 0 unparsed"
      },
      {
        "label": "Next decision",
        "value": "SFT9 manual approval",
        "detail": "Decide whether to materialize CeliaA0.2.1-SFT9-v1",
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
        "label": "CA9 accepted",
        "value": "996",
        "detail": "99.6% KEEP rate"
      },
      {
        "label": "CA9 rejected",
        "value": "4",
        "detail": "0 unparsed"
      },
      {
        "label": "CA9 judge runtime",
        "value": "7.49h",
        "detail": "1,000 examples"
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
        "status": "Stopped",
        "detail": "996 accepted; SFT9 paused"
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
        "label": "CA9 accepted pool",
        "value": "/home/xturbo/moni-talk-models/celia/adapters/ca/celia-ca-9/staging/ca9_accepted1600_judge_writer_b2_2026_06_07/accepted_keep_1600.jsonl"
      },
      {
        "label": "CA9 judge root",
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
