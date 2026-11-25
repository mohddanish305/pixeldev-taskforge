# Submission Summary — PixelDev TaskForge

## Project title

PixelDev TaskForge — Feature Task Generator

## Track

Coding Task Factory

## Team

PixelDev (solo) — Mohd Danish

## Problem

AI coding systems need realistic, measurable tasks for evaluation. Manual task creation is slow, inconsistent, and often missing the tests and reference solutions needed to judge whether a model truly implemented a feature correctly.

## Solution

PixelDev TaskForge generates complete feature-development task packages from sample repositories. A user selects a repository, feature theme, difficulty, reference language, and explanation style. The system produces a task package with a starting repo version, user story, requirements, acceptance criteria, edge cases, reference implementation, feature tests, regression checks, validation evidence, and a downloadable JSON package.

## Key features

- Three sample repositories: Shopping Cart App, Notes App, and Expense Tracker
- Nine feature themes across checkout, search, tags, reminders, budgets, categorization, and CSV export
- Hinglish and English explanations for accessibility
- JavaScript and Python reference implementations
- Feature tests that verify new behavior
- Regression checks that protect existing functionality
- Validation evidence comparing reference behavior with broken logic
- JSON export for portable evaluation packages

## Validation evidence

The prototype was checked across all 9 repo/feature combinations:

- 20 validation checks run
- 20/20 reference checks passed
- 15/20 broken-logic cases caught by tests

Sample results:

- Discount codes: 3/3 reference checks passed, 2/3 broken cases caught
- Note search: 2/2 reference checks passed, 2/2 broken cases caught
- Budget alerts: 3/3 reference checks passed, 1/3 broken cases caught

## Demo flow

Choose a repository and feature, generate a package, review the brief, inspect the reference solution, check the tests, view validation evidence, and download the JSON package. Switching repositories demonstrates that the pipeline is reusable rather than tied to one fixed task.

## Why it fits the track

Coding Task Factory requires a reusable strategy for generating realistic feature-development tasks with requirements, reference implementations, tests, and validation. TaskForge directly implements that pipeline and packages the evidence in a judge-friendly format.

## Links

- GitHub repository: https://github.com/mohddanish305/pixeldev-taskforge
- Live demo: https://mohddanish305.github.io/pixeldev-taskforge/

## Tech stack

HTML, CSS, JavaScript, JSON task packages, Node-based validation checks.
