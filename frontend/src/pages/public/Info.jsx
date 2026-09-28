/** Public Info public website page with Campus Coin information and navigation. */
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  Bot,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  FileDown,
  FileUp,
  GraduationCap,
  HeartHandshake,
  KeyRound,
  ListChecks,
  Lightbulb,
  LockKeyhole,
  Minus,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  Type,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import { SpotlightRow } from "../../components/PublicSections";
const featureCards = [
  {
    icon: Wallet,
    title: "Every transaction, in one place",
    text: "Capture allowance, part-time income and student spending with clear categories, dates and notes.",
    meta: "INCOME & EXPENSES",
  },
  {
    icon: Target,
    title: "Budgets that work around campus",
    text: "Set monthly category limits for food, transport, hostel or rent and receive alerts as you approach them.",
    meta: "MONTHLY LIMITS",
  },
  {
    icon: PieChart,
    title: "Reports without the guesswork",
    text: "Discover your spending by category, spot patterns and export your monthly report for your own records.",
    meta: "CLEAR ANALYTICS",
  },
  {
    icon: FileDown,
    title: "Bring your past entries",
    text: "Import historical transactions from CSV, preview them first and fix category selections before saving.",
    meta: "CSV IMPORT",
  },
  {
    icon: Lightbulb,
    title: "Tips from your own habits",
    text: "Compare current spending against your previous months and budgets. Keep tips you find useful.",
    meta: "SAVING HABITS",
  },
  {
    icon: Sparkles,
    title: "A coach grounded in your records",
    text: "Ask simple questions about your selected month and receive answers based on your recorded totals and budgets.",
    meta: "MONEY COACH",
  },
  {
    icon: BellRing,
    title: "Reminders that stay in the app",
    text: "See budget alerts, account updates and announcements from the notification bell without leaving your workspace.",
    meta: "NOTIFICATIONS",
  },
  {
    icon: ListChecks,
    title: "Categories you control",
    text: "Use useful defaults or create personal income and expense categories that match the way you live and study.",
    meta: "ORGANIZATION",
  },
  {
    icon: Smartphone,
    title: "Comfortable on any screen",
    text: "Record on your phone, review on a laptop. Choose a light or dark theme and the font size that suits you.",
    meta: "PERSONAL SETTINGS",
  },
];
const featureSpotlights = [
  {
    image: "/images/notebook-writing.webp",
    alt: "A student writing notes in a notebook next to a cup of coffee",
    chip: "Transactions",
    chipIcon: Wallet,
    kicker: "RECORD THE EVERYDAY",
    title: (
      <>
        Add an entry in <em>a few seconds.</em>
      </>
    ),
    text: "Enter an amount, choose a category, pick the date and add an optional note. Filters by type and category make any entry easy to find again, and you can edit it whenever plans change.",
    points: [
      "Income and expense entries with dates and notes",
      "Filter by type or category to find entries fast",
      "Every change is kept in a transaction history",
    ],
  },
  {
    image: "/images/monthly-planner.webp",
    alt: "A monthly planner with goals written on it beside a cup of coffee",
    chip: "Budgets",
    chipIcon: Target,
    kicker: "PLAN EACH MONTH",
    title: (
      <>
        Limits that speak up <em>before it's too late.</em>
      </>
    ),
    text: "Budgets are set per month, so you can give yourself more room during exam season and tighten things in a quieter month. Choose when alerts begin, from 70% to 95% of a limit.",
    points: [
      "A separate limit for every expense category",
      "Progress bars that fill as you spend",
      "Alerts in the notification bell when you get close",
    ],
    reverse: true,
  },
  {
    image: "/images/report-charts.webp",
    alt: "Printed charts and graphs on a desk next to a tablet",
    chip: "Reports",
    chipIcon: BarChart3,
    kicker: "UNDERSTAND THE MONTH",
    title: (
      <>
        Monthly reports <em>you can keep.</em>
      </>
    ),
    text: "See spending by category, compare income and expenses, and follow a six-month trend that shows where your habits are heading.",
    points: [
      "Category breakdowns with clear charts",
      "Download a spreadsheet-ready CSV report",
      "Send the month's report to your own inbox",
    ],
  },
  {
    image: "/images/laptop-coffee-notes.webp",
    alt: "An open notebook and pen in front of a laptop and a coffee mug",
    chip: "CSV import",
    chipIcon: FileUp,
    kicker: "BRING YOUR HISTORY",
    title: (
      <>
        Start with the months <em>you already have.</em>
      </>
    ),
    text: "Already kept notes in a spreadsheet? Drop in a CSV file, check every row in the preview and fix categories before anything is saved.",
    points: [
      "Drag-and-drop CSV upload",
      "Row-by-row preview before importing",
      "Change the category of any row in one click",
    ],
    reverse: true,
  },
  {
    image: "/images/stacking-coins.webp",
    alt: "A person carefully stacking coins into small piles",
    chip: "Insights & coach",
    chipIcon: Bot,
    kicker: "GROW BETTER HABITS",
    title: (
      <>
        Guidance built from <em>your own numbers.</em>
      </>
    ),
    text: "Insights point out what changed since last month. Saving tips suggest realistic adjustments, and the Money Coach answers questions like “Which budget needs attention?”",
    points: [
      "Month-over-month insights on your spending",
      "Saving tips you can bookmark or dismiss",
      "A coach that uses your totals, budgets and goal",
    ],
  },
  {
    image: "/images/phone-apps.webp",
    alt: "A smartphone home screen resting on a table",
    chip: "Every device",
    chipIcon: Smartphone,
    kicker: "MADE FOR YOUR ROUTINE",
    title: (
      <>
        Your workspace, <em>on every screen.</em>
      </>
    ),
    text: "Log a purchase on your phone in the canteen queue and review your month on a laptop later. Your profile, theme and font size follow you everywhere.",
    points: [
      "Responsive on phones, tablets and laptops",
      "Light and dark themes with adjustable font size",
      "Profile photo, currency and allowance baseline",
    ],
    reverse: true,
  },
];
const comparisonRows = [
  ["Categories made for student life", false, false, true],
  ["Totals calculated for you", false, "With formulas", true],
  ["Monthly budget alerts", false, false, true],
  ["Charts and six-month trends", false, "Build your own", true],
  ["Saving tips from your habits", false, false, true],
  ["Easy to update on a phone", true, "Difficult", true],
  ["Import past records", false, true, "CSV with preview"],
];
const monthlyLoop = [
  [CalendarCheck, "Start the month", "Choose the month, review your allowance baseline and confirm the goals you want to track."],
  [Wallet, "Record consistently", "Add income and expenses with a date, category and optional note whenever it is convenient."],
  [BarChart3, "Review the picture", "Compare income, spending, savings and category totals from one dashboard and report view."],
  [Target, "Adjust the next step", "Update a budget, bookmark a useful tip or set a more realistic savings target for next month."],
];
const howSteps = [
  {
    n: "01",
    title: "Create your own space",
    text: "Register and verify your email, then add your academic year, allowance baseline and a savings goal if you have one.",
    points: [
      "Sign up with your name and email address",
      "Open the verification link in your inbox",
      "Pick your currency and set a monthly savings goal",
    ],
    href: "/register",
    label: "Create an account",
    image: "/images/study-desk.webp",
    alt: "A desk with a notebook, laptop, tablet and coffee seen from above",
  },
  {
    n: "02",
    title: "Record the everyday",
    text: "Add income and expenses, select student-friendly categories and import a CSV when you want to bring historical data.",
    points: [
      "Add an amount, category, date and optional note",
      "Create personal categories for anything unusual",
      "Import older records from a CSV file",
    ],
    href: "/features",
    label: "Explore transactions",
    image: "/images/notebook-writing.webp",
    alt: "A student writing notes in a notebook next to a cup of coffee",
  },
  {
    n: "03",
    title: "Give your money a plan",
    text: "Set monthly limits per category, check progress bars and receive notifications when your recorded spending gets close to your limits.",
    points: [
      "Set a limit for each expense category",
      "Choose when alerts start, from 70% to 95%",
      "Watch available savings against your goal",
    ],
    href: "/features",
    label: "See budgeting tools",
    image: "/images/monthly-planner.webp",
    alt: "A monthly planner with goals written on it beside a cup of coffee",
  },
  {
    n: "04",
    title: "Look back and learn",
    text: "Review your monthly reports, compare trends, export a CSV and save the tips or insights you want to keep.",
    points: [
      "Compare this month with the months before",
      "Download or email your monthly report",
      "Bookmark tips and ask the Money Coach",
    ],
    href: "/faq",
    label: "Read common questions",
    image: "/images/report-charts.webp",
    alt: "Printed charts and graphs on a desk next to a tablet",
  },
];
const sampleWeek = [
  {
    day: "MONDAY",
    title: "Allowance arrives",
    text: "Record your monthly allowance as income so your dashboard knows what you have to work with.",
    entry: ["Allowance", "+ Rs 20,000", "in"],
  },
  {
    day: "TUESDAY",
    title: "Lunch between lectures",
    text: "Log the canteen lunch straight away. It takes seconds and goes under Food.",
    entry: ["Canteen lunch", "− Rs 350", "out"],
  },
  {
    day: "THURSDAY",
    title: "A budget alert arrives",
    text: "Your Food budget reaches 80%. The notification bell lets you know in time to plan the weekend.",
    entry: ["Food budget", "80% used", "out"],
  },
  {
    day: "SUNDAY",
    title: "The weekly check-in",
    text: "Open your report, compare with last month and ask the Money Coach which budget needs attention.",
    entry: ["Left this month", "Rs 12,400", "in"],
  },
];
const principles = [
  [ShieldCheck, "Student data stays personal", "Your transactions belong to your account; there is no public spending feed."],
  [HeartHandshake, "Advice without pressure", "Tips are suggestions you can pin, dismiss or override."],
  [BadgeCheck, "Clear, honest numbers", "Every figure comes from the entries you made, with no hidden calculations."],
  [Smartphone, "Made for small screens", "Record a purchase on your phone, then review the month on a laptop later."],
  [Type, "Comfortable to use", "Light and dark themes and adjustable font sizes keep the workspace easy on the eyes."],
  [Sparkles, "Simple over complicated", "Plain language instead of accounting jargon, so anyone can build a budget."],
];
const aboutAudiences = [
  {
    image: "/images/friends-cafe.webp",
    alt: "Four friends smiling and chatting around a café table",
    icon: GraduationCap,
    title: "Students managing an allowance",
    text: "See what remains after food, transport, books and everyday campus spending.",
  },
  {
    image: "/images/library-study-group.webp",
    alt: "Students laughing together over laptops in a library",
    icon: BookOpen,
    title: "Students balancing work and study",
    text: "Record part-time income beside academic and living expenses without spreadsheet clutter.",
  },
  {
    image: "/images/notebook-writing.webp",
    alt: "A student writing notes in a notebook next to a cup of coffee",
    icon: UsersRound,
    title: "First-time budget builders",
    text: "Learn a simple monthly routine without jargon or complicated spreadsheets.",
  },
];
const campusGallery = [
  ["/images/graduation.webp", "Graduates throwing their caps into the air at sunset", "GRADUATION DAY"],
  ["/images/cafe-coffee.webp", "Friends raising coffee cups together over a café table", "COFFEE WITH FRIENDS"],
  ["/images/books-stack.webp", "A tall stack of colourful hardcover books", "EXAM SEASON"],
  ["/images/library-aisle.webp", "A student with a backpack walking between library shelves", "LATE NIGHTS IN THE LIBRARY"],
];
const faqGroups = [
  {
    id: "faq-accounts",
    icon: UserRound,
    title: "Accounts",
    items: [
      [
        "What do I need to get started?",
        "Just an email address. Register, verify your email and add your first transaction. The whole thing takes about a minute.",
      ],
      [
        "How do I create a student account?",
        "Choose Get started, enter your name, email and a strong password, then open the verification link sent to your inbox.",
      ],
      [
        "I forgot my password. What should I do?",
        "Select Forgot password on the login page and enter your email. You will receive a secure link to choose a new password.",
      ],
      [
        "Can I change my details or savings goal later?",
        "Yes. Open My profile to update your name, academic year, allowance baseline, savings goal, currency and profile photo.",
      ],
    ],
  },
  {
    id: "faq-transactions",
    icon: Wallet,
    title: "Transactions",
    items: [
      [
        "Can I create my own categories?",
        "Yes. Add personal income or expense categories alongside the system defaults, and use them when creating transactions and budgets.",
      ],
      [
        "Can I edit or delete a transaction?",
        "Yes. Open Transactions, find the entry using the type and category filters, then edit or delete it. Each entry keeps a history of its changes.",
      ],
      [
        "Can I import my older records?",
        "Yes. Upload a CSV file on the CSV import page. Every row appears in a preview so you can check amounts and categories before importing.",
      ],
      [
        "What should I do before importing a CSV?",
        "Use the required column headings, check the preview carefully and confirm every category before importing. Keep a copy of the original file for your records.",
      ],
    ],
  },
  {
    id: "faq-budgets",
    icon: Target,
    title: "Budgets",
    items: [
      [
        "What happens when I exceed a budget?",
        "The dashboard compares logged category expenses with your monthly limit and creates in-app alerts when you approach or exceed the budget.",
      ],
      [
        "Can I set a different budget each month?",
        "Yes. Budgets are saved per month, so you can raise a limit during exam season or lower it in a quieter month. You also choose when alerts start, from 70% to 95% of a limit.",
      ],
      [
        "How is available savings calculated?",
        "It is your recorded income minus your recorded expenses for the selected month, shown beside the savings goal from your profile.",
      ],
    ],
  },
  {
    id: "faq-reports",
    icon: BarChart3,
    title: "Reports & guidance",
    items: [
      [
        "Can I download or share my report?",
        "Yes. From Reports you can download the selected month as a CSV or send that CSV to your registered email address.",
      ],
      [
        "How are suggestions created?",
        "Campus Coin uses your recorded totals, budgets and simple spending rules to create insights and saving tips.",
      ],
      [
        "How does the Money Coach work?",
        "It answers questions such as “How much have I saved this month?” using the totals, budgets and savings goal already recorded in your account. It offers suggestions, and you always make the final decision.",
      ],
      [
        "Is this professional financial advice?",
        "No. Campus Coin offers everyday budgeting information and personalized suggestions, not professional or certified financial advice.",
      ],
    ],
  },
  {
    id: "faq-privacy",
    icon: LockKeyhole,
    title: "Privacy & security",
    items: [
      [
        "Who can see my transactions?",
        "You can, and so can platform administrators who manage student accounts. Your entries are never shown publicly or to other students.",
      ],
      [
        "Can administrators see my password?",
        "No. Passwords are stored as secure hashes. Administrators can manage account status and platform content, but should never receive your password.",
      ],
      [
        "Where can I find my notifications?",
        "Click the bell in your dashboard header to preview updates. Show all opens a popup with the complete list, so you stay on the page you were viewing.",
      ],
      [
        "Can I use Campus Coin on a phone?",
        "Yes. Public pages and the student workspace are responsive, including navigation, transaction forms, reports and settings.",
      ],
    ],
  },
];
const policies = {
  privacy: {
    title: "Privacy overview",
    lead: "A plain-language guide to the information Campus Coin keeps, how it is used and the choices you have.",
    banner: ["/images/laptop-coffee-notes.webp", "An open notebook and pen in front of a laptop and a coffee mug"],
    chips: [
      [Clock, "Updated September 2026"],
      [BookOpen, "3 minute read"],
    ],
    summary: [
      [LockKeyhole, "Tied to your account", "Your entries are never shown publicly or to other students."],
      [ListChecks, "Only what is needed", "We keep the details required to run your budgets and reports."],
      [UserRound, "You stay in control", "Edit or delete your own entries and settings at any time."],
    ],
    sections: [
      {
        title: "Information you give us",
        text: "When you create and use an account, Campus Coin stores the details needed to run your workspace:",
        points: [
          "Your name, email address and optional academic year",
          "Your currency, monthly allowance baseline and savings goal",
          "The transactions, categories, budgets and notes you create",
          "An optional profile photo and your display preferences",
        ],
      },
      {
        title: "How your information is used",
        text: "Your information is used to provide Campus Coin features, including:",
        points: [
          "Calculating your dashboard, budgets, reports and insights",
          "Creating saving tips and Money Coach answers from your totals",
          "Showing in-app notifications such as budget alerts",
          "Sending the account emails you need, like verification and password reset",
        ],
      },
      {
        title: "Who can see your information",
        text: "Your transactions are tied to your account and are never shown publicly or to other students. Platform administrators can view student account details, including recent activity, totals and budgets, so they can support students and manage accounts. Administrators can never see your password.",
      },
      {
        title: "Emails we send",
        text: "Campus Coin sends emails for account verification and password resets. Monthly reports are emailed only when you request one, and only to your registered email address.",
      },
      {
        title: "Keeping your account secure",
        text: "Passwords are stored as secure hashes, never as plain text. You can help keep your account safe too:",
        points: [
          "Use a strong password that you don't use anywhere else",
          "Sign out when you use a shared or public computer",
          "Keep passwords and other sensitive details out of notes and coach messages",
        ],
      },
      {
        title: "Reports and downloads",
        text: "CSV reports are created only when you ask for them. Once downloaded, the file is saved on your own device, so keep it somewhere safe.",
      },
      {
        title: "Profile photos",
        text: "If you upload a profile photo, it is cropped and optimized in your browser before it is saved. Choose an image you are comfortable showing in your workspace.",
      },
      {
        title: "Your choices",
        text: "You stay in control of your workspace:",
        points: [
          "Update your name, academic year, currency and goals in My profile",
          "Change your password and notification settings in Settings",
          "Edit or delete any transaction, category or budget you created",
          "Ask a platform administrator if you would like your account removed",
        ],
      },
      {
        title: "Changes to this overview",
        text: "This overview may be updated as Campus Coin grows. Important changes will be shared through in-app announcements.",
      },
    ],
  },
  terms: {
    title: "Terms & usage",
    lead: "The simple ground rules for using Campus Coin, written in plain language.",
    banner: ["/images/pen-writing.webp", "A fountain pen writing on lined paper"],
    chips: [
      [Clock, "Updated September 2026"],
      [BookOpen, "4 minute read"],
    ],
    summary: [
      [KeyRound, "One student, one account", "Keep your login details private and secure."],
      [BadgeCheck, "Accurate entries", "Reports are only as useful as the data you add."],
      [HeartHandshake, "Respectful use", "Help keep Campus Coin safe for every student."],
    ],
    sections: [
      {
        title: "About Campus Coin",
        text: "Campus Coin is a personal budgeting and expense-tracking workspace for students. It helps you record income and expenses, plan monthly budgets and understand your spending through reports, insights and tips.",
      },
      {
        title: "Your account",
        text: "When you create an account, you agree to:",
        points: [
          "Provide accurate registration details and verify your email",
          "Keep your password private and not share your account",
          "Sign in only to accounts you are authorized to use",
          "Tell an administrator if you think your account has been misused",
        ],
      },
      {
        title: "Your entries and reports",
        text: "You are responsible for the accuracy of the transactions, categories, budgets, goals and files you add. Reports and insights are calculated from those entries, so review important figures before relying on them.",
      },
      {
        title: "Tips, insights and the Money Coach",
        text: "Tips, insights and coach replies are general budgeting guidance generated from your own records. They are meant to help you think about your money and are not professional financial, legal or tax advice.",
      },
      {
        title: "Acceptable use",
        text: "Please use Campus Coin respectfully. You agree not to:",
        points: [
          "Try to access another student's account or data",
          "Disrupt, overload or attempt to break the service",
          "Upload harmful, offensive or illegal content",
          "Store passwords or other confidential records in descriptions or notes",
        ],
      },
      {
        title: "Announcements and shared content",
        text: "Administrators may publish announcements, default categories and saving-tip templates for all students. This content is provided as general information to help you get more from Campus Coin.",
      },
      {
        title: "Changes to the service",
        text: "Features may be added, improved or retired over time. Significant updates will be shared through in-app announcements whenever possible.",
      },
      {
        title: "Suspension and removal",
        text: "Administrators may suspend or remove accounts that break these terms or put other students or the service at risk.",
      },
      {
        title: "Updates to these terms",
        text: "These terms may be updated as Campus Coin evolves. Continuing to use your account after an update means you accept the revised terms.",
      },
    ],
  },
};
function FeaturesPage() {
  return (
    <main className="public-detail wrap">
      <div className="detail-hero">
        <span className="section-kicker">TOOLS FOR YOUR CAMPUS LIFE</span>
        <h1>
          Your money, organized.
          <br />
          <em>Your next move, clearer.</em>
        </h1>
        <p>
          Everything you need to record what comes in, make sense of what goes
          out and build habits that fit student life.
        </p>
        <Link to="/register" className="button button-primary button-large">
          Start tracking <ArrowUpRight size={18} />
        </Link>
      </div>
      <div className="detail-feature-photo">
        <img
          src="/images/study-desk.webp"
          alt="A desk with a notebook, laptop, tablet and coffee seen from above"
        />
        <div>
          <span className="section-kicker">TRACK THE MOMENTS THAT MATTER</span>
          <h2>
            Allowance to academics.
            <br />
            <em>It all adds up.</em>
          </h2>
          <p>
            Keep your own record of food, transport, hostel bills, books and
            outings in one organized place, and see how each one shapes your
            month.
          </p>
          <div>
            <span>
              <Check size={15} /> Manual entry
            </span>
            <span>
              <Check size={15} /> CSV import
            </span>
            <span>
              <Check size={15} /> Personal categories
            </span>
          </div>
        </div>
      </div>
      <div className="feature-grid detail-feature-grid">
        {featureCards.map(({ icon: Icon, title, text, meta }) => (
          <article className="feature-card" key={title}>
            <span className="feature-icon">
              <Icon size={25} />
            </span>
            <span className="feature-index">{meta}</span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="public-heading">
        <span className="section-kicker">FEATURE BY FEATURE</span>
        <h2>
          A closer look at
          <em> every tool.</em>
        </h2>
        <p>
          Each part of the student workspace is designed around a real
          moment in your month, from the first entry to the final review.
        </p>
      </div>
      <div className="spotlight-rows">
        {featureSpotlights.map((spotlight) => (
          <SpotlightRow key={spotlight.chip} {...spotlight} />
        ))}
      </div>
      <div className="public-heading">
        <span className="section-kicker">WHY STUDENTS SWITCH</span>
        <h2>
          Better than a notebook.
          <em> Easier than a spreadsheet.</em>
        </h2>
        <p>
          Paper notes are easy to lose and spreadsheets take time to build.
          Campus Coin gives you the useful parts of both, ready from day one.
        </p>
      </div>
      <div className="compare-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th scope="col">What you get</th>
              <th scope="col">Paper notebook</th>
              <th scope="col">Spreadsheet</th>
              <th scope="col" className="is-us">
                Campus Coin
              </th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map(([label, ...values]) => (
              <tr key={label}>
                <th scope="row">{label}</th>
                {values.map((value, index) => (
                  <td key={index} className={index === 2 ? "is-us" : ""}>
                    {value === true ? (
                      <Check className="yes" size={17} aria-label="Yes" />
                    ) : value === false ? (
                      <Minus className="no" size={17} aria-label="No" />
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="detail-heading centered-heading">
        <span className="section-kicker">A SIMPLE MONTHLY RHYTHM</span>
        <h2>
          Record, review and adjust.
          <br />
          <em>Then do it again.</em>
        </h2>
      </div>
      <MonthlyLoop />
      <section className="feature-detail-band">
        <img
          src="/images/checklist.webp"
          alt="A hand ticking items off a checklist in a notebook"
          loading="lazy"
        />
        <div>
          <span className="section-kicker">WHAT STAYS IN YOUR CONTROL</span>
          <h2>You decide what gets recorded.</h2>
          <p>
            You choose what to record, which categories to use and when to
            export a report. Campus Coin gives those entries structure so they
            are easier to understand and act on.
          </p>
          <ul>
            <li><Check size={16} /> Edit or remove your own transactions</li>
            <li><Check size={16} /> Create personal categories and budgets</li>
            <li><Check size={16} /> Download reports when you need them</li>
          </ul>
        </div>
      </section>
      <BottomCTA />
    </main>
  );
}
function HowItWorksPage() {
  return (
    <main className="public-detail wrap">
      <div className="detail-hero">
        <span className="section-kicker">THE CAMPUS COIN WORKFLOW</span>
        <h1>
          Less wondering.
          <br />
          <em>More knowing.</em>
        </h1>
        <p>
          No complicated setup or accounting terms. Your spending story
          starts with one entry.
        </p>
      </div>
      <div className="how-steps">
        {howSteps.map(({ n, title, text, points, href, label, image, alt }) => (
          <article className="how-step" key={n}>
            <div className="how-step-number">{n}</div>
            <div>
              <span className="section-kicker">STEP {n}</span>
              <h2>{title}</h2>
              <p>{text}</p>
              <ul>
                {points.map((point) => (
                  <li key={point}>
                    <Check size={15} /> {point}
                  </li>
                ))}
              </ul>
              <Link className="inline-link" to={href}>
                {label} <ArrowRight size={17} />
              </Link>
            </div>
            <img src={image} loading="lazy" alt={alt} />
          </article>
        ))}
      </div>
      <div className="public-heading">
        <span className="section-kicker">A WEEK WITH CAMPUS COIN</span>
        <h2>
          What a normal week
          <em> actually looks like.</em>
        </h2>
        <p>
          A few seconds a day and a few minutes on Sunday are enough to keep
          an accurate picture of your month.
        </p>
      </div>
      <div className="week-timeline">
        {sampleWeek.map(({ day, title, text, entry: [name, amount, tone] }) => (
          <article key={day}>
            <span className="week-day">{day}</span>
            <h3>{title}</h3>
            <p>{text}</p>
            <div className="week-entry">
              <span>{name}</span>
              <em className={tone}>{amount}</em>
            </div>
          </article>
        ))}
      </div>
      <div className="detail-heading centered-heading">
        <span className="section-kicker">A ROUTINE YOU CAN REPEAT</span>
        <h2>
          One useful loop for
          <br />
          <em>every month.</em>
        </h2>
      </div>
      <MonthlyLoop />
      <section className="public-boundary">
        <div>
          <span className="section-kicker">SMALL HABITS, STEADY PROGRESS</span>
          <h2>A routine that takes minutes, not hours.</h2>
          <p>
            You don't need to be a finance expert. Three light habits keep
            your dashboard accurate and your budgets useful all month long.
          </p>
        </div>
        <div className="boundary-points">
          <span><Check size={16} /> Log spending on the same day it happens</span>
          <span><Check size={16} /> Check your budgets once a week</span>
          <span><Check size={16} /> Review your report at the end of each month</span>
        </div>
      </section>
      <BottomCTA />
    </main>
  );
}
function AboutPage() {
  return (
    <main className="public-detail wrap">
      <div className="detail-hero">
        <span className="section-kicker">OUR STORY / MADE FOR STUDENTS</span>
        <h1>
          Your money deserves
          <br />
          <em>a little more clarity.</em>
        </h1>
        <p>
          Campus Coin makes everyday budgeting feel approachable for
          university life — one allowance, snack or savings goal at a time.
        </p>
      </div>
      <div className="about-photo-grid">
        <div className="about-photo-main">
          <img
            src="/images/library-study-group.webp"
            alt="Students laughing together over laptops in a library"
          />
          <span>SMALL ENTRIES. BIGGER PICTURE.</span>
        </div>
        <div className="about-aside">
          <span className="about-symbol">
            <GraduationCap size={38} />
          </span>
          <h2>Built around the way students actually spend.</h2>
          <p>
            Money arrives in many ways: an allowance, a part-time role, a
            scholarship or a gift. Spending happens just as quickly, from
            books to lunch between lectures. A clear record helps you
            understand it all.
          </p>
          <div className="about-mini">
            <CheckCircle2 size={19} /> Quick manual entries and CSV import.
          </div>
          <div className="about-mini">
            <CheckCircle2 size={19} /> Useful budgets, reports and saving
            habits.
          </div>
          <div className="about-mini">
            <CheckCircle2 size={19} /> Works on your phone, tablet and laptop.
          </div>
        </div>
      </div>
      <section className="about-story">
        <div className="about-story-media">
          <img
            src="/images/lecture-hall.webp"
            alt="Students seated in a large university lecture hall"
            loading="lazy"
          />
          <img
            src="/images/coins-growth.webp"
            alt="A green plant growing out of a pile of coins"
            loading="lazy"
          />
        </div>
        <div className="about-story-copy">
          <span className="section-kicker">WHY CAMPUS COIN EXISTS</span>
          <h2>
            Student money is small,
            <em> and it moves fast.</em>
          </h2>
          <p>
            A student budget is rarely a single salary. It is an allowance
            from home, a few hours of part-time work, a scholarship instalment
            or a birthday gift, all arriving at different times.
          </p>
          <p>
            Spending is just as scattered: canteen lunches, bus and rickshaw
            fares, photocopies, a streaming subscription, a weekend outing.
            Each one feels small, but together they decide whether the month
            ends comfortably.
          </p>
          <p>
            Campus Coin makes that picture visible. Record what comes in and
            goes out, set limits that match your life, and let simple reports
            and tips show you what to adjust next.
          </p>
        </div>
      </section>
      <div className="detail-heading">
        <span className="section-kicker">OUR PRINCIPLES</span>
        <h2>
          Simple by design.
          <br />
          <em>Helpful by nature.</em>
        </h2>
      </div>
      <div className="feature-grid detail-principles">
        {principles.map(([Icon, title, text]) => (
          <article className="feature-card" key={title}>
            <span className="feature-icon">
              <Icon size={26} />
            </span>
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="public-heading">
        <span className="section-kicker">LIFE ON CAMPUS</span>
        <h2>
          Built for the moments
          <em> between lectures.</em>
        </h2>
        <p>
          Exam weeks, coffee breaks, library nights and graduation day. Every
          chapter of student life has a cost, and Campus Coin helps you plan
          for all of them.
        </p>
      </div>
      <div className="photo-mosaic">
        {campusGallery.map(([src, alt, caption]) => (
          <figure key={caption}>
            <img src={src} alt={alt} loading="lazy" />
            <figcaption>{caption}</figcaption>
          </figure>
        ))}
      </div>
      <div className="detail-heading">
        <span className="section-kicker">WHO IT IS FOR</span>
        <h2>
          Different student lives.
          <br />
          <em>One clear workspace.</em>
        </h2>
      </div>
      <div className="people-grid">
        {aboutAudiences.map(({ image, alt, icon: Icon, title, text }) => (
          <article className="people-card" key={title}>
            <img src={image} alt={alt} loading="lazy" />
            <div>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
      <BottomCTA />
    </main>
  );
}
function FaqPage() {
  let number = 0;
  return (
    <main className="public-detail wrap">
      <div className="detail-hero centered">
        <span className="section-kicker">HELP CENTER / FAQ</span>
        <h1>
          Good questions.
          <br />
          <em>Clear answers.</em>
        </h1>
        <p>
          Everything to know about tracking student expenses with Campus Coin.
        </p>
      </div>
      <nav className="faq-topics" aria-label="Frequently asked question topics">
        {faqGroups.map(({ id, title }) => (
          <a key={id} href={`#${id}`}>
            {title}
          </a>
        ))}
      </nav>
      <div className="faq-layout">
        <div className="faq-aside">
          <img
            className="faq-aside-photo"
            src="/images/laptop-coffee-notes.webp"
            alt="An open notebook and pen in front of a laptop and a coffee mug"
          />
          <h2>Need a hand?</h2>
          <p>
            Read the workflow and common answers to understand how Campus Coin
            works.
          </p>
          <Link to="/how-it-works" className="inline-link">
            Learn how it works <ArrowRight size={17} />
          </Link>
          <div className="faq-aside-links">
            <Link to="/features">
              Explore every feature <ArrowUpRight size={14} />
            </Link>
            <Link to="/privacy">
              Privacy overview <ArrowUpRight size={14} />
            </Link>
            <Link to="/terms">
              Terms & usage <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
        <div className="faq-list">
          {faqGroups.map(({ id, icon: Icon, title, items }) => (
            <section className="faq-group" id={id} key={id}>
              <h2 className="faq-group-title">
                <Icon size={16} /> {title}
              </h2>
              {items.map(([q, a]) => {
                number += 1;
                return (
                  <details key={q} open={number === 1}>
                    <summary>
                      <span>{String(number).padStart(2, "0")}</span>
                      {q}
                      <i>+</i>
                    </summary>
                    <p>{a}</p>
                  </details>
                );
              })}
            </section>
          ))}
        </div>
      </div>
      <BottomCTA />
    </main>
  );
}
function PolicyPage({ kind }) {
  const policy = policies[kind];
  const other = kind === "privacy" ? "terms" : "privacy";
  return (
    <main className="public-detail wrap policy-page">
      <div className="detail-hero">
        <span className="section-kicker">CAMPUS COIN / INFORMATION</span>
        <h1>
          {policy.title}
          <em>.</em>
        </h1>
        <p>{policy.lead}</p>
      </div>
      <div className="policy-banner">
        <img src={policy.banner[0]} alt={policy.banner[1]} />
        <div>
          {policy.chips.map(([Icon, label]) => (
            <span key={label}>
              <Icon size={13} /> {label}
            </span>
          ))}
        </div>
      </div>
      <div className="policy-summary">
        {policy.summary.map(([Icon, title, text]) => (
          <article key={title}>
            <Icon size={20} />
            <h3>{title}</h3>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <div className="policy-card">
        {policy.sections.map(({ title, text, points }, i) => (
          <section key={title}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <div>
              <h2>{title}</h2>
              <p>{text}</p>
              {points && (
                <ul>
                  {points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>
      <div className="policy-links">
        <Link to={`/${other}`}>
          Read {policies[other].title.toLowerCase()}
          <ArrowRight size={16} />
        </Link>
        <Link to="/faq">
          Visit frequently asked questions <ArrowRight size={16} />
        </Link>
      </div>
    </main>
  );
}
export function InfoPage({ kind }) {
  if (kind === "faq") return <FaqPage />;
  if (kind === "about") return <AboutPage />;
  if (kind === "how-it-works") return <HowItWorksPage />;
  if (kind === "privacy" || kind === "terms") return <PolicyPage kind={kind} />;
  return <FeaturesPage />;
}
function MonthlyLoop() {
  return (
    <div className="monthly-loop-grid">
      {monthlyLoop.map(([Icon, title, text], index) => (
        <article key={title}>
          <div>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <Icon size={21} />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
function BottomCTA() {
  return (
    <div className="public-detail-cta">
      <span className="section-kicker">START SMALL. STAY CONSISTENT.</span>
      <h2>
        Make your next month
        <br />
        <em>make more sense.</em>
      </h2>
      <p>Campus Coin is ready for your first entry.</p>
      <div className="public-detail-cta-actions">
        <Link to="/register" className="button button-primary button-large">
          Create a student account <ArrowUpRight size={17} />
        </Link>
        <Link to="/login" className="inline-link">
          Already registered? Sign in <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
