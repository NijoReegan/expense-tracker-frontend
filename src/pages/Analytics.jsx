import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Chart from 'chart.js/auto';
import Icon from '../components/Icon';
import Modal from '../components/Modal';
import { useAppData } from '../context/useAppData';
import { money, currencySymbol } from '../utils/format';

const barColors = ['bg-blue-500', 'bg-orange-500', 'bg-purple-500', 'bg-pink-500', 'bg-green-500', 'bg-red-500'];

const getBuckets = (range) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const buckets = [];
  if (range === '1M') {
    for (let i = 3; i >= 0; i--) {
      const start = new Date(now);
      start.setDate(start.getDate() - (4 - i) * 7);
      const end = new Date(now);
      end.setDate(end.getDate() - (3 - i) * 7);
      buckets.push({ label: `Wk ${i + 1}`, start: start.getTime(), end: end.getTime() });
    }
    return buckets;
  }
  const count = range === '3M' ? 3 : range === '6M' ? 6 : 12;
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      label: d.toLocaleDateString('en-US', { month: 'short' }),
      year: d.getFullYear(),
      month: d.getMonth(),
    });
  }
  return buckets;
};

const inMonth = (iso, year, monthIdx) => {
  const d = new Date(iso);
  return d.getFullYear() === year && d.getMonth() === monthIdx;
};

const inRange = (iso, start, end) => {
  const t = new Date(iso).getTime();
  return Number.isNaN(t) ? false : t >= start && t < end;
};

