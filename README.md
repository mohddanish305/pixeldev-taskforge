# PixelDev TaskForge — Feature Task Generator

Prototype for the Innodata AI Hackathon, Coding Task Factory track.

## What it does

TaskForge turns a sample repository and a feature theme into a complete coding task package for evaluating AI coding systems.

Each generated package includes:

- Starting repository version and starter files
- User story and Hinglish/English explanation
- Clear requirements and acceptance criteria
- Edge cases
- Reference implementation in JavaScript or Python
- Feature tests
- Regression checks for existing functionality
- Validation evidence showing reference checks passing and broken logic being caught
- Downloadable JSON task package

## Demo flow

1. Choose a sample repository: Shopping Cart App, Notes App, or Expense Tracker.
2. Choose a feature theme, difficulty, reference language, and explanation style.
3. Click **Generate task package**.
4. Review the Brief, Solution, Tests, Validation, and JSON tabs.
5. Download the JSON package for submission evidence.

## Sample packages

- Shopping Cart App: discount codes with eligibility rules
- Notes App: search with tag filtering
- Expense Tracker: category budget alerts

## Why this fits Coding Task Factory

The hackathon asks for a reusable pipeline that creates realistic, testable feature-development tasks. TaskForge demonstrates that pipeline with repeatable generation, reference implementations, tests that catch incorrect behavior, and regression checks that protect existing features.

## Files

- `index.html` — demo interface
- `styles.css` — Apple-like clean UI with PixelDev blue/violet accent palette
- `app.js` — task generator, reference templates, tests, and validation logic
- `sample-task-packages.json` — generated sample packages for evidence
- `validation-evidence.md` — test summary from the prototype checks
