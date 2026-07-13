interface SimConfig {
  dates: string[];
  nominal: number;
  maxAmount: number;
  minAmount: number;
  grossRate: number;
  locale: string;
  currencyPrefix: boolean;
  warnMin: string;
  warnMax: string;
  warnStep: string;
  ctaEmail: string;
  ctaSubject: string;
  ctaBodyTemplate: string;
  residenceLabels: Record<string, string>;
  modalAmountInvalid: string;
  modalSuccessTitle: string;
  modalSuccessText: string;
  modalErrorTitle: string;
  modalErrorText: string;
}

declare global {
  interface Window {
    __simConfig?: SimConfig;
  }
}

type ScheduleRow = {
  start: number;
  interest: number;
  repaid: number;
  end: number;
};

/** Échéancier : 1 an de différé (2 semestres, intérêts seuls), puis capital remboursé
 *  par quarts égaux sur les 4 semestres suivants — cf. Document d'Information §3. */
const CAPITAL_FRACTIONS = [1, 1, 1, 0.75, 0.5, 0.25, 0];

function computeSchedule(principal: number, netSemesterRate: number): ScheduleRow[] {
  const rows: ScheduleRow[] = [];
  for (let i = 1; i < CAPITAL_FRACTIONS.length; i++) {
    const start = principal * CAPITAL_FRACTIONS[i - 1];
    const end = principal * CAPITAL_FRACTIONS[i];
    rows.push({ start, interest: start * netSemesterRate, repaid: start - end, end });
  }
  return rows;
}

function computeResults(amount: number, residence: string, cfg: SimConfig) {
  const isCemac = residence === 'cemac';
  const taxRate = isCemac ? 0.1 : 0;
  const netAnnual = (cfg.grossRate / 100) * (1 - taxRate);
  const netSemesterRate = netAnnual / 2;
  const count = Math.round(amount / cfg.nominal);
  const rows = computeSchedule(amount, netSemesterRate);
  const totalInterest = rows.reduce((s, r) => s + r.interest, 0);
  const totalRepaid = rows.reduce((s, r) => s + r.repaid, 0);
  const maturityCapital = amount + totalInterest;
  return { taxRate, netAnnual, count, rows, totalInterest, totalRepaid, maturityCapital };
}

/** Séparateur de milliers forcé par locale : Intl.NumberFormat('fr-FR') utilise par défaut
 *  l'espace fine insécable U+202F, que beaucoup de polices rendent quasi invisible à l'écran
 *  (les grands nombres semblent alors non groupés). On force une espace insécable normale
 *  U+00A0, bien visible — même technique que le mini-listing du Hero. */
const GROUP_SEPARATOR: Record<string, string> = { 'fr-FR': ' ', 'en-US': ',' };

function groupNumber(n: number, locale: string): string {
  const sep = GROUP_SEPARATOR[locale] ?? ',';
  const rounded = Math.round(n);
  const grouped = Math.abs(rounded).toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  return rounded < 0 ? `-${grouped}` : grouped;
}

function formatAmount(n: number, cfg: SimConfig): string {
  const num = groupNumber(n, cfg.locale);
  return cfg.currencyPrefix ? `FCFA ${num}` : `${num} FCFA`;
}

function formatRate(pct: number, locale: string): string {
  const s = pct.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
  return `${s}%`;
}

/** Retire tout sauf les chiffres, pour lire un champ saisi avec séparateurs de milliers
 *  (espace en fr-FR, virgule en en-US) — parseFloat() s'arrêterait au premier séparateur. */
function parseAmount(raw: string): number {
  const digits = raw.replace(/\D/g, '');
  return digits ? parseInt(digits, 10) : 0;
}

function formatGrouped(n: number, locale: string): string {
  return n ? groupNumber(n, locale) : '';
}

function setText(key: string, value: string) {
  document.querySelectorAll(`[data-sim="${key}"]`).forEach((el) => {
    el.textContent = value;
  });
}

