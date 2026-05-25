# expense-tracker-ai — Claude Code Instructions

## Project
- **Stack**: Next.js 14 + TypeScript + MySQL (Prisma)
- **Testing**: Jest + Supertest
- **Auth**: NextAuth.js / JWT
- **Repo**: https://github.com/vuminhgiang/expense_tracker_ai

---

## Git Rules — ALWAYS follow these

### Branching
```
main              ← production, never commit directly
  └── feature/*   ← new features
  └── fix/*       ← production bug fixes
  └── chore/*     ← maintenance, refactor, config
  └── test/*      ← test-only changes
```

- **Always** create a new branch before writing any code
- **Never** commit directly to `main`
- Branch naming: `feature/short-description` (lowercase, hyphens)
- One feature = one branch

### Which branch to push to?

| Situation | Branch | Reason |
|-----------|--------|--------|
| Bug in feature you are working on | Current feature branch | Bug belongs to the feature |
| Bug on main (production) | New `fix/name` from main | Fix production fast, independent of feature |
| Bug on someone else's feature | New `fix/name` from that branch | Isolated fix |

### Commit rules
- **Commit after each step passes tests** — not at the end
- **Never commit failing tests**
- **Never commit `.next/`, `node_modules/`, `.env`**

### Commit message format
```
type: short description (max 72 chars)

Types:
  feat     → new feature
  fix      → bug fix
  test     → adding or fixing tests
  chore    → config, deps, gitignore
  refactor → code restructure, no behavior change
  docs     → documentation only
  perf     → performance improvement

Examples:
  feat: add CSV export for expenses
  fix: handle empty list in monthly report
  test: add unit tests for auth middleware
  chore: add .next to .gitignore
  refactor: extract expense validation to helper
```

### Pull Request rules
- **Always** create a PR — never merge yourself
- PR title = same format as commit message
- PR description must include:
  - What was built
  - Tests added
  - How to test manually
- **Wait for human approval** before merging
- Delete branch after merge

---

## Git Workflow Scenarios

### Scenario 1 — Bug in current feature branch

```bash
# You are on feature-data-export-v3
# Fix the bug directly here

git add .
git commit -m "fix: handle empty array in CSV export"
git push origin feature-data-export-v3
```

---

### Scenario 2 — Production bug while working on feature

**Situation:** Working on `feature-data-export-v3` but `main` has a JWT bug.

#### Visual

```
BEFORE:
main ──────●─────────────────────────────────────→
           ↑ JWT bug

feature-v3 ──────────────────────────────────────→
           (no fix yet)


AFTER:
main ──────●──────────────────●──────────────────→
           ↑ JWT bug          ↑ fix merged ✅

fix/auth ──────────────────────┘
         (from main)    (merged + deleted)

feature-v3 ────────────────────────────────●─────→
                                           ↑ merged main
                                           (has JWT fix) ✅
```

#### Step by step

```bash
# Step 1: Stash unfinished work
git stash

# Step 2: Create fix branch from main
git checkout main
git pull origin main
git checkout -b fix/auth-token-expiry

# Step 3: Fix + test
# ... fix code ...
npm test -- --testPathPattern=auth   # must pass ✅
git add .
git commit -m "fix: correct JWT token expiry calculation"
git push origin fix/auth-token-expiry

# Step 4: Create PR → wait for approval → merge to main
gh pr create --base main --title "fix: correct JWT token expiry"

# Step 5: After PR merged → bring fix into feature branch
git checkout feature-data-export-v3
git merge main
git push origin feature-data-export-v3

# Step 6: Restore unfinished work
git stash pop

# Step 7: Clean up
git branch -d fix/auth-token-expiry
git push origin --delete fix/auth-token-expiry
```

#### Why merge main back into feature branch?

```
WITHOUT merging:
feature-v3 still has old JWT bug
→ When feature-v3 merges into main later
→ Bug comes back to production! ❌

WITH merging:
feature-v3 has latest fix
→ Safe to merge into main ✅
```

---

### Scenario 3 — Multiple developers, same production bug

```bash
# After fix/auth merged into main:

# Developer A (on feature-payment)
git checkout feature-payment
git merge main        # get the fix

# Developer B (on feature-data-export-v3)
git checkout feature-data-export-v3
git merge main        # get the fix
```

**Rule:** Every developer merges main into their branch after a fix lands.

