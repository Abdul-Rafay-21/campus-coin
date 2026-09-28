export function suggestCategory(description, categories) {
  const normalizedDescription = String(description || "")
    .toLowerCase()
    .trim();

  if (!normalizedDescription) return null;

  const rules = [
    [
      "Food",
      /cafe|coffee|restaurant|canteen|burger|pizza|food|lunch|breakfast|dinner|grocery|delivery/,
    ],

    [
      "Transport",
      /uber|careem|bus|metro|fuel|petrol|taxi|ride|rickshaw|transport/,
    ],

    ["Hostel\/Rent", /hostel|rent|room|utilities|electricity/],

    [
      "Academics",
      /book|tuition|university|college|stationery|course|print|exam/,
    ],

    [
      "Subscriptions",
      /netflix|spotify|subscription|cloud|youtube premium|app store/,
    ],

    ["Entertainment", /cinema|movie|game|concert|outing/],

    ["Allowance", /allowance|pocket money/],

    ["Scholarship", /scholarship|grant/],

    ["Part-time Job", /salary|freelance|part.time|gig|client/],

    ["Gift", /gift|birthday/],
  ];

  const matchingRule = rules.find(([, pattern]) =>
    pattern.test(normalizedDescription),
  );

  if (matchingRule) {
    const category = categories.find((item) =>
      new RegExp(matchingRule[0], "i").test(item.name),
    );

    if (category)
      return {
        categoryId: String(category._id),
        name: category.name,
        method: "keyword rule",
      };
  }
  return null;
}