export function initSimulator() {
  const cfg = window.__simConfig;
  const residenceEl = document.getElementById('sim-residence') as HTMLSelectElement | null;
  const amountEl = document.getElementById('sim-amount') as HTMLInputElement | null;
  const noteEl = document.getElementById('sim-residence-note');
  const warningEl = document.getElementById('sim-amount-warning');
  const scheduleBody = document.getElementById('sim-schedule-body');
  const ctaEl = document.getElementById('sim-cta') as HTMLButtonElement | null;
  const modalOverlay = document.getElementById('sim-modal-overlay');
  const modalForm = document.getElementById('sim-modal-form') as HTMLFormElement | null;
  const modalNom = document.getElementById('sim-modal-nom') as HTMLInputElement | null;
  const modalPrenom = document.getElementById('sim-modal-prenom') as HTMLInputElement | null;
  const paysTrigger = document.getElementById('sim-modal-pays-trigger') as HTMLButtonElement | null;
  const paysFlag = document.getElementById('sim-modal-pays-flag');
  const paysCurrent = document.getElementById('sim-modal-pays-current');
  const paysPanel = document.getElementById('sim-modal-pays-panel');
  const paysFilter = document.getElementById('sim-modal-pays-filter') as HTMLInputElement | null;
  const paysList = document.getElementById('sim-modal-pays-list');
  const paysError = document.getElementById('sim-modal-pays-error');
  const modalPhone = document.getElementById('sim-modal-phone') as HTMLInputElement | null;
  const modalEmail = document.getElementById('sim-modal-email') as HTMLInputElement | null;
  const modalAmount = document.getElementById('sim-modal-amount') as HTMLInputElement | null;
  const modalCancel = document.getElementById('sim-modal-cancel');
  const feedbackOverlay = document.getElementById('sim-feedback-overlay');
  const feedbackIconSuccess = document.getElementById('sim-feedback-icon-success');
  const feedbackIconError = document.getElementById('sim-feedback-icon-error');
  const feedbackTitle = document.getElementById('sim-feedback-title');
  const feedbackText = document.getElementById('sim-feedback-text');
  if (!cfg || !residenceEl || !amountEl || !scheduleBody) return;

  function buildRow(date: string, start: number | null, interest: number | null, repaid: number | null, end: number, isIssuance: boolean) {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-filet last:border-0';
    const total = isIssuance ? null : (interest ?? 0) + (repaid ?? 0);
    const cells = [
      date,
      start === null ? '—' : formatAmount(start, cfg!),
      interest === null ? '—' : formatAmount(interest, cfg!),
      repaid === null || repaid === 0 ? '—' : formatAmount(repaid, cfg!),
      total === null ? '—' : formatAmount(total, cfg!),
      end === 0 ? '—' : formatAmount(end, cfg!),
    ];
    cells.forEach((val, i) => {
      const td = document.createElement('td');
      td.className = i === 0 ? 'px-4 py-3 font-semibold whitespace-nowrap' : 'px-4 py-3 text-right tabular';
      td.textContent = val;
      tr.appendChild(td);
    });
    return tr;
  }

  function render(amountOverride?: number) {
    const raw = amountOverride ?? parseAmount(amountEl!.value);
    const amount = Number.isFinite(raw) ? Math.min(Math.max(raw, 0), cfg!.maxAmount) : 0;

    const residence = residenceEl!.value;
    const isCemac = residence === 'cemac';
    noteEl?.classList.toggle('hidden', isCemac);

    const { taxRate, netAnnual, count, rows, totalInterest, totalRepaid, maturityCapital } = computeResults(amount, residence, cfg!);
    const totalReceived = totalInterest + totalRepaid;

    setText('nominal', formatAmount(cfg!.nominal, cfg!));
    setText('count', groupNumber(count, cfg!.locale));
    setText('grossRate', formatRate(cfg!.grossRate, cfg!.locale));
    setText('tax', formatRate(taxRate * 100, cfg!.locale));
    setText('netRate', formatRate(netAnnual * 100, cfg!.locale));
    setText('totalInterest', formatAmount(totalInterest, cfg!));
    setText('maturityCapital', formatAmount(maturityCapital, cfg!));
    setText('totalInterestRow', formatAmount(totalInterest, cfg!));
    setText('totalRepaidRow', formatAmount(totalRepaid, cfg!));
    setText('totalReceivedRow', formatAmount(totalReceived, cfg!));

    scheduleBody!.innerHTML = '';
    scheduleBody!.appendChild(buildRow(cfg!.dates[0], amount, null, null, amount, true));
    rows.forEach((r, idx) => {
      scheduleBody!.appendChild(buildRow(cfg!.dates[idx + 1], r.start, r.interest, r.repaid, r.end, false));
    });
  }

  function validateAndSnap() {
    let value = parseAmount(amountEl.value);
    let warning = '';
    if (value > cfg!.maxAmount) {
      value = cfg!.maxAmount;
      warning = cfg!.warnMax;
    } else if (value < cfg!.minAmount) {
      value = cfg!.minAmount;
      warning = cfg!.warnMin;
    } else if (value % 1000 !== 0) {
      value = Math.round(value / 1000) * 1000;
      warning = cfg!.warnStep;
    }
    amountEl!.value = formatGrouped(value, cfg!.locale);
    if (warningEl) {
      warningEl.textContent = warning;
      warningEl.classList.toggle('hidden', !warning);
    }
    render(value);
  }

  amountEl.addEventListener('input', () => {
    const caretFromEnd = amountEl!.value.length - (amountEl!.selectionStart ?? amountEl!.value.length);
    const amount = parseAmount(amountEl!.value);
    const formatted = formatGrouped(amount, cfg!.locale);
    amountEl!.value = formatted;
    const pos = Math.max(formatted.length - caretFromEnd, 0);
    amountEl!.setSelectionRange(pos, pos);
    render(amount);
  });
  amountEl.addEventListener('change', validateAndSnap);
  residenceEl.addEventListener('change', () => render());

  function openModal() {
    if (modalAmount) modalAmount.value = amountEl!.value;
    modalOverlay?.classList.remove('hidden');
    modalOverlay?.classList.add('flex');
    closePaysPanel();
    modalNom?.focus();
  }

  function closeModal() {
    modalOverlay?.classList.add('hidden');
    modalOverlay?.classList.remove('flex');
  }

  let selectedCountryName = '';

  function openPaysPanel() {
    paysPanel?.classList.remove('hidden');
    paysPanel?.classList.add('flex');
    paysTrigger?.setAttribute('aria-expanded', 'true');
    if (paysFilter) {
      paysFilter.value = '';
      filterCountries('');
      paysFilter.focus();
    }
  }

  function closePaysPanel() {
    paysPanel?.classList.add('hidden');
    paysPanel?.classList.remove('flex');
    paysTrigger?.setAttribute('aria-expanded', 'false');
  }

  function filterCountries(query: string) {
    const q = query.trim().toLowerCase();
    paysList?.querySelectorAll<HTMLButtonElement>('.sim-country-option').forEach((row) => {
      const name = row.dataset.name?.toLowerCase() ?? '';
      row.classList.toggle('hidden', q.length > 0 && !name.includes(q));
    });
  }

  paysTrigger?.addEventListener('click', () => {
    const isOpen = paysPanel?.classList.contains('flex');
    if (isOpen) closePaysPanel();
    else openPaysPanel();
  });

  paysFilter?.addEventListener('input', () => filterCountries(paysFilter.value));

  paysList?.querySelectorAll<HTMLButtonElement>('.sim-country-option').forEach((row) => {
    row.addEventListener('click', () => {
      selectedCountryName = row.dataset.name ?? '';
      if (paysCurrent) {
        paysCurrent.textContent = selectedCountryName;
        paysCurrent.classList.remove('text-muted');
      }
      const svg = row.querySelector('svg');
      if (paysFlag && svg) paysFlag.innerHTML = svg.outerHTML;
      paysError?.classList.add('hidden');
      closePaysPanel();
    });
  });

  document.addEventListener('click', (e) => {
    if (
      paysPanel &&
      !paysPanel.classList.contains('hidden') &&
      !paysPanel.contains(e.target as Node) &&
      e.target !== paysTrigger &&
      !paysTrigger?.contains(e.target as Node)
    ) {
      closePaysPanel();
    }
  });

  ctaEl?.addEventListener('click', openModal);
  modalCancel?.addEventListener('click', closeModal);
  modalOverlay?.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (paysPanel && !paysPanel.classList.contains('hidden')) {
      closePaysPanel();
    } else if (!modalOverlay?.classList.contains('hidden')) {
      closeModal();
    }
  });

  modalAmount?.addEventListener('input', () => {
    modalAmount.setCustomValidity('');
    const caretFromEnd = modalAmount.value.length - (modalAmount.selectionStart ?? modalAmount.value.length);
    const value = parseAmount(modalAmount.value);
    const formatted = formatGrouped(value, cfg!.locale);
    modalAmount.value = formatted;
    const pos = Math.max(formatted.length - caretFromEnd, 0);
    modalAmount.setSelectionRange(pos, pos);
  });

  let feedbackTimer: ReturnType<typeof setTimeout> | null = null;

  function showFeedback(success: boolean) {
    if (feedbackTimer) clearTimeout(feedbackTimer);
    if (feedbackTitle) feedbackTitle.textContent = success ? cfg!.modalSuccessTitle : cfg!.modalErrorTitle;
    if (feedbackText) feedbackText.textContent = success ? cfg!.modalSuccessText : cfg!.modalErrorText;
    feedbackIconSuccess?.classList.toggle('hidden', !success);
    feedbackIconSuccess?.classList.toggle('flex', success);
    feedbackIconError?.classList.toggle('hidden', success);
    feedbackIconError?.classList.toggle('flex', !success);
    feedbackOverlay?.classList.remove('hidden');
    feedbackOverlay?.classList.add('flex');
    feedbackTimer = setTimeout(hideFeedback, 15000);
  }

  function hideFeedback() {
    feedbackOverlay?.classList.add('hidden');
    feedbackOverlay?.classList.remove('flex');
    if (feedbackTimer) {
      clearTimeout(feedbackTimer);
      feedbackTimer = null;
    }
  }

  feedbackOverlay?.addEventListener('click', (e) => {
    if (e.target === feedbackOverlay) hideFeedback();
  });

  modalForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amount = parseAmount(modalAmount!.value);
    if (amount < cfg!.minAmount || amount > cfg!.maxAmount) {
      modalAmount!.setCustomValidity(cfg!.modalAmountInvalid);
    } else {
      modalAmount!.setCustomValidity('');
    }
    const paysValid = selectedCountryName.length > 0;
    paysError?.classList.toggle('hidden', paysValid);
    if (!modalForm.reportValidity() || !paysValid) return;

    const residence = residenceEl!.value;
    const { count, maturityCapital } = computeResults(amount, residence, cfg!);

    const body = cfg!.ctaBodyTemplate
      .replace('{nom}', modalNom!.value.trim())
      .replace('{prenom}', modalPrenom!.value.trim())
      .replace('{pays}', selectedCountryName)
      .replace('{telephone}', modalPhone!.value.trim())
      .replace('{email}', modalEmail!.value.trim())
      .replace('{amount}', formatAmount(amount, cfg!))
      .replace('{residence}', cfg!.residenceLabels[residence] ?? residence)
      .replace('{count}', groupNumber(count, cfg!.locale))
      .replace('{maturity}', formatAmount(maturityCapital, cfg!));
    const params = new URLSearchParams({ subject: cfg!.ctaSubject, body });
    const href = `mailto:${cfg!.ctaEmail}?${params.toString().replace(/\+/g, '%20')}`;

    closeModal();
    try {
      window.location.href = href;
      showFeedback(true);
    } catch {
      showFeedback(false);
    }
  });

  render();
}