---

### Quick reference

```bash
# === Fix production bug ===
git stash                               # save unfinished work
git checkout main && git pull           # go to main
git checkout -b fix/bug-name            # create fix branch
# ... fix + test ...
git commit -m "fix: description"
git push origin fix/bug-name
gh pr create --base main                # create PR

# === After PR merged ===
git checkout your-feature-branch
git merge main                          # bring fix in
git push origin your-feature-branch
git stash pop                           # restore work

# === Clean up ===
git branch -d fix/bug-name
git push origin --delete fix/bug-name
```

---

## Development Flow — ALWAYS follow this order

```
1. Create branch
        ↓
2. Write tests first
        ↓
3. Write implementation
        ↓
4. Run tests → MUST pass before next step
        ↓
5. Commit (small, meaningful)
        ↓
6. Repeat 2–5 for each function
        ↓
7. Push branch
        ↓
8. Create PR
        ↓
9. Wait for human approval
```

---

## Test Rules

- Write tests **before or with** implementation — never after
- Every function needs tests for:
  - Happy path
  - Invalid input
  - Edge cases
  - Auth rejection (for protected routes)
- **Never proceed if any test fails**
- Coverage minimum: 80% overall, 100% for auth + payments

### Run tests
```bash
npm test                                # all tests
npm test -- --testPathPattern=auth      # specific
npm test -- --coverage                  # with coverage
npm test -- --watch                     # watch mode
```

---

## .gitignore — NEVER commit these

```
node_modules/
.next/
.env
.env.local
*.log
prisma/migrations/dev.db
```

---

## Code Style

- Functions < 20 lines
- One responsibility per function
- Always handle errors explicitly
- No `any` types in TypeScript
- No magic numbers — use constants
- No hardcoded secrets — use `.env`

---

## Ask human before:
- Changing database schema
- Modifying `.env.example`
- Merging to main
- Deleting any branch
- Any destructive operation (DROP, DELETE without WHERE)

---

## Current Progress

- [ ] Step 1: Database schema + Prisma setup
- [ ] Step 2: Authentication (JWT)
- [ ] Step 3: Expense CRUD API
- [ ] Step 4: Categories
- [ ] Step 5: Reports & Analytics
- [x] Step 6: Data Export (CSV/PDF)
- [x] Step 7: Frontend components
- [x] Step 8: Dashboard

## Active branch
- `main` (all steps complete)

## Known issues
- `.next/cache` was accidentally tracked — fixed with `git rm -r --cached .next/`

---

## Development Policies by Risk Level

> These policies apply to ALL code changes. Claude MUST identify the level FIRST, then follow the corresponding policy before writing any code.

---

### How to identify the level

```
CRITICAL        → auth, payments, database schema, security, data deletion
IMPORTANT-HIGH  → API endpoints, business logic, multi-service flows
IMPORTANT-LOW   → single-service features, UI components with API calls
NORMAL          → utilities, helpers, config, minor UI changes
NICE-TO-HAVE    → cosmetic UI, copy changes, README updates
```

---

### Policy Matrix

| Action | CRITICAL | IMPORTANT-HIGH | IMPORTANT-LOW | NORMAL | NICE-TO-HAVE |
|--------|:--------:|:--------------:|:-------------:|:------:|:------------:|
| Gen flow in README.md | ✅ Required | ✅ Required | ⬜ Optional | ❌ Skip | ❌ Skip |
| Specify flow in code block in README | ✅ Required | ❌ Skip | ❌ Skip | ❌ Skip | ❌ Skip |
| Write unit tests | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ⬜ Optional |
| Write integration tests | ✅ Required | ✅ Required | ⬜ Optional | ❌ Skip | ❌ Skip |
| Create PR (mandatory) | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ⬜ Optional |
| Developer approve | ✅ Required | ✅ Required | ✅ Required | ✅ Required | ⬜ Optional |
| Team Lead approve | ✅ Required | ✅ Required | ❌ Skip | ❌ Skip | ❌ Skip |

---

### CRITICAL policy

**Applies to:** auth, payments, database schema, security, data deletion, encryption

