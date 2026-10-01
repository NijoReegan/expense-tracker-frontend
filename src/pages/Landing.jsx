import { Link } from 'react-router-dom';
import Icon from '../components/Icon';

export default function Landing() {
  return (
    <div className="mesh-bg font-['Inter'] text-[#1b1b24] overflow-x-hidden selection:bg-[#3525cd] selection:text-white min-h-screen">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/30 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 font-black text-[#3525cd]">
            <Icon name="account_balance_wallet" />
            <span>Smart Expense Tracker</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="rounded-xl border border-[#c7c4d8] px-4 py-2 text-sm font-bold text-[#3525cd] transition-all hover:bg-white/70"
            >
              Log In
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-24">
        <section className="mx-auto grid max-w-7xl gap-12 px-6 py-16 lg:grid-cols-2 lg:items-center md:py-24">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4f46e5]/10 bg-[#4f46e5]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.25em] text-[#3525cd]">
              <Icon name="auto_awesome" className="text-base" />
              Complete financial clarity
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-black tracking-tight md:text-6xl">
                Take control of your money with one calm, connected workspace.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-[#464555]">
                Track expenses, plan budgets, review analytics, and manage savings from one
                polished dashboard. The project is now wired so the landing page, login flow, and
                app screens all connect cleanly.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/login"
                className="rounded-2xl border border-[#c7c4d8] bg-white/60 px-6 py-4 text-base font-bold text-[#3525cd] transition-all hover:bg-white"
              >
                Open App
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-[#464555]">
              <div className="flex items-center gap-2">
                <Icon name="shield" className="text-[#3525cd]" />
                Secure access flow
              </div>
              <div className="flex items-center gap-2">
                <Icon name="analytics" className="text-[#3525cd]" />
                Live reporting views
              </div>
              <div className="flex items-center gap-2">
                <Icon name="savings" className="text-[#3525cd]" />
                Smart savings tracking
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[32px] p-6 md:p-8" style={{ backdropFilter: 'blur(18px)' }}>
            <div className="rounded-[28px] bg-[#1b1b24] p-6 text-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">Today</p>
                  <h2 className="mt-2 text-2xl font-bold">Financial Overview</h2>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                  +12.4%
                </span>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">Balance</p>
                  <p className="mt-3 text-3xl font-black">₹45,230</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/50">Saved</p>
                  <p className="mt-3 text-3xl font-black">₹12,450</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-white/10 p-4">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Monthly budget usage</span>
                  <span>72%</span>
                </div>
                <div className="mt-3 h-3 rounded-full bg-white/10">
                  <div className="h-3 w-[72%] rounded-full bg-gradient-to-r from-[#57dffe] to-[#3525cd]"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-6 py-10 md:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#3525cd]">Features</p>
            <h2 className="mt-3 text-3xl font-black">Built for the full finance workflow.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <article className="glass-card rounded-3xl p-6">
              <Icon name="payments" className="text-3xl text-[#3525cd]" />
              <h3 className="mt-4 text-xl font-bold">Expense tracking</h3>
              <p className="mt-3 text-sm leading-7 text-[#464555]">
                Capture spending quickly and move from overview to detail without leaving the app.
              </p>
            </article>
            <article className="glass-card rounded-3xl p-6">
              <Icon name="savings" className="text-3xl text-[#3525cd]" />
              <h3 className="mt-4 text-xl font-bold">Savings planning</h3>
              <p className="mt-3 text-sm leading-7 text-[#464555]">
                Set goals, monitor progress, and keep your monthly targets visible at all times.
              </p>
            </article>
            <article className="glass-card rounded-3xl p-6">
              <Icon name="analytics" className="text-3xl text-[#3525cd]" />
              <h3 className="mt-4 text-xl font-bold">Deep analytics</h3>
              <p className="mt-3 text-sm leading-7 text-[#464555]">
                See category trends, recurring patterns, and budget performance in one place.
              </p>
            </article>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-7xl px-6 py-10 md:py-16">
          <div className="glass-card rounded-[32px] p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#3525cd]">
                  Start now
                </p>
                <h2 className="mt-3 text-3xl font-black">
                  Open your account and start tracking today.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-[#464555]">
                  The project navigation is wired, and the landing page now points into the rest of
                  the app without dead or duplicated documents.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  to="/login"
                  className="rounded-2xl border border-[#c7c4d8] bg-white/60 px-6 py-4 text-base font-bold text-[#3525cd] transition-all hover:bg-white"
                >
                  Open App
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-7xl px-6 py-10 md:py-16 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold">Is the project wired together?</h3>
              <p className="mt-3 text-sm leading-7 text-[#464555]">
                Yes. The shared script connects the page menu, login, registration, and logout
                actions across the project.
              </p>
            </div>
            <div className="glass-card rounded-3xl p-6">
              <h3 className="text-xl font-bold">What should I open first?</h3>
              <p className="mt-3 text-sm leading-7 text-[#464555]">
                Open this landing page, then use Log In to move into the app flow.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}