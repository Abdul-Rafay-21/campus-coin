/** Home public website page with Campus Coin information and navigation. */
import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Coffee,
  Coins,
  GraduationCap,
  Lightbulb,
  LockKeyhole,
  PieChart,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Target,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { PhotoTile, SpotlightRow } from "../../components/PublicSections";
const features = [
  {
    icon: Wallet,
    index: "01",
    title: "Track the everyday.",
    description:
      "Log your allowance, side income, campus snacks, transport and more in a few taps.",
    className: "track",
  },
  {
    icon: Target,
    index: "02",
    title: "Give every rupee a plan.",
    description:
      "Set realistic monthly limits for the categories that matter to your student life.",
    className: "budget",
  },
  {
    icon: BarChart3,
    index: "03",
    title: "See the bigger picture.",
    description:
      "Make sense of where your money goes with clear charts and monthly reports.",
    className: "report",
  },
  {
    icon: Lightbulb,
    index: "04",
    title: "Build better habits.",
    description: "Get useful saving tips from your own recorded spending.",
    className: "tips",
  },
];
const stats = [
  [
    "10+",
    "Money tools in one place",
    "Transactions, budgets, reports, insights, tips and a money coach.",
  ],
  [
    "1 min",
    "To create your account",
    "Sign up with your email and start with a single entry.",
  ],
  [
    "2 ways",
    "To add your entries",
    "Type them in as you go, or import a CSV of past spending.",
  ],
  [
    "CSV",
    "Spreadsheet exports on demand",
    "Download your transaction report or send it to your inbox.",
  ],
];
const steps = [
  {
    n: "01",
    title: "Create your space",
    text: "Sign up, choose your currency and set the savings goal you care about.",
    icon: GraduationCap,
  },
  {
    n: "02",
    title: "Add what comes and goes",
    text: "Record income and expenses manually or import your history with a CSV file.",
    icon: Wallet,
  },
  {
    n: "03",
    title: "Find your money rhythm",
    text: "Review your dashboards, get budget alerts and adjust as you go.",
    icon: TrendingUp,
  },
];
const studentMoments = [
  {
    icon: CalendarDays,
    title: "Plan the month ahead",
    text: "Set category budgets around your allowance, classes, commute and regular bills.",
  },
  {
    icon: Coffee,
    title: "Capture everyday spending",
    text: "Record the small purchases that are easy to forget but meaningful together.",
  },
  {
    icon: PieChart,
    title: "Review where it went",
    text: "Use reports and category totals to replace guesses with a clear monthly picture.",
  },
  {
    icon: Target,
    title: "Keep a goal in sight",
    text: "Compare available savings with your target and adjust the next month realistically.",
  },
];
const spendingTiles = [
  {
    image: "/images/cafe-coffee.webp",
    alt: "Friends raising coffee cups together over a café table",
    tag: "FOOD",
    title: "Canteen & coffee runs",
    text: "Lunch between lectures, chai with friends and late-night snacks, all in one category.",
  },
  {
    image: "/images/books-stack.webp",
    alt: "A tall stack of colourful hardcover books",
    tag: "ACADEMICS",
    title: "Books & course materials",
    text: "Keep printing, stationery, textbooks and course costs visible all semester.",
  },
  {
    image: "/images/friends-cafe.webp",
    alt: "Four friends smiling and chatting around a café table",
    tag: "ENTERTAINMENT",
    title: "Weekends & outings",
    text: "Enjoy trips, movies and birthdays while knowing exactly what they cost.",
  },
  {
    image: "/images/coins-jar.webp",
    alt: "A glass jar full of coins with a small green plant growing from it",
    tag: "SAVINGS",
    title: "Your savings goal",
    text: "Set a monthly target and watch what is left after expenses grow over time.",
  },
];
const spotlights = [
  {
    image: "/images/monthly-planner.webp",
    alt: "A monthly planner with goals written on it beside a cup of coffee",
    chip: "Budgets & alerts",
    chipIcon: Target,
    kicker: "PLAN WITH CONFIDENCE",
    title: (
      <>
        Budgets that fit <em>your semester.</em>
      </>
    ),
    text: "Set a monthly limit for food, transport, hostel rent or anything else. Progress bars fill as you record expenses, and alerts let you know before a category runs out.",
    points: [
      "Monthly limits for any expense category",
      "Alerts as you approach and go past a limit",
      "Available savings tracked against your goal",
    ],
    link: ["/features", "Explore budgeting tools"],
  },
  {
    image: "/images/analytics-laptop.webp",
    alt: "A laptop on a desk showing colourful charts and totals",
    chip: "Reports & insights",
    chipIcon: BarChart3,
    kicker: "SEE THE WHOLE PICTURE",
    title: (
      <>
        Reports that turn entries <em>into answers.</em>
      </>
    ),
    text: "Charts break every month down by category, compare it with the months before and show how your income, spending and savings move over time.",
    points: [
      "Category breakdowns and monthly trends",
      "Download spreadsheet-ready CSV reports",
      "Insights that highlight what changed",
    ],
    link: ["/how-it-works", "See how reports fit in"],
    reverse: true,
  },
  {
    image: "/images/coins-figure.webp",
    alt: "A small figure reading a newspaper while sitting on a stack of coins",
    chip: "Money coach & tips",
    chipIcon: Bot,
    kicker: "HABITS THAT STICK",
    title: (
      <>
        A coach that knows <em>your month.</em>
      </>
    ),
    text: "Ask the Money Coach how much you have saved this month or which budget needs attention. Saving tips are built from your own patterns, so they actually apply to you.",
    points: [
      "Answers based on your totals, budgets and goal",
      "Personal tips you can bookmark for later",
      "Suggestions without pressure, you decide",
    ],
    link: ["/faq", "Read common questions"],
  },
];
const audiences = [
  {
    image: "/images/students-outdoors.webp",
    alt: "A group of smiling students sitting together outdoors",
    icon: GraduationCap,
    title: "First-year students",
    text: "Managing an allowance for the first time? See where it goes from your very first month on campus.",
  },
  {
    image: "/images/library-study-group.webp",
    alt: "Students laughing together over laptops in a library",
    icon: BookOpen,
    title: "Students who work and study",
    text: "Record part-time income beside rent, books and daily spending in one clean view.",
  },
  {
    image: "/images/lecture-hall.webp",
    alt: "Students seated in a large university lecture hall",
    icon: Target,
    title: "Savers with a goal",
    text: "Saving for a laptop, a trip or next semester's fees? Follow your progress month by month.",
  },
];
const quickQuestions = [
  [
    "Is Campus Coin free for students?",
    "Yes. Create a student account with your email address and use every feature straight away.",
  ],
  [
    "How long does it take to set up?",
    "About a minute. Register, verify your email and add your first income or expense. Budgets and a savings goal can be added whenever you are ready.",
  ],
  [
    "Can I bring in my past spending?",
    "Yes. Import a CSV file, preview every row, adjust categories and confirm only when everything looks right.",
  ],
  [
    "Does it work on my phone?",
    "Yes. Every page is responsive, so you can record a purchase on your phone and review your reports on a laptop.",
  ],
];
const demo = [
  {
    icon: Coffee,
    name: "Campus café",
    category: "Food & drinks",
    amount: "− Rs 450",
    tone: "out",
  },
  {
    icon: GraduationCap,
    name: "Monthly allowance",
    category: "Income",
    amount: "+ Rs 20,000",
    tone: "in",
  },
  {
    icon: BookOpen,
    name: "Course materials",
    category: "Academics",
    amount: "− Rs 1,250",
    tone: "out",
  },
];
export function Home() {
  return (
    <>
      <section className="hero finza-hero">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <div className="hero-pill">
              <span className="pill-dot" /> THE STUDENT MONEY WORKSPACE{" "}
              <Sparkles size={14} />
            </div>
            <h1>
              Make every coin <span>count for more.</span>
            </h1>
            <p>
              Money moves fast on campus. Campus Coin makes it easy to track
              spending, plan monthly budgets and build habits that stick — all
              in one beautiful space.
            </p>
            <div className="hero-buttons">
              <Link
                to="/register"
                className="button button-primary button-large"
              >
                Get started for free <ArrowUpRight size={18} />
              </Link>
              <Link
                to="/how-it-works"
                className="button button-outline button-large"
              >
                See how it works <ChevronRight size={17} />
              </Link>
            </div>
            <div className="hero-proof">
              <div className="hero-proof-mark">
                <ShieldCheck size={20} />
              </div>
              <div>
                <strong>Built around real student life.</strong>
                <small>
                  Allowance, canteen, transport and textbooks, all in one
                  simple view.
                </small>
              </div>
            </div>
          </div>
          <div
            className="hero-product"
            aria-label="Preview of the Campus Coin student dashboard"
          >
            <div className="hero-product-glow" />
            <div className="hero-product-orbit orbit-one" />
            <div className="hero-product-orbit orbit-two" />
            <div className="hero-preview">
              <div className="preview-header">
                <span className="preview-brand">
                  <Coins size={17} /> campuscoin.
                </span>
                <span className="preview-sample">DASHBOARD</span>
              </div>
              <div className="preview-overline">YOUR MONTH, SIMPLIFIED</div>
              <div className="preview-balance">
                Rs 18,500<span>.00</span>
              </div>
              <p>Left to spend this month</p>
              <div className="preview-mini-cards">
                <div>
                  <span className="preview-mini-icon plus">
                    <ArrowDownLeft size={15} />
                  </span>
                  <small>Income</small>
                  <strong>Rs 50,000</strong>
                </div>
                <div>
                  <span className="preview-mini-icon minus">
                    <ArrowUpRight size={15} />
                  </span>
                  <small>Expenses</small>
                  <strong>Rs 31,500</strong>
                </div>
              </div>
              <div className="preview-row-title">
                <strong>Recent activity</strong>
                <span>THIS MONTH</span>
              </div>
              <div className="preview-transactions">
                {demo.map(({ icon: Icon, name, category, amount, tone }) => (
                  <div className="preview-transaction" key={name}>
                    <span className="preview-transaction-icon">
                      <Icon size={17} />
                    </span>
                    <span>
                      <strong>{name}</strong>
                      <small>{category}</small>
                    </span>
                    <em className={tone}>{amount}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className="preview-float float-target">
              <span>
                <Target size={19} />
              </span>
              <div>
                <small>Food budget</small>
                <strong>
                  On track <Check size={13} />
                </strong>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-foot wrap">
          <span>
            <CheckCircle2 size={15} /> BUILT FOR STUDENTS
          </span>
          <span>
            <LockKeyhole size={15} /> PRIVATE BY DESIGN
          </span>
          <span>
            <Sparkles size={15} /> SIMPLE SPENDING INSIGHTS
          </span>
          <span>
            <Smartphone size={15} /> WORKS ON EVERY SCREEN
          </span>
        </div>
      </section>

      <section className="section wrap home-stats" aria-label="Campus Coin at a glance">
        <div className="stat-band">
          {stats.map(([value, label, detail]) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
              <small>{detail}</small>
            </div>
          ))}
        </div>
      </section>

      <section className="section wrap finza-features" id="features">
        <div className="section-intro">
          <div>
            <span className="section-kicker">ALL THE ESSENTIALS</span>
            <h2>
              Feel good about <em>every money move.</em>
            </h2>
          </div>
          <p>
            From your first allowance to your next savings goal, everything is
            organized in one clear, student-first dashboard.
          </p>
        </div>
        <div className="feature-grid">
          {features.map(
            ({ icon: Icon, index, title, description, className }) => (
              <article className={`feature-card ${className}`} key={title}>
                <span className="feature-icon">
                  <Icon size={27} />
                </span>
                <span className="feature-index">{index}</span>
                <h3>{title}</h3>
                <p>{description}</p>
                <ArrowUpRight className="feature-arrow" size={22} />
              </article>
            ),
          )}
        </div>
      </section>

      <section className="section finza-story">
        <div className="wrap story-layout">
          <div className="story-picture">
            <img
              src="/images/students-together.webp"
              alt="Three students laughing together while working on laptops"
              loading="lazy"
            />
            <div className="story-picture-label">
              <span>
                <Coins size={20} />
              </span>
              <div>
                <strong>Every little expense adds up.</strong>
                <small>Log a purchase in seconds, right after you make it.</small>
              </div>
            </div>
          </div>
          <div className="story-copy">
            <span className="section-kicker">MADE FOR CAMPUS LIFE</span>
            <h2>
              Your plans. <em>Your pace.</em> Your money.
            </h2>
            <p>
              Late-night snacks, transport, books, subscriptions and monthly
              allowance — student finances have their own rhythm. Campus Coin
              meets you right where you are.
            </p>
            <div className="story-points">
              <div>
                <span>
                  <Check size={15} />
                </span>
                <div>
                  <strong>Spend with clarity</strong>
                  <small>Know what's left after every entry.</small>
                </div>
              </div>
              <div>
                <span>
                  <Check size={15} />
                </span>
                <div>
                  <strong>Stay ahead of your limits</strong>
                  <small>Track category budgets and in-app alerts.</small>
                </div>
              </div>
              <div>
                <span>
                  <Check size={15} />
                </span>
                <div>
                  <strong>Make progress you can see</strong>
                  <small>Follow your savings goal and monthly trends.</small>
                </div>
              </div>
            </div>
            <Link className="inline-link" to="/features">
              Explore the features <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="section wrap">
        <div className="public-heading">
          <span className="section-kicker">WHERE STUDENT MONEY GOES</span>
          <h2>
            Categories that fit
            <em> your life.</em>
          </h2>
          <p>
            Campus Coin starts you with categories built for student life, such
            as food, transport, hostel rent, academics, subscriptions and
            entertainment. Add your own whenever you need them.
          </p>
        </div>
        <div className="photo-tiles">
          {spendingTiles.map((tile) => (
            <PhotoTile key={tile.title} {...tile} />
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="public-heading">
          <span className="section-kicker">A CLOSER LOOK</span>
          <h2>
            Plan it, see it,
            <em> improve it.</em>
          </h2>
          <p>
            Three parts of Campus Coin work together to turn scattered
            spending into a month you understand.
          </p>
        </div>
        <div className="spotlight-rows">
          {spotlights.map((spotlight) => (
            <SpotlightRow key={spotlight.chip} {...spotlight} />
          ))}
        </div>
      </section>

      <section className="section wrap home-routine">
        <div className="center-intro">
          <span className="section-kicker">BUILT FOR THE WHOLE MONTH</span>
          <h2>
            From the first allowance to the
            <em> final weekly check-in.</em>
          </h2>
          <p>
            Campus Coin keeps planning, recording and reviewing together so
            your budget stays understandable throughout the month.
          </p>
        </div>
        <div className="home-routine-grid">
          {studentMoments.map(({ icon: Icon, title, text }, index) => (
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
        <div className="home-trust-strip">
          <ShieldCheck size={22} />
          <div>
            <strong>Your records, your account.</strong>
            <span>
              Your entries are tied to your login and never shown to other
              students. Every chart is built from the transactions you add.
            </span>
          </div>
          <Link to="/privacy">
            Read privacy overview <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="section wrap finza-steps" id="how">
        <div className="center-intro">
          <span className="section-kicker">HOW IT WORKS</span>
          <h2>
            Three simple steps to <em>money clarity.</em>
          </h2>
          <p>
            No complicated setup. Just your money, your goals and a clear place
            to start.
          </p>
        </div>
        <div className="steps-grid">
          {steps.map(({ n, title, text, icon: Icon }) => (
            <article className="finza-step" key={n}>
              <div className="step-top">
                <span>{n}</span>
                <Icon size={23} />
              </div>
              <h3>{title}</h3>
              <p>{text}</p>
              <ArrowUpRight size={19} />
            </article>
          ))}
        </div>
      </section>

      <section className="section wrap">
        <div className="public-heading">
          <span className="section-kicker">WHO IT IS FOR</span>
          <h2>
            Different student lives.
            <em> One clear workspace.</em>
          </h2>
          <p>
            Whether it is your first semester or your final year, Campus Coin
            adapts to the way your money actually moves.
          </p>
        </div>
        <div className="people-grid">
          {audiences.map(({ image, alt, icon: Icon, title, text }) => (
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
      </section>

      <section className="section wrap home-faq">
        <div className="home-faq-intro">
          <span className="section-kicker">QUICK ANSWERS</span>
          <h2>
            Questions before
            <em> you start?</em>
          </h2>
          <p>
            Here are the ones students ask most. The full help center covers
            accounts, budgets, reports, imports and more.
          </p>
          <img
            src="/images/laptop-coffee-notes.webp"
            alt="An open notebook and pen in front of a laptop and a coffee mug"
            loading="lazy"
          />
          <Link className="inline-link" to="/faq">
            Visit the help center <ArrowRight size={16} />
          </Link>
        </div>
        <div className="faq-list">
          {quickQuestions.map(([q, a], i) => (
            <details key={q} open={i === 0}>
              <summary>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {q}
                <i>+</i>
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="section wrap home-site-map">
        <div>
          <span className="section-kicker">FIND YOUR NEXT STEP</span>
          <h2>
            Your Campus Coin, <em>your way.</em>
          </h2>
          <p>
            Explore all public pages and see how the student and administrator
            workspaces fit together.
          </p>
        </div>
        <div className="home-site-map-links">
          <Link to="/features">
            Explore features <ArrowUpRight size={15} />
          </Link>
          <Link to="/about">
            Our story <ArrowUpRight size={15} />
          </Link>
          <Link to="/faq">
            Questions & answers <ArrowUpRight size={15} />
          </Link>
          <Link to="/sitemap">
            Full website sitemap <ArrowUpRight size={15} />
          </Link>
        </div>
      </section>

      <section className="section wrap">
        <div className="finza-cta">
          <div className="cta-glow" />
          <div className="cta-main">
            <span className="section-kicker">
              YOUR NEXT CHAPTER STARTS HERE
            </span>
            <h2>
              A little more clarity. <em>A lot more freedom.</em>
            </h2>
            <p>
              Start with one transaction today. Build habits that make every
              month feel easier.
            </p>
            <Link to="/register" className="button button-dark button-large">
              Create your free account <ArrowRight size={19} />
            </Link>
          </div>
          <div className="cta-stickers">
            <span className="cta-sticker coin-a">
              <Coins size={44} />
            </span>
            <span className="cta-sticker coin-b">
              <PieChart size={37} />
            </span>
            <span className="cta-sticker coin-c">
              <Check size={45} />
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
