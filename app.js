const REPOS = {
  shopping: {
    id: "shopping",
    name: "Shopping Cart App",
    version: "cart-app@v1.4.0",
    stack: "JavaScript · Node.js",
    files: ["src/cart.js", "src/checkout.js", "src/pricing.js", "tests/cart.test.js"],
    existing: ["addItem", "removeItem", "calculateSubtotal", "checkout"],
    features: {
      discount: {
        label: "Discount codes",
        title: "Add discount codes with eligibility rules",
        story: "As a shopper, I want to apply a discount code during checkout so that eligible orders receive the correct saving without breaking cart totals.",
        hinglish: "Simple words me: user checkout par coupon code lagayega. Code tabhi chalega jab cart ki value minimum limit se zyada ho, code expire na ho, aur discount total se zyada na ho jaye. Galat code par cart total change nahi hona chahiye.",
        english: "The shopper can apply a coupon during checkout. The code must respect minimum order value, expiry, discount caps, and invalid-code handling without changing the cart total on failure.",
        requirements: [
          "Support STUDENT10 for 10% off when subtotal is at least ₹500.",
          "Support FIRST500 for ₹500 off when subtotal is at least ₹1,999.",
          "Reject expired and unknown codes with a clear message.",
          "Never allow discount to exceed the cart subtotal.",
          "Return subtotal, discount, total, appliedCode, and message in one result object."
        ],
        acceptance: [
          "STUDENT10 on ₹1,000 gives ₹100 discount and ₹900 total.",
          "FIRST500 on ₹2,500 gives ₹500 discount and ₹2,000 total.",
          "FIRST500 on ₹1,200 is rejected because the minimum is not met.",
          "Unknown codes do not change the total."
        ],
        edgeCases: ["Empty cart", "Lowercase coupon input", "Expired coupon", "Discount larger than subtotal", "Cart quantity changes after coupon is applied"],
        tags: ["pricing", "checkout", "rules-engine"],
        reference: {
          JavaScript: `function applyDiscount(cart, code, now = new Date()) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const normalized = String(code || "").trim().toUpperCase();
  const rules = {
    STUDENT10: { type: "percent", value: 10, min: 500 },
    FIRST500: { type: "flat", value: 500, min: 1999 },
    OLD50: { type: "flat", value: 50, min: 0, expiresAt: "2025-01-01" }
  };
  const rule = rules[normalized];
  if (!rule) return { subtotal, discount: 0, total: subtotal, appliedCode: null, message: "Invalid code" };
  if (rule.expiresAt && now > new Date(rule.expiresAt)) {
    return { subtotal, discount: 0, total: subtotal, appliedCode: null, message: "Code expired" };
  }
  if (subtotal < rule.min) {
    return { subtotal, discount: 0, total: subtotal, appliedCode: null, message: "Minimum order not met" };
  }
  const raw = rule.type === "percent" ? Math.round(subtotal * rule.value / 100) : rule.value;
  const discount = Math.min(raw, subtotal);
  return { subtotal, discount, total: subtotal - discount, appliedCode: normalized, message: "Discount applied" };
}`,
          Python: `def apply_discount(cart, code, now=None):
    subtotal = sum(item["price"] * item["qty"] for item in cart)
    normalized = str(code or "").strip().upper()
    rules = {
        "STUDENT10": {"type": "percent", "value": 10, "min": 500},
        "FIRST500": {"type": "flat", "value": 500, "min": 1999},
    }
    rule = rules.get(normalized)
    if not rule:
        return {"subtotal": subtotal, "discount": 0, "total": subtotal, "appliedCode": None, "message": "Invalid code"}
    if subtotal < rule["min"]:
        return {"subtotal": subtotal, "discount": 0, "total": subtotal, "appliedCode": None, "message": "Minimum order not met"}
    raw = round(subtotal * rule["value"] / 100) if rule["type"] == "percent" else rule["value"]
    discount = min(raw, subtotal)
    return {"subtotal": subtotal, "discount": discount, "total": subtotal - discount, "appliedCode": normalized, "message": "Discount applied"}`
        },
        tests: {
          JavaScript: `test("applies STUDENT10 on eligible cart", () => {
  expect(applyDiscount([{ price: 1000, qty: 1 }], "student10").total).toBe(900);
});

test("rejects FIRST500 below minimum", () => {
  const result = applyDiscount([{ price: 1200, qty: 1 }], "FIRST500");
  expect(result.discount).toBe(0);
  expect(result.message).toMatch(/minimum/i);
});

test("unknown code keeps total unchanged", () => {
  expect(applyDiscount([{ price: 800, qty: 1 }], "NOPE").total).toBe(800);
});`,
          Python: `def test_student10():
    assert apply_discount([{"price": 1000, "qty": 1}], "student10")["total"] == 900

def test_first500_minimum():
    result = apply_discount([{"price": 1200, "qty": 1}], "FIRST500")
    assert result["discount"] == 0
    assert "Minimum" in result["message"]`
        },
        regression: ["addItem still merges duplicate products", "removeItem still removes only the selected product", "calculateSubtotal remains unchanged when no coupon is applied"]
      },
      shipping: {
        label: "Free shipping rules",
        title: "Add free-shipping and express delivery rules",
        story: "As a shopper, I want delivery charges to update automatically so that free shipping and express delivery are predictable at checkout.",
        hinglish: "Simple words me: cart ₹999 ya usse zyada ho to standard delivery free hogi. Chhote cart par ₹49 lagega. Express choose kare to ₹149 lagega, aur empty cart par koi delivery charge nahi aana chahiye.",
        english: "Delivery pricing must be automatic: free standard shipping at or above ₹999, ₹49 below that, ₹149 for express delivery, and no fee for an empty cart.",
        requirements: ["Free standard shipping for subtotal >= ₹999.", "Standard shipping fee is ₹49 below ₹999.", "Express shipping fee is ₹149.", "Empty cart returns zero shipping.", "Return method, fee, and freeShipping flag."],
        acceptance: ["₹999 cart gets free standard shipping.", "₹500 cart pays ₹49 standard shipping.", "Express always returns ₹149 for non-empty carts.", "Empty cart returns ₹0."],
        edgeCases: ["Subtotal exactly ₹999", "Negative quantity guard", "Express on empty cart", "Discount changes shipping eligibility"],
        tags: ["checkout", "shipping", "pricing"],
        reference: {
          JavaScript: `function shippingFee(subtotal, method = "standard") {
  if (subtotal <= 0) return { method, fee: 0, freeShipping: false };
  if (method === "express") return { method, fee: 149, freeShipping: false };
  return subtotal >= 999
    ? { method, fee: 0, freeShipping: true }
    : { method, fee: 49, freeShipping: false };
}`,
          Python: `def shipping_fee(subtotal, method="standard"):
    if subtotal <= 0:
        return {"method": method, "fee": 0, "freeShipping": False}
    if method == "express":
        return {"method": method, "fee": 149, "freeShipping": False}
    return {"method": method, "fee": 0, "freeShipping": True} if subtotal >= 999 else {"method": method, "fee": 49, "freeShipping": False}`
        },
        tests: {
          JavaScript: `test("free shipping at threshold", () => {
  expect(shippingFee(999).fee).toBe(0);
});
test("express fee", () => {
  expect(shippingFee(1200, "express").fee).toBe(149);
});`,
          Python: `def test_free_shipping():
    assert shipping_fee(999)["fee"] == 0

def test_express():
    assert shipping_fee(1200, "express")["fee"] == 149`
        },
        regression: ["checkout total still includes product subtotal", "empty cart cannot checkout"]
      },
      wishlist: {
        label: "Wishlist actions",
        title: "Add wishlist save, remove, and move-to-cart actions",
        story: "As a shopper, I want to save products for later and move them to cart without duplicates.",
        hinglish: "Simple words me: user product ko wishlist me save karega. Same product dobara add nahi hoga. Move-to-cart karne par product wishlist se hatkar cart me chala jayega.",
        english: "Users can save products to a wishlist, remove them, and move them to cart while preventing duplicates.",
        requirements: ["Add product to wishlist only once.", "Remove product by id.", "Move to cart removes from wishlist and adds to cart.", "Return updated wishlist and cart arrays."],
        acceptance: ["Duplicate wishlist add keeps one copy.", "Move-to-cart removes the wishlist entry.", "Removing missing id does not crash."],
        edgeCases: ["Missing product id", "Product already in cart", "Empty wishlist"],
        tags: ["cart", "wishlist", "state"],
        reference: {
          JavaScript: `function addToWishlist(wishlist, product) {
  return wishlist.some(item => item.id === product.id) ? wishlist : [...wishlist, product];
}
function moveToCart(wishlist, cart, productId) {
  const product = wishlist.find(item => item.id === productId);
  if (!product) return { wishlist, cart };
  return {
    wishlist: wishlist.filter(item => item.id !== productId),
    cart: cart.some(item => item.id === productId) ? cart : [...cart, { ...product, qty: 1 }]
  };
}`,
          Python: `def add_to_wishlist(wishlist, product):
    return wishlist if any(item["id"] == product["id"] for item in wishlist) else [*wishlist, product]

def move_to_cart(wishlist, cart, product_id):
    product = next((item for item in wishlist if item["id"] == product_id), None)
    if not product:
        return {"wishlist": wishlist, "cart": cart}
    return {"wishlist": [i for i in wishlist if i["id"] != product_id], "cart": cart if any(i["id"] == product_id for i in cart) else [*cart, {**product, "qty": 1}]}`
        },
        tests: {
          JavaScript: `test("prevents duplicate wishlist items", () => {
  const list = addToWishlist([{ id: 1 }], { id: 1 });
  expect(list).toHaveLength(1);
});`,
          Python: `def test_no_duplicate():
    assert len(add_to_wishlist([{"id": 1}], {"id": 1})) == 1`
        },
        regression: ["cart quantity update still works", "checkout ignores wishlist-only products"]
      }
    }
  },
  notes: {
    id: "notes",
    name: "Notes App",
    version: "notes-app@v2.1.0",
    stack: "JavaScript · React",
    files: ["src/notes.js", "src/search.js", "src/tags.js", "tests/notes.test.js"],
    existing: ["createNote", "editNote", "deleteNote", "listNotes"],
    features: {
      search: {
        label: "Search + tags",
        title: "Add note search with tag filtering",
        story: "As a student, I want to search notes by title, body, or tag so that I can revise the right topic quickly.",
        hinglish: "Simple words me: student search box me word likhega. Note ke title, body ya tag me woh word mile to note dikhna chahiye. Search chhote-bade letters ko ignore kare aur latest note pehle aaye.",
        english: "Students can search notes across title, body, and tags. Matching is case-insensitive and results are sorted by most recently updated.",
        requirements: ["Search title, body, and tags.", "Ignore letter case and extra spaces.", "Optional tag filter must narrow results.", "Sort by updatedAt descending.", "Empty query returns all notes for the selected tag."],
        acceptance: ["Query 'dbms' finds a note tagged DBMS.", "Query 'normal' finds body text 'Normalization'.", "Tag filter excludes notes without that tag.", "Newer matching note appears first."],
        edgeCases: ["Blank query", "Missing tags array", "Duplicate tags", "Notes with same updatedAt"],
        tags: ["search", "tags", "student-tools"],
        reference: {
          JavaScript: `function searchNotes(notes, query = "", tag = "") {
  const q = query.trim().toLowerCase();
  const wantedTag = tag.trim().toLowerCase();
  return notes
    .filter(note => {
      const tags = (note.tags || []).map(t => t.toLowerCase());
      const matchesQuery = !q || [note.title, note.body, ...tags].join(" ").toLowerCase().includes(q);
      const matchesTag = !wantedTag || tags.includes(wantedTag);
      return matchesQuery && matchesTag;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}`,
          Python: `def search_notes(notes, query="", tag=""):
    q = query.strip().lower()
    wanted = tag.strip().lower()
    def ok(note):
        tags = [t.lower() for t in note.get("tags", [])]
        text = " ".join([note.get("title", ""), note.get("body", ""), *tags]).lower()
        return (not q or q in text) and (not wanted or wanted in tags)
    return sorted([n for n in notes if ok(n)], key=lambda n: n["updatedAt"], reverse=True)`
        },
        tests: {
          JavaScript: `test("finds notes by tag", () => {
  const notes = [{ title: "Unit 2", body: "Tables", tags: ["DBMS"], updatedAt: "2026-01-02" }];
  expect(searchNotes(notes, "dbms")).toHaveLength(1);
});
test("sorts newest first", () => {
  const notes = [
    { title: "Old", body: "sql", tags: [], updatedAt: "2026-01-01" },
    { title: "New", body: "sql", tags: [], updatedAt: "2026-01-03" }
  ];
  expect(searchNotes(notes, "sql")[0].title).toBe("New");
});`,
          Python: `def test_search_by_tag():
    notes = [{"title": "Unit 2", "body": "Tables", "tags": ["DBMS"], "updatedAt": "2026-01-02"}]
    assert len(search_notes(notes, "dbms")) == 1`
        },
        regression: ["createNote still adds a note", "deleteNote still removes only the selected note"]
      },
      tags: {
        label: "Tag cleanup",
        title: "Add tag normalization and duplicate removal",
        story: "As a student, I want messy tags cleaned automatically so that filters stay reliable.",
        hinglish: "Simple words me: user ' DBMS ', 'dbms', 'SQL' likhe to system tags ko saaf karke sirf unique tags rakhega. Khali tags hat jayenge aur maximum 5 tags rahenge.",
        english: "Tags are trimmed, lowercased, deduplicated, emptied values removed, and capped at five tags per note.",
        requirements: ["Trim whitespace and lowercase tags.", "Remove empty tags.", "Remove duplicates while preserving first order.", "Limit tags to five."],
        acceptance: ["' DBMS ' and 'dbms' become one tag.", "Empty strings are removed.", "Sixth unique tag is ignored."],
        edgeCases: ["Non-string tag values", "All tags empty", "Repeated tags with different case"],
        tags: ["tags", "cleanup", "validation"],
        reference: {
          JavaScript: `function normalizeTags(tags = []) {
  const seen = new Set();
  const result = [];
  for (const raw of tags) {
    const tag = String(raw || "").trim().toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
    if (result.length === 5) break;
  }
  return result;
}`,
          Python: `def normalize_tags(tags=None):
    result = []
    for raw in tags or []:
        tag = str(raw or "").strip().lower()
        if tag and tag not in result:
            result.append(tag)
        if len(result) == 5:
            break
    return result`
        },
        tests: {
          JavaScript: `test("normalizes duplicate tags", () => {
  expect(normalizeTags([" DBMS ", "dbms", "SQL"])).toEqual(["dbms", "sql"]);
});`,
          Python: `def test_normalize_tags():
    assert normalize_tags([" DBMS ", "dbms", "SQL"]) == ["dbms", "sql"]`
        },
        regression: ["editing a note keeps existing valid tags", "tag filter remains case-insensitive"]
      },
      reminders: {
        label: "Revision reminders",
        title: "Add revision reminders for upcoming notes",
        story: "As a student, I want reminders for notes due soon so that revision does not slip.",
        hinglish: "Simple words me: jin notes ka revision agle 24 ghante me due hai aur jo complete nahi hue, sirf unhi ke reminders dikhne chahiye. Complete notes reminder me nahi aayenge.",
        english: "The app lists incomplete notes whose revision time falls within the next 24 hours, sorted by due time.",
        requirements: ["Include reminders due within next 24 hours.", "Exclude completed notes.", "Sort by due time ascending.", "Ignore notes without a due date."],
        acceptance: ["Note due in 2 hours appears.", "Completed due note is excluded.", "Note due after 30 hours is excluded."],
        edgeCases: ["Invalid date", "Due exactly at 24 hours", "Missing completed flag"],
        tags: ["reminders", "revision", "time"],
        reference: {
          JavaScript: `function dueReminders(notes, now = new Date()) {
  const limit = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  return notes
    .filter(note => !note.completed && note.dueAt && new Date(note.dueAt) >= now && new Date(note.dueAt) <= limit)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
}`,
          Python: `from datetime import timedelta

def due_reminders(notes, now):
    limit = now + timedelta(hours=24)
    return sorted([n for n in notes if not n.get("completed") and n.get("dueAt") and now <= n["dueAt"] <= limit], key=lambda n: n["dueAt"])`
        },
        tests: {
          JavaScript: `test("excludes completed reminders", () => {
  const now = new Date("2026-01-01T10:00:00Z");
  const notes = [{ title: "DBMS", dueAt: "2026-01-01T12:00:00Z", completed: true }];
  expect(dueReminders(notes, now)).toHaveLength(0);
});`,
          Python: `def test_excludes_completed():
    assert due_reminders([{"dueAt": now, "completed": True}], now) == []`
        },
        regression: ["completed notes still appear in normal list", "note editing does not reset due date"]
      }
    }
  },
  expense: {
    id: "expense",
    name: "Expense Tracker",
    version: "expense-tracker@v0.9.3",
    stack: "JavaScript · Node.js",
    files: ["src/expenses.js", "src/budgets.js", "src/export.js", "tests/expenses.test.js"],
    existing: ["addExpense", "listExpenses", "monthlyTotal", "deleteExpense"],
    features: {
      budget: {
        label: "Budget alerts",
        title: "Add category budget alerts",
        story: "As a user, I want warnings when a category budget is close to or above its limit.",
        hinglish: "Simple words me: agar kisi category me budget ka 80% kharch ho jaye to warning aayegi. 100% se zyada ho jaye to exceeded alert aayega. Kam kharch par koi alert nahi aana chahiye.",
        english: "The tracker warns at 80% of a category budget, marks exceeded budgets at or above 100%, and stays quiet below the warning threshold.",
        requirements: ["Calculate spent amount per category.", "Warn when usage is at least 80% and below 100%.", "Mark exceeded when usage is at least 100%.", "Ignore categories without a positive budget.", "Return category, spent, budget, percent, and level."],
        acceptance: ["Food ₹800 of ₹1,000 returns warning.", "Travel ₹1,200 of ₹1,000 returns exceeded.", "Books ₹300 of ₹1,000 returns no alert."],
        edgeCases: ["Zero budget", "Missing category", "Exact 80% usage", "Exact 100% usage"],
        tags: ["budgets", "alerts", "finance"],
        reference: {
          JavaScript: `function budgetAlerts(expenses, budgets) {
  return Object.entries(budgets)
    .filter(([, budget]) => budget > 0)
    .map(([category, budget]) => {
      const spent = expenses.filter(e => e.category === category).reduce((sum, e) => sum + e.amount, 0);
      const percent = Math.round((spent / budget) * 100);
      const level = percent >= 100 ? "exceeded" : percent >= 80 ? "warning" : "ok";
      return { category, spent, budget, percent, level };
    })
    .filter(item => item.level !== "ok");
}`,
          Python: `def budget_alerts(expenses, budgets):
    alerts = []
    for category, budget in budgets.items():
        if budget <= 0:
            continue
        spent = sum(e["amount"] for e in expenses if e["category"] == category)
        percent = round(spent / budget * 100)
        level = "exceeded" if percent >= 100 else "warning" if percent >= 80 else "ok"
        if level != "ok":
            alerts.append({"category": category, "spent": spent, "budget": budget, "percent": percent, "level": level})
    return alerts`
        },
        tests: {
          JavaScript: `test("warns at 80 percent", () => {
  const alerts = budgetAlerts([{ category: "Food", amount: 800 }], { Food: 1000 });
  expect(alerts[0].level).toBe("warning");
});`,
          Python: `def test_warning():
    assert budget_alerts([{"category": "Food", "amount": 800}], {"Food": 1000})[0]["level"] == "warning"`
        },
        regression: ["monthlyTotal still sums all expenses", "deleteExpense still updates totals"]
      },
      categories: {
        label: "Auto categories",
        title: "Add merchant-based auto categorization",
        story: "As a user, I want expenses categorized from merchant names so that entry is faster.",
        hinglish: "Simple words me: merchant ke naam se category guess hogi. Zomato/Swiggy food me, Uber/Ola travel me, Amazon shopping me jayega. Samajh na aaye to Other category milegi.",
        english: "Expenses are categorized from merchant keywords, with unknown merchants falling back to Other.",
        requirements: ["Match merchant keywords case-insensitively.", "Support Food, Travel, Shopping, and Bills.", "Unknown merchants return Other.", "Trim extra spaces before matching."],
        acceptance: ["'ZOMATO' returns Food.", "'uber trip' returns Travel.", "'Unknown Store' returns Other."],
        edgeCases: ["Blank merchant", "Merchant with extra spaces", "Keyword inside another word"],
        tags: ["categorization", "automation", "finance"],
        reference: {
          JavaScript: `function categorizeExpense(merchant = "") {
  const text = merchant.trim().toLowerCase();
  if (["zomato", "swiggy", "cafe"].some(word => text.includes(word))) return "Food";
  if (["uber", "ola", "metro"].some(word => text.includes(word))) return "Travel";
  if (["amazon", "flipkart"].some(word => text.includes(word))) return "Shopping";
  if (["electricity", "broadband", "recharge"].some(word => text.includes(word))) return "Bills";
  return "Other";
}`,
          Python: `def categorize_expense(merchant=""):
    text = merchant.strip().lower()
    if any(word in text for word in ["zomato", "swiggy", "cafe"]):
        return "Food"
    if any(word in text for word in ["uber", "ola", "metro"]):
        return "Travel"
    if any(word in text for word in ["amazon", "flipkart"]):
        return "Shopping"
    if any(word in text for word in ["electricity", "broadband", "recharge"]):
        return "Bills"
    return "Other"`
        },
        tests: {
          JavaScript: `test("categorizes food merchant", () => {
  expect(categorizeExpense("ZOMATO")).toBe("Food");
});`,
          Python: `def test_food_category():
    assert categorize_expense("ZOMATO") == "Food"`
        },
        regression: ["manual category selection still overrides auto category", "expense list order remains unchanged"]
      },
      exportCsv: {
        label: "CSV export",
        title: "Add safe CSV export for expenses",
        story: "As a user, I want to export expenses to CSV without broken columns when notes contain commas or quotes.",
        hinglish: "Simple words me: expense list CSV file me export hogi. Agar note me comma ya quote hai to file kharab nahi honi chahiye; woh value sahi tarike se escape hogi.",
        english: "Expenses export to CSV with a header row and safe escaping for commas, quotes, and newlines.",
        requirements: ["Include header date,merchant,category,amount,note.", "Wrap fields containing commas, quotes, or newlines in quotes.", "Double internal quotes.", "Keep amount as a plain number."],
        acceptance: ["Note 'Tea, snacks' stays one CSV field.", "Quote in note is doubled.", "Header row is always first."],
        edgeCases: ["Empty expense list", "Newline in note", "Missing note field"],
        tags: ["export", "csv", "data"],
        reference: {
          JavaScript: `function toCsv(expenses) {
  const escape = value => {
    const text = String(value ?? "");
    return /[",\n]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
  };
  const rows = expenses.map(e => [e.date, e.merchant, e.category, e.amount, e.note || ""].map(escape).join(","));
  return ["date,merchant,category,amount,note", ...rows].join("\n");
}`,
          Python: `import csv
import io

def to_csv(expenses):
    output = io.StringIO()
    writer = csv.writer(output, lineterminator="\n")
    writer.writerow(["date", "merchant", "category", "amount", "note"])
    for e in expenses:
        writer.writerow([e["date"], e["merchant"], e["category"], e["amount"], e.get("note", "")])
    return output.getvalue()`
        },
        tests: {
          JavaScript: `test("escapes commas in notes", () => {
  const csv = toCsv([{ date: "2026-01-01", merchant: "Cafe", category: "Food", amount: 120, note: "Tea, snacks" }]);
  expect(csv).toContain('"Tea, snacks"');
});`,
          Python: `def test_csv_escape():
    assert '"Tea, snacks"' in to_csv([{"date": "2026-01-01", "merchant": "Cafe", "category": "Food", "amount": 120, "note": "Tea, snacks"}])`
        },
        regression: ["export does not mutate expenses", "monthly total remains unchanged after export"]
      }
    }
  }
};