export default function Analytics() {
  const { data } = useAppData();
  const [range, setRange] = useState('3M');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const netWorthRef = useRef(null);
  const incomeExpenseRef = useRef(null);
  const netWorthChart = useRef(null);
  const incomeExpenseChart = useRef(null);

  const currentMonth = useMemo(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  }, []);

  const lastMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return { year: d.getFullYear(), month: d.getMonth() };
  }, []);

  const buckets = useMemo(() => getBuckets(range), [range]);

  const thisMonthExpenses = useMemo(() => {
    return data.expenses.filter((e) => inMonth(e.date, currentMonth.year, currentMonth.month)).reduce((s, e) => s + e.amount, 0);
  }, [data.expenses, currentMonth]);

  const lastMonthExpenses = useMemo(() => {
    return data.expenses.filter((e) => inMonth(e.date, lastMonth.year, lastMonth.month)).reduce((s, e) => s + e.amount, 0);
  }, [data.expenses, lastMonth]);

  const thisMonthIncome = useMemo(() => {
    return data.incomes.filter((i) => inMonth(i.date, currentMonth.year, currentMonth.month)).reduce((s, i) => s + i.amount, 0);
  }, [data.incomes, currentMonth]);

  const currency = data.settings.currency;
  const daysElapsed = Math.max(1, new Date().getDate());
  const avgDaily = daysElapsed > 0 ? Math.round((thisMonthExpenses / daysElapsed) * 100) / 100 : 0;

  const byCat = useMemo(() => {
    const result = {};
    data.expenses.forEach((e) => { result[e.cat] = (result[e.cat] || 0) + e.amount; });
    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [data.expenses]);

  const thisMonthByCat = useMemo(() => {
    const result = {};
    data.expenses
      .filter((e) => inMonth(e.date, currentMonth.year, currentMonth.month))
      .forEach((e) => { result[e.cat] = (result[e.cat] || 0) + e.amount; });
    return Object.entries(result).sort((a, b) => b[1] - a[1]);
  }, [data.expenses, currentMonth]);

  const topCat = byCat.length > 0 ? byCat[0][0] : '—';
  const totalCatAmount = byCat.length > 0 ? byCat.reduce((s, [, v]) => s + v, 0) : 1;

  const savingsRate = thisMonthIncome > 0 ? Math.max(0, Math.round(((thisMonthIncome - thisMonthExpenses) / thisMonthIncome) * 100)) : 0;

  const efficiency = useMemo(() => {
    if (lastMonthExpenses === 0 && thisMonthExpenses === 0) return { hasData: false, reduction: 0, saved: 0 };
    const diff = lastMonthExpenses - thisMonthExpenses;
    const reduction = lastMonthExpenses > 0 ? Math.round((diff / lastMonthExpenses) * 100) : 0;
    return { hasData: true, reduction, saved: Math.max(0, diff) };
  }, [thisMonthExpenses, lastMonthExpenses]);

  const chartData = useMemo(() => {
    const incomeData = buckets.map((b) =>
      data.incomes
        .filter((i) => (b.start != null ? inRange(i.date, b.start, b.end) : inMonth(i.date, b.year, b.month)))
        .reduce((s, i) => s + i.amount, 0)
    );
    const expenseData = buckets.map((b) =>
      data.expenses
        .filter((e) => (b.start != null ? inRange(e.date, b.start, b.end) : inMonth(e.date, b.year, b.month)))
        .reduce((s, e) => s + e.amount, 0)
    );
    const labels = buckets.map((b) => b.label);
    const netWorthData = incomeData.reduce((acc, inc, i) => {
      const prev = i > 0 ? acc[i - 1] : 0;
      acc.push(prev + inc - expenseData[i]);
      return acc;
    }, []);
    const targetData = netWorthData.map((v, i) => Math.round((i + 1) / netWorthData.length * Math.max(...netWorthData, 1)));
    return { labels, incomeData, expenseData, netWorthData, targetData };
  }, [buckets, data.incomes, data.expenses]);

  const hasChartData = chartData.netWorthData.some((v) => v !== 0) || chartData.incomeData.some((v) => v !== 0);

  const renderCharts = useCallback(() => {
    if (netWorthChart.current) netWorthChart.current.destroy();
    if (incomeExpenseChart.current) incomeExpenseChart.current.destroy();
    if (!netWorthRef.current || !incomeExpenseRef.current) return;

    const gradient = netWorthRef.current.getContext('2d').createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(79, 70, 229, 0.4)');
    gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');

    netWorthChart.current = new Chart(netWorthRef.current, {
      type: 'line',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Net Worth',
            data: chartData.netWorthData,
            borderColor: '#3525cd',
            borderWidth: 3,
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            pointRadius: 0,
            pointHoverRadius: 6,
          },
          {
            label: 'Target',
            data: chartData.targetData,
            borderColor: '#acedff',
            borderDash: [5, 5],
            borderWidth: 2,
            fill: false,
            pointRadius: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: {
            grid: { color: 'rgba(0,0,0,0.05)' },
            border: { display: false },
            ticks: { callback: (value) => currencySymbol(currency) + (value / 1000).toFixed(0) + 'k' },
          },
        },
      },
    });

    incomeExpenseChart.current = new Chart(incomeExpenseRef.current, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [
          {
            label: 'Income',
            data: chartData.incomeData,
            backgroundColor: '#3525cd',
            borderRadius: 6,
            barThickness: 20,
          },
          {
            label: 'Expenses',
            data: chartData.expenseData,
            backgroundColor: '#e2dfff',
            borderRadius: 6,
            barThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 600 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, usePointStyle: true, font: { size: 10 } },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false } },
          y: { grid: { display: false }, border: { display: false }, display: false },
        },
      },
    });
  }, [chartData, currency]);

  useEffect(() => {
    renderCharts();
    return () => {
      if (netWorthChart.current) netWorthChart.current.destroy();
      if (incomeExpenseChart.current) incomeExpenseChart.current.destroy();
    };
  }, [renderCharts]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h2 className="font-display-lg text-display-lg text-primary">Financial Analytics</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Detailed performance review of your spending habits.</p>
        </div>
        <div className="flex gap-2 p-1 bg-surface-container rounded-xl">
          {['1M', '3M', '6M', '1Y'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                r === range
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-white/50'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
        <div className="glass-card p-card-padding rounded-xl transition-transform hover:scale-[1.02] duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg"><Icon name="trending_down" className="text-primary" /></div>
            {thisMonthExpenses > 0 && lastMonthExpenses > 0 && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${thisMonthExpenses < lastMonthExpenses ? 'text-green-600 bg-green-100' : 'text-error bg-error/10'}`}>
                {thisMonthExpenses < lastMonthExpenses ? '-' : '+'}{Math.abs(Math.round(((thisMonthExpenses - lastMonthExpenses) / lastMonthExpenses) * 100))}%
              </span>
            )}
          </div>
          <p className="text-label-caps font-label-caps text-outline uppercase tracking-widest">Avg Daily Spending</p>
          <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{money(avgDaily, currency)}</h3>
        </div>
        <div className="glass-card p-card-padding rounded-xl transition-transform hover:scale-[1.02] duration-300 border-primary/20">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary/10 rounded-lg"><Icon name="restaurant" className="text-secondary" /></div>
            <span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-1 rounded-full">Top Exp</span>
          </div>
          <p className="text-label-caps font-label-caps text-outline uppercase tracking-widest">Highest Category</p>
          <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{topCat}</h3>
        </div>
        <div className="glass-card p-card-padding rounded-xl transition-transform hover:scale-[1.02] duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-fixed/30 rounded-lg"><Icon name="savings" className="text-tertiary" /></div>
            <span className="text-xs font-bold text-primary bg-primary-fixed px-2 py-1 rounded-full">{savingsRate}%</span>
          </div>
          <p className="text-label-caps font-label-caps text-outline uppercase tracking-widest">Savings Rate (%)</p>
          <h3 className="font-headline-md text-headline-md text-on-surface mt-1">{savingsRate}%</h3>
        </div>
      </div>

      {efficiency.hasData && efficiency.reduction > 0 && (
        <div className="glass-card mb-gutter p-6 rounded-xl border-l-4 border-l-green-500 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full"><Icon name="arrow_downward" className="text-green-600" /></div>
            <div>
              <h4 className="font-title-sm text-title-sm text-on-surface">Efficiency Milestone</h4>
              <p className="text-on-surface-variant">
                You spent <span className="font-bold text-green-600">{efficiency.reduction}% less</span> than last month. This saved you approximately <span className="font-bold">{money(efficiency.saved, currency)}</span>.
              </p>
            </div>
          </div>
          <button onClick={() => setDetailsOpen(true)} className="hidden md:block px-6 py-2 bg-primary text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95">
            View Details
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-gutter">
        <div className="lg:col-span-2 glass-card p-card-padding rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-sm text-title-sm">Net Worth Trend</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-on-surface-variant">Wealth</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-secondary-fixed-dim"></div>
                <span className="text-xs text-on-surface-variant">Target</span>
              </div>
            </div>
          </div>
          {!hasChartData ? (
            <div className="h-[320px] flex items-center justify-center text-on-surface-variant">
              <p>Add income and expenses to see net worth trends.</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <canvas ref={netWorthRef}></canvas>
            </div>
          )}
        </div>
        <div className="glass-card p-card-padding rounded-xl">
          <h3 className="font-title-sm text-title-sm mb-6">Income vs Expenses</h3>
          {!hasChartData ? (
            <div className="h-[320px] flex items-center justify-center text-on-surface-variant">
              <p>Add transactions to see income vs expenses.</p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <canvas ref={incomeExpenseRef}></canvas>
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-card-padding rounded-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-title-sm text-title-sm">Spending by Category</h3>
        </div>
        {byCat.length === 0 ? (
          <div className="py-8 text-center text-on-surface-variant">No expenses recorded yet.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {byCat.map(([cat, amt], idx) => {
              const pct = Math.round((amt / totalCatAmount) * 100);
              return (
                <div key={cat} className="group">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`material-symbols-outlined p-2 rounded-lg text-sm bg-surface-variant/50 text-outline`}>category</span>
                      <span className="font-bold">{cat}</span>
                    </div>
                    <span className="font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-surface-variant rounded-full h-2">
                    <div className={`${barColors[idx % barColors.length]} h-2 rounded-full`} style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal open={detailsOpen} onClose={() => setDetailsOpen(false)} title="Efficiency Details">
        <div className="space-y-5">
          <div className="bg-green-50 dark:bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-center gap-4">
            <div className="bg-green-100 dark:bg-green-500/20 p-3 rounded-full shrink-0">
              <Icon name="arrow_downward" className="text-green-600" />
            </div>
            <div>
              <p className="font-bold text-on-surface">{efficiency.reduction}% Reduction in Spending</p>
              <p className="text-sm text-on-surface-variant">Compared to last month, saving you approximately {money(efficiency.saved, currency)}.</p>
            </div>
          </div>

          <div>
            <h5 className="font-title-sm text-title-sm font-bold mb-3">Monthly Comparison</h5>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">This Month</span>
                  <span className="font-bold text-secondary">{money(thisMonthExpenses, currency)}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5">
                  <div className="h-full bg-secondary rounded-full" style={{ width: `${Math.min(100, Math.round((thisMonthExpenses / Math.max(thisMonthExpenses, lastMonthExpenses, 1)) * 100))}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-on-surface-variant">Last Month</span>
                  <span className="font-bold text-on-surface">{money(lastMonthExpenses, currency)}</span>
                </div>
                <div className="w-full bg-surface-variant rounded-full h-2.5">
                  <div className="h-full bg-surface-variant-high rounded-full" style={{ width: `${Math.min(100, Math.round((lastMonthExpenses / Math.max(thisMonthExpenses, lastMonthExpenses, 1)) * 100))}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="font-title-sm text-title-sm font-bold mb-3">Spending by Category (This Month)</h5>
            <div className="space-y-2">
              {thisMonthByCat.length === 0 ? (
                <p className="text-on-surface-variant text-body-sm">No expenses this month.</p>
              ) : (
                thisMonthByCat.map(([cat, amt], idx) => {
                  const catPct = Math.round((amt / Math.max(thisMonthExpenses, 1)) * 100);
                  return (
                    <div key={cat} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
                      <div className={`w-2.5 h-2.5 rounded-full ${barColors[idx % barColors.length]}`}></div>
                      <span className="flex-1 text-body-sm font-medium">{cat}</span>
                      <span className="text-body-sm text-on-surface-variant">{catPct}%</span>
                      <span className="text-body-sm font-bold text-secondary">{money(amt, currency)}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 bg-primary/10 rounded-xl p-4">
            <Icon name="lightbulb" className="text-primary shrink-0" />
            <p className="text-sm text-on-surface-variant">
              {savingsRate > 0
                ? `Your spending below income has pushed your savings rate to ${savingsRate}%.`
                : 'Track your spending to see insights here.'}
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}