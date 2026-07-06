export function initCountdown(closedLabel: string) {
  const bar = document.querySelector<HTMLElement>('[data-countdown-bar]');
  if (!bar) return;
  const target = new Date(bar.getAttribute('data-target') || '').getTime();

  const els = {
    days: document.querySelector<HTMLElement>('[data-cd="days"]'),
    hours: document.querySelector<HTMLElement>('[data-cd="hours"]'),
    minutes: document.querySelector<HTMLElement>('[data-cd="minutes"]'),
    seconds: document.querySelector<HTMLElement>('[data-cd="seconds"]'),
  };
  const statusText = document.querySelector<HTMLElement>('[data-cd-status-text]');
  const pad = (n: number) => String(n).padStart(2, '0');

  function tick() {
    const diff = target - Date.now();
    if (diff <= 0) {
      if (els.days) els.days.textContent = '000';
      [els.hours, els.minutes, els.seconds].forEach((el) => { if (el) el.textContent = '00'; });
      if (statusText) statusText.textContent = closedLabel;
      return;
    }
    const d = Math.floor(diff / 86_400_000);
    const h = Math.floor((diff % 86_400_000) / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    if (els.days) els.days.textContent = String(d).padStart(3, '0');
    if (els.hours) els.hours.textContent = pad(h);
    if (els.minutes) els.minutes.textContent = pad(m);
    if (els.seconds) els.seconds.textContent = pad(s);
  }

  tick();
  setInterval(tick, 1000);
}