const state = {
  repo: "shopping",
  feature: "discount",
  difficulty: "Medium",
  language: "JavaScript",
  explanation: "Hinglish",
  package: null
};

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function packageId(repo, feature, difficulty, language) {
  const seed = `${repo}-${feature}-${difficulty}-${language}`.split("").reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return `TF-2026-${String((seed % 900) + 100)}`;
}

function difficultyExtras(difficulty) {
  if (difficulty === "Easy") return { requirements: [], edgeCases: [] };
  if (difficulty === "Hard") {
    return {
      requirements: ["Add an audit-friendly result shape so judges can verify behavior without reading UI code."],
      edgeCases: ["Repeated calls with the same input return the same output"]
    };
  }
  return {
    requirements: ["Keep the implementation reusable as a pure function where possible."],
    edgeCases: ["Input values with extra whitespace"]
  };
}

function buildPackage(input = state) {
  const repo = REPOS[input.repo];
  const feature = repo.features[input.feature];
  const extras = difficultyExtras(input.difficulty);
  const pkg = {
    id: packageId(input.repo, input.feature, input.difficulty, input.language),
    title: feature.title,
    track: "Coding Task Factory",
    repo: {
      name: repo.name,
      version: repo.version,
      stack: repo.stack,
      starterFiles: repo.files,
      existingFeatures: repo.existing
    },
    feature: feature.label,
    difficulty: input.difficulty,
    language: input.language,
    story: feature.story,
    explanation: input.explanation === "Hinglish" ? feature.hinglish : feature.english,
    requirements: [...feature.requirements, ...extras.requirements],
    acceptanceCriteria: feature.acceptance,
    edgeCases: [...feature.edgeCases, ...extras.edgeCases],
    tags: feature.tags,
    referenceImplementation: feature.reference[input.language],
    featureTests: feature.tests[input.language],
    regressionChecks: feature.regression
  };
  pkg.validation = runValidation(input.repo, input.feature);
  pkg.rubric = [
    { criterion: "Requirements are clear and achievable", weight: 25 },
    { criterion: "Reference implementation satisfies the task", weight: 30 },
    { criterion: "Feature tests catch missing or incorrect behavior", weight: 25 },
    { criterion: "Regression checks protect existing functionality", weight: 20 }
  ];
  return pkg;
}