```
Step 1: Identify scope → tell human what is CRITICAL and why
Step 2: Create feature branch
Step 3: Gen flow in README.md
        → High-level: what this does, why it's critical
        → Specific flow in code block:
           Input → Validation → Processing → Output
           Error paths explicitly shown
Step 4: Write integration tests first
Step 5: Write unit tests (100% coverage required)
Step 6: Implementation
Step 7: All tests must pass ✅
Step 8: Create PR
Step 9: Developer review → approve
Step 10: Team Lead review → approve
Step 11: Merge only after BOTH approvals
```

**README.md flow example (CRITICAL):**
````markdown
## Authentication Flow

**Risk level: CRITICAL**

### High-level flow
```
User login request
      ↓
Input validation (email format, password length)
      ↓
Fetch user from DB
      ↓
bcrypt.compare(password, hashedPassword)
      ↓
PASS → generate JWT (expires: 7d)
FAIL → return 401 (generic message, no hint)
      ↓
Set httpOnly cookie + return token
```

### Error paths
```
Missing fields    → 400 Bad Request
Invalid email     → 400 Bad Request
Wrong password    → 401 Invalid credentials (do NOT reveal which field)
User not found    → 401 Invalid credentials (same message, timing-safe)
DB error          → 500 Internal Server Error (log, do NOT expose)
```
````

---

### IMPORTANT & HIGH RISK & NOT COMPLICATED policy

**Applies to:** API endpoints, business logic flows, multi-service interactions

```
Step 1: Identify scope → tell human what is IMPORTANT-HIGH and why
Step 2: Create feature branch
Step 3: Gen flow in README.md
        → High-level flow only (no code block required)
Step 4: Write integration tests
Step 5: Write unit tests (80% coverage minimum)
Step 6: Implementation
Step 7: All tests must pass ✅
Step 8: Create PR
Step 9: Developer review → approve
Step 10: Team Lead review → approve
Step 11: Merge only after BOTH approvals
```

**README.md flow example (IMPORTANT-HIGH):**
````markdown
## Expense CRUD API

**Risk level: IMPORTANT-HIGH**

### Flow
```
POST /api/expenses
→ Auth check → Validate input → Save to DB → Return 201

GET /api/expenses
→ Auth check → Query user expenses → Paginate → Return 200

PUT /api/expenses/:id
→ Auth check → Ownership check → Validate → Update → Return 200

DELETE /api/expenses/:id
→ Auth check → Ownership check → Soft delete → Return 200
```
````

---

### IMPORTANT & LOW RISK policy

**Applies to:** Single-service features, UI components with API calls, non-critical business logic

```
Step 1: Identify scope → tell human what is IMPORTANT-LOW and why
Step 2: Create feature branch
Step 3: Write unit tests (80% coverage minimum)
Step 4: Implementation
Step 5: All tests must pass ✅
Step 6: Create PR
Step 7: Developer review → approve
Step 8: Merge (Team Lead approval NOT required)
```

---

### NORMAL policy

**Applies to:** Utilities, helpers, config changes, minor UI, refactoring

```
Step 1: Create feature branch (or chore/*)
Step 2: Write unit tests
Step 3: Implementation
Step 4: Tests must pass ✅
Step 5: Create PR
Step 6: Developer review → approve
Step 7: Merge
```

---

### NICE-TO-HAVE policy

**Applies to:** Cosmetic UI changes, copy updates, README-only updates

```
Step 1: Can commit directly to feature branch
Step 2: Tests optional (if logic involved → write tests)
Step 3: PR optional for README-only changes
Step 4: Developer spot-check recommended
Step 5: Merge
```

---

### Claude MUST say this before starting any task

```
"I identified this task as [LEVEL] because [reason].

Policy requires:
- [list actions from policy matrix]

Proceeding with Step 1..."
```

**Example:**
```
"I identified this task as CRITICAL because it touches
JWT authentication and token generation.

Policy requires:
- Gen flow in README.md with code block
- Integration tests + unit tests (100% coverage)
- PR with Developer + Team Lead approval

Proceeding with Step 1: generating README flow..."
```

---

### Examples by level

| Example task | Level |
|-------------|-------|
| Add JWT refresh token | CRITICAL |
| Add Stripe payment webhook | CRITICAL |
| Add DELETE /api/expenses/:id | IMPORTANT-HIGH |
| Add monthly report API | IMPORTANT-HIGH |
| Add expense filter by category | IMPORTANT-LOW |
| Add loading spinner to list | NORMAL |
| Fix typo in button label | NICE-TO-HAVE |
| Update README installation steps | NICE-TO-HAVE |