function resultRow(name, expected, reference, broken) {
  const referencePass = JSON.stringify(reference) === JSON.stringify(expected);
  const brokenCaught = JSON.stringify(broken) !== JSON.stringify(expected);
  return { name, expected, reference, broken, referencePass, brokenCaught };
}

function runValidation(repoId, featureId) {
  const key = `${repoId}:${featureId}`;
  const rows = [];

  if (key === "shopping:discount") {
    const reference = (cart, code) => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const rules = { STUDENT10: { type: "percent", value: 10, min: 500 }, FIRST500: { type: "flat", value: 500, min: 1999 } };
      const rule = rules[String(code).trim().toUpperCase()];
      if (!rule || subtotal < rule.min) return subtotal;
      const discount = Math.min(rule.type === "percent" ? Math.round(subtotal * rule.value / 100) : rule.value, subtotal);
      return subtotal - discount;
    };
    const broken = (cart, code) => {
      const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
      return String(code).toUpperCase() === "FIRST500" ? subtotal - 500 : subtotal;
    };
    rows.push(resultRow("STUDENT10 eligible cart", 900, reference([{ price: 1000, qty: 1 }], "student10"), broken([{ price: 1000, qty: 1 }], "student10")));
    rows.push(resultRow("FIRST500 below minimum", 1200, reference([{ price: 1200, qty: 1 }], "FIRST500"), broken([{ price: 1200, qty: 1 }], "FIRST500")));
    rows.push(resultRow("Unknown code", 800, reference([{ price: 800, qty: 1 }], "NOPE"), broken([{ price: 800, qty: 1 }], "NOPE")));
  } else if (key === "shopping:shipping") {
    const reference = (subtotal, method = "standard") => subtotal <= 0 ? 0 : method === "express" ? 149 : subtotal >= 999 ? 0 : 49;
    const broken = () => 0;
    rows.push(resultRow("Free shipping threshold", 0, reference(999), broken(999)));
    rows.push(resultRow("Standard fee below threshold", 49, reference(500), broken(500)));
    rows.push(resultRow("Express fee", 149, reference(1200, "express"), broken(1200, "express")));
  } else if (key === "shopping:wishlist") {
    const reference = list => [...new Set(list.map(item => item.id))].length;
    const broken = list => list.length;
    rows.push(resultRow("Duplicate wishlist add", 1, reference([{ id: 1 }, { id: 1 }]), broken([{ id: 1 }, { id: 1 }])));
    rows.push(resultRow("Unique wishlist items", 2, reference([{ id: 1 }, { id: 2 }]), broken([{ id: 1 }, { id: 2 }])));
  } else if (key === "notes:search") {
    const notes = [
      { title: "Unit 2", body: "Tables", tags: ["DBMS"], updatedAt: "2026-01-02" },
      { title: "Old SQL", body: "joins", tags: ["sql"], updatedAt: "2026-01-01" },
      { title: "New SQL", body: "normalization", tags: ["sql"], updatedAt: "2026-01-03" }
    ];
    const reference = query => notes.filter(note => [note.title, note.body, ...(note.tags || [])].join(" ").toLowerCase().includes(query.toLowerCase())).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map(note => note.title);
    const broken = query => notes.filter(note => note.title.toLowerCase().includes(query.toLowerCase())).map(note => note.title);
    rows.push(resultRow("Search by tag", ["Unit 2"], reference("dbms"), broken("dbms")));
    rows.push(resultRow("Search body and sort newest", ["New SQL"], reference("normal"), broken("normal")));
  } else if (key === "notes:tags") {
    const reference = tags => [...new Set(tags.map(tag => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 5);
    const broken = tags => tags;
    rows.push(resultRow("Normalize duplicate tags", ["dbms", "sql"], reference([" DBMS ", "dbms", "SQL"]), broken([" DBMS ", "dbms", "SQL"])));
    rows.push(resultRow("Remove empty tags", ["sql"], reference(["", " sql "]), broken(["", " sql "])));
  } else if (key === "notes:reminders") {
    const now = new Date("2026-01-01T10:00:00Z");
    const reference = notes => notes.filter(note => !note.completed && new Date(note.dueAt) >= now && new Date(note.dueAt) <= new Date(now.getTime() + 86400000)).map(note => note.title);
    const broken = notes => notes.map(note => note.title);
    const notes = [
      { title: "Soon", dueAt: "2026-01-01T12:00:00Z", completed: false },
      { title: "Done", dueAt: "2026-01-01T12:00:00Z", completed: true },
      { title: "Later", dueAt: "2026-01-03T12:00:00Z", completed: false }
    ];
    rows.push(resultRow("Due reminders only", ["Soon"], reference(notes), broken(notes)));
  } else if (key === "expense:budget") {
    const reference = (spent, budget) => spent >= budget ? "exceeded" : spent >= budget * 0.8 ? "warning" : "ok";
    const broken = (spent, budget) => spent >= budget ? "exceeded" : "ok";
    rows.push(resultRow("Warning at 80%", "warning", reference(800, 1000), broken(800, 1000)));
    rows.push(resultRow("Exceeded at 120%", "exceeded", reference(1200, 1000), broken(1200, 1000)));
    rows.push(resultRow("No alert below threshold", "ok", reference(300, 1000), broken(300, 1000)));
  } else if (key === "expense:categories") {
    const reference = merchant => {
      const text = merchant.trim().toLowerCase();
      if (text.includes("zomato")) return "Food";
      if (text.includes("uber")) return "Travel";
      return "Other";
    };
    const broken = merchant => merchant.includes("ZOMATO") ? "Food" : "Other";
    rows.push(resultRow("Case-insensitive food category", "Food", reference("zomato"), broken("zomato")));
    rows.push(resultRow("Travel category", "Travel", reference("Uber trip"), broken("Uber trip")));
  } else if (key === "expense:exportCsv") {
    const reference = note => /[",\n]/.test(note) ? '"' + note.replaceAll('"', '""') + '"' : note;
    const broken = note => note;
    rows.push(resultRow("Escape comma note", '"Tea, snacks"', reference("Tea, snacks"), broken("Tea, snacks")));
    rows.push(resultRow("Escape quote note", '"Say ""hi"""', reference('Say "hi"'), broken('Say "hi"')));
  }

  const passed = rows.filter(row => row.referencePass).length;
  const caught = rows.filter(row => row.brokenCaught).length;
  return {
    rows,
    summary: {
      referencePassed: passed,
      totalChecks: rows.length,
      brokenCaught: caught,
      score: rows.length ? Math.round(((passed + caught) / (rows.length * 2)) * 100) : 0
    }
  };
}

function list(items) {
  return `<ul>${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function renderBrief(pkg) {
  return `
    <div class="explain">
      <strong>${state.explanation === "Hinglish" ? "Hinglish explanation" : "Explanation"}</strong>
      <p>${escapeHtml(pkg.explanation)}</p>
      <div class="tag-row">${pkg.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
    </div>
    <div class="grid-2">
      <article class="card"><h3>User story</h3><p>${escapeHtml(pkg.story)}</p></article>
      <article class="card"><h3>Starting repo</h3><p><strong>${escapeHtml(pkg.repo.name)}</strong><br>${escapeHtml(pkg.repo.version)} · ${escapeHtml(pkg.repo.stack)}</p><p style="margin-top:10px">${pkg.repo.starterFiles.map(escapeHtml).join("<br>")}</p></article>
      <article class="card"><h3>Requirements</h3>${list(pkg.requirements)}</article>
      <article class="card"><h3>Acceptance criteria</h3>${list(pkg.acceptanceCriteria)}</article>
      <article class="card"><h3>Edge cases</h3>${list(pkg.edgeCases)}</article>
      <article class="card"><h3>Existing functionality to protect</h3>${list(pkg.repo.existingFeatures)}</article>
    </div>`;
}

function renderCode(title, code) {
  return `
    <div class="code-head">
      <h3>${escapeHtml(title)}</h3>
      <button type="button" class="ghost copy-code">Copy</button>
    </div>
    <pre><code>${escapeHtml(code)}</code></pre>`;
}

function renderTests(pkg) {
  return `
    ${renderCode("Feature tests", pkg.featureTests)}
    <div style="height:14px"></div>
    <article class="card"><h3>Regression checks</h3>${list(pkg.regressionChecks)}</article>`;
}

function renderValidation(pkg) {
  const summary = pkg.validation.summary;
  const rows = pkg.validation.rows.map(row => `
    <tr>
      <td>${escapeHtml(row.name)}</td>
      <td><code>${escapeHtml(JSON.stringify(row.expected))}</code></td>
      <td class="status pass">${row.referencePass ? "Pass" : "Fail"}</td>
      <td class="status catch">${row.brokenCaught ? "Caught" : "Not caught"}</td>
    </tr>`).join("");
  return `
    <div class="metrics">
      <div class="metric good"><strong>${summary.referencePassed}/${summary.totalChecks}</strong><span>reference checks passed</span></div>
      <div class="metric warn"><strong>${summary.brokenCaught}/${summary.totalChecks}</strong><span>broken logic caught</span></div>
      <div class="metric"><strong>${summary.score}%</strong><span>validation score</span></div>
      <div class="metric"><strong>${pkg.rubric.length}</strong><span>rubric criteria</span></div>
    </div>
    <table>
      <thead><tr><th>Check</th><th>Expected</th><th>Reference</th><th>Broken logic</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="height:14px"></div>
    <article class="card"><h3>Scoring rubric</h3>${list(pkg.rubric.map(item => `${item.criterion} — ${item.weight}%`))}</article>`;
}

function renderJson(pkg) {
  return renderCode("Task package JSON", JSON.stringify(pkg, null, 2));
}

function renderPackage() {
  state.package = buildPackage(state);
  const pkg = state.package;
  document.getElementById("packageId").textContent = pkg.id;
  document.getElementById("packageTitle").textContent = pkg.title;
  document.getElementById("packageMeta").textContent = `${pkg.repo.version} · ${pkg.language} · ${pkg.difficulty} · ${pkg.feature}`;
  document.getElementById("tab-brief").innerHTML = renderBrief(pkg);
  document.getElementById("tab-solution").innerHTML = renderCode("Reference implementation", pkg.referenceImplementation);
  document.getElementById("tab-tests").innerHTML = renderTests(pkg);
  document.getElementById("tab-validation").innerHTML = renderValidation(pkg);
  document.getElementById("tab-json").innerHTML = renderJson(pkg);
  bindCopyButtons();
}

function populateRepos() {
  const repoSelect = document.getElementById("repoSelect");
  repoSelect.innerHTML = Object.values(REPOS).map(repo => `<option value="${repo.id}">${repo.name}</option>`).join("");
  repoSelect.value = state.repo;
  populateFeatures();
}

function populateFeatures() {
  const featureSelect = document.getElementById("featureSelect");
  const repo = REPOS[state.repo];
  featureSelect.innerHTML = Object.entries(repo.features).map(([id, feature]) => `<option value="${id}">${feature.label}</option>`).join("");
  if (!repo.features[state.feature]) state.feature = Object.keys(repo.features)[0];
  featureSelect.value = state.feature;
}

function bindSegmented(id, key) {
  const group = document.getElementById(id);
  group.addEventListener("click", event => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    state[key] = button.dataset.value;
    group.querySelectorAll("button").forEach(item => item.classList.toggle("active", item === button));
  });
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    showToast(message);
  } catch {
    showToast("Copy failed — select the text manually");
  }
}

function bindCopyButtons() {
  document.querySelectorAll(".copy-code").forEach(button => {
    button.addEventListener("click", () => {
      const code = button.closest(".tab-panel").querySelector("code").textContent;
      copyText(code, "Copied");
    });
  });
}

function downloadJson() {
  const blob = new Blob([JSON.stringify(state.package, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${state.package.id}-task-package.json`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("JSON downloaded");
}

function setSample(sample) {
  const map = {
    "shopping-discount": ["shopping", "discount"],
    "notes-search": ["notes", "search"],
    "expense-budget": ["expense", "budget"]
  };
  const [repo, feature] = map[sample];
  state.repo = repo;
  state.feature = feature;
  document.getElementById("repoSelect").value = repo;
  populateFeatures();
  renderPackage();
}

function init() {
  populateRepos();
  bindSegmented("difficultyGroup", "difficulty");
  bindSegmented("languageGroup", "language");
  bindSegmented("explainGroup", "explanation");

  document.getElementById("repoSelect").addEventListener("change", event => {
    state.repo = event.target.value;
    populateFeatures();
  });
  document.getElementById("featureSelect").addEventListener("change", event => {
    state.feature = event.target.value;
  });
  document.getElementById("generateBtn").addEventListener("click", () => {
    renderPackage();
    showToast("Task package generated");
  });
  document.getElementById("copyJsonBtn").addEventListener("click", () => copyText(JSON.stringify(state.package, null, 2), "JSON copied"));
  document.getElementById("downloadJsonBtn").addEventListener("click", downloadJson);
  document.querySelectorAll(".sample").forEach(button => {
    button.addEventListener("click", () => setSample(button.dataset.sample));
  });
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(item => item.classList.toggle("active", item === tab));
      document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === `tab-${tab.dataset.tab}`));
    });
  });

  renderPackage();
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", init);
}

if (typeof module !== "undefined") {
  module.exports = { REPOS, buildPackage, runValidation };
}
