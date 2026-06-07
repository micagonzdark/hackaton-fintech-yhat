const DATA_URL = "../backend/seed/demo_credit_data.json";
const ARS_PER_USD = 1000;
const PRIMARY_DEMO_HOST_ID = "H002";
const REJECTED_DEMO_HOST_ID = "H004";

const scoreKeyByCluster = {
  host_solidity: "hostSolidity",
  property_quality: "propertyQuality",
  income_history: "incomeHistory",
  reputation_ops: "reputationOps",
  future_bookings: "futureBookings",
  market_risk: "marketRisk",
};

const monthNames = {
  "01": "Ene",
  "02": "Feb",
  "03": "Mar",
  "04": "Abr",
  "05": "May",
  "06": "Jun",
  "07": "Jul",
  "08": "Ago",
  "09": "Sep",
  "10": "Oct",
  "11": "Nov",
  "12": "Dic",
};

let modelData;
let selectedHost;
let clusterScores = {};
let activeDemoScenario = "base";

const els = {
  hostSelect: document.querySelector("#hostSelect"),
  resetButton: document.querySelector("#resetButton"),
  requestedAmount: document.querySelector("#requestedAmount"),
  futureRevenue: document.querySelector("#futureRevenue"),
  seasonDrop: document.querySelector("#seasonDrop"),
  holdback: document.querySelector("#holdback"),
  fee: document.querySelector("#fee"),
  fundingCost: document.querySelector("#fundingCost"),
  pdStress: document.querySelector("#pdStress"),
  lossGivenDefault: document.querySelector("#lossGivenDefault"),
  operatingMargin: document.querySelector("#operatingMargin"),
  operatingCost: document.querySelector("#operatingCost"),
  seasonDropOutput: document.querySelector("#seasonDropOutput"),
  holdbackOutput: document.querySelector("#holdbackOutput"),
  feeOutput: document.querySelector("#feeOutput"),
  fundingCostOutput: document.querySelector("#fundingCostOutput"),
  pdStressOutput: document.querySelector("#pdStressOutput"),
  lossGivenDefaultOutput: document.querySelector("#lossGivenDefaultOutput"),
  operatingMarginOutput: document.querySelector("#operatingMarginOutput"),
  operatingCostOutput: document.querySelector("#operatingCostOutput"),
  clusterControls: document.querySelector("#clusterControls"),
  decisionValue: document.querySelector("#decisionValue"),
  riskBandValue: document.querySelector("#riskBandValue"),
  scoreValue: document.querySelector("#scoreValue"),
  scoreMeter: document.querySelector("#scoreMeter"),
  pdValue: document.querySelector("#pdValue"),
  pricingHint: document.querySelector("#pricingHint"),
  recommendedValue: document.querySelector("#recommendedValue"),
  maxAdvanceValue: document.querySelector("#maxAdvanceValue"),
  hostCity: document.querySelector("#hostCity"),
  listingType: document.querySelector("#listingType"),
  seasonalityLabel: document.querySelector("#seasonalityLabel"),
  futureBookingTotal: document.querySelector("#futureBookingTotal"),
  revenueChart: document.querySelector("#revenueChart"),
  hostFacts: document.querySelector("#hostFacts"),
  futureBookings: document.querySelector("#futureBookings"),
  offerMarginLabel: document.querySelector("#offerMarginLabel"),
  offerProfitability: document.querySelector("#offerProfitability"),
  decisionPanel: document.querySelector(".decision-panel"),
  demoNarrative: document.querySelector("#demoNarrative"),
  demoActions: document.querySelectorAll("[data-demo-action]"),
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatCompactMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 1,
    notation: "compact",
  }).format(Number(value) || 0);
}

function convertMoneyFieldsToUsd(value) {
  if (Array.isArray(value)) {
    value.forEach(convertMoneyFieldsToUsd);
    return;
  }
  if (!value || typeof value !== "object") return;

  Object.entries(value).forEach(([key, item]) => {
    if (typeof item === "number" && key.endsWith("Ars")) {
      value[key] = Math.round(item / ARS_PER_USD);
    } else {
      convertMoneyFieldsToUsd(item);
    }
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 1,
  }).format(value);
}

function getMarket(host) {
  return modelData.markets.find((market) => market.city === host.city);
}

function weightedScore(scores = clusterScores) {
  return modelData.scoreModel.clusters.reduce((total, cluster) => {
    return total + (scores[cluster.key] || 0) * (cluster.weightPct / 100);
  }, 0);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

// Proxy experta para la demo. En producción se reemplaza por una PD calibrada
// con resultados reales de recuperación/default.
function proxyPdPct(score, stressPct = 0) {
  const basePdPct = clamp(50 * Math.exp(-0.06 * (score - 40)), 1.5, 45);
  return clamp(basePdPct * (1 + stressPct / 100), 0.5, 60);
}

function getHardRuleReasons(host) {
  const reasons = [];
  if (host.profile.fraudFlags > 0) reasons.push("alerta de fraude");
  if (host.profile.accountSuspensionCount > 0) reasons.push("cuenta suspendida");
  if (!host.profile.identityVerified) reasons.push("identidad no verificada");
  if (!host.profile.bankAccountVerified) reasons.push("cuenta bancaria no verificada");
  if (host.listing.legalPermitStatus !== "verified") reasons.push("habilitación pendiente");
  return reasons;
}

function riskBand(score) {
  if (score >= 85) return "bajo";
  if (score >= 75) return "medio bajo";
  if (score >= 65) return "medio";
  if (score >= 50) return "medio alto";
  return "alto";
}

function decisionLabel(decision) {
  const labels = {
    approved: "Aprobado",
    partial: "Aprobación parcial",
    pilot: "Línea piloto",
    rejected: "Rechazado",
  };
  return labels[decision] || decision;
}

function decisionClass(decision) {
  if (decision === "approved") return "approved";
  if (decision === "partial") return "partial";
  if (decision === "pilot") return "pilot";
  return "rejected";
}

function getParams() {
  return {
    requested: Number(els.requestedAmount.value) || 0,
    futureRevenueP10: Number(els.futureRevenue.value) || 0,
    seasonDrop: Number(els.seasonDrop.value) || 0,
    holdback: Number(els.holdback.value) || 0,
    fee: Number(els.fee.value) || 0,
  };
}

function getEconomicsParams() {
  return {
    fundingCost: Number(els.fundingCost.value) || 0,
    pdStress: Number(els.pdStress.value) || 0,
    lossGivenDefault: Number(els.lossGivenDefault.value) || 0,
    operatingMargin: Number(els.operatingMargin.value) || 0,
    operatingCost: Number(els.operatingCost.value) || 0,
  };
}

function calculatePricing(pdPct, months, assumptions) {
  const pd = clamp(pdPct / 100, 0, 0.99);
  const lgd = assumptions.lossGivenDefault / 100;
  const riskPremiumAnnualPct = ((pd * lgd) / (1 - pd || 1)) * 100;
  const annualRatePct =
    assumptions.fundingCost + assumptions.operatingMargin + riskPremiumAnnualPct;
  const suggestedFeePct =
    annualRatePct * (Math.max(months, 1) / 12) + assumptions.operatingCost;

  return { annualRatePct, riskPremiumAnnualPct, suggestedFeePct };
}

function termPdPct(pdPct, months) {
  const annualPd = clamp(pdPct / 100, 0, 0.99);
  const termYears = Math.max(months, 1) / 12;
  return (1 - (1 - annualPd) ** termYears) * 100;
}

function classifyDecision({ hardRuleReasons, pdPct, recommended, requested, score }) {
  if (hardRuleReasons.length > 0 || score < 50 || pdPct >= 35) return "rejected";
  if (score < 65 || pdPct >= 15) return recommended > 0 ? "pilot" : "rejected";
  if (recommended >= requested * 0.95 && requested > 0) return "approved";
  if (recommended >= requested * 0.45 && requested > 0) return "partial";
  return recommended > 0 ? "pilot" : "rejected";
}

function simulateOffer() {
  const params = getParams();
  const economics = getEconomicsParams();
  const score = weightedScore();
  const pdPct = proxyPdPct(score, economics.pdStress);
  const hardRuleReasons = getHardRuleReasons(selectedHost);
  const adjustedRevenue = params.futureRevenueP10 * (1 - params.seasonDrop / 100);
  const recoverabilityCap =
    (adjustedRevenue * (params.holdback / 100)) / (1 + params.fee / 100 || 1);
  const maxAdvance = recoverabilityCap * (1 - pdPct / 100);
  let recommended = Math.max(0, Math.min(params.requested, maxAdvance));
  const decision = classifyDecision({
    hardRuleReasons,
    pdPct,
    recommended,
    requested: params.requested,
    score,
  });
  if (decision === "rejected") {
    recommended = 0;
  }

  const pricing = calculatePricing(
    pdPct,
    selectedHost.creditOffer.estimatedRepaymentMonths,
    economics,
  );

  return {
    adjustedRevenue,
    decision,
    hardRuleReasons,
    maxAdvance,
    params,
    pdPct,
    pricing,
    recommended,
    recoverabilityCap,
    score,
  };
}

function estimateVisibleRepayment(recommended, params) {
  return estimateHostVisibleRepayment(selectedHost, recommended, params);
}

function estimateHostVisibleRepayment(host, recommended, params) {
  if (recommended <= 0) {
    return {
      coverage: 0,
      collected: 0,
      months: 0,
      target: 0,
      fullyRepaid: false,
    };
  }

  const target = recommended * (1 + params.fee / 100);
  let collected = 0;
  const months = new Set();

  for (const booking of host.futureBookings) {
    const adjustedBooking =
      booking.grossValueArs *
      (1 - booking.cancellationRiskPct / 100) *
      (1 - params.seasonDrop / 100);
    collected += adjustedBooking * (params.holdback / 100);
    months.add(booking.payoutDate.slice(0, 7));

    if (collected >= target) break;
  }

  return {
    coverage: target > 0 ? Math.min(collected / target, 1) : 0,
    collected,
    months: months.size,
    target,
    fullyRepaid: collected >= target,
  };
}

function renderHostSelect() {
  const orderedHosts = [...modelData.hosts].sort((a, b) => {
    if (a.hostId === PRIMARY_DEMO_HOST_ID) return -1;
    if (b.hostId === PRIMARY_DEMO_HOST_ID) return 1;
    return a.hostId.localeCompare(b.hostId);
  });

  els.hostSelect.innerHTML = orderedHosts
    .map((host) => {
      return `<option value="${host.hostId}">${host.hostId} - ${host.city} - ${host.displayName}</option>`;
    })
    .join("");
}

function setHost(hostId) {
  selectedHost = modelData.hosts.find((host) => host.hostId === hostId);
  const offer = selectedHost.creditOffer;

  clusterScores = {};
  for (const cluster of modelData.scoreModel.clusters) {
    clusterScores[cluster.key] = selectedHost.clusterScores[scoreKeyByCluster[cluster.key]];
  }

  els.hostSelect.value = selectedHost.hostId;
  els.requestedAmount.value = offer.requestedAmountArs;
  els.futureRevenue.value = offer.expectedFutureRevenueP10Ars;
  els.seasonDrop.value = 0;
  els.holdback.value = offer.holdbackPct;
  els.fee.value = offer.feePct;

  renderClusterControls();
  renderStaticHostData();
  render();
}

function renderClusterControls() {
  els.clusterControls.innerHTML = modelData.scoreModel.clusters
    .map((cluster) => {
      const score = clusterScores[cluster.key];
      return `
        <div class="cluster-control">
          <label>
            <span>
              ${cluster.name}
              <small>${score}</small>
            </span>
            <input
              data-cluster="${cluster.key}"
              type="range"
              min="0"
              max="100"
              step="1"
              value="${score}"
            />
          </label>
        </div>
      `;
    })
    .join("");

  els.clusterControls.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", (event) => {
      const key = event.target.dataset.cluster;
      clusterScores[key] = Number(event.target.value);
      event.target.closest(".cluster-control").querySelector("small").textContent =
        event.target.value;
      render();
    });
  });
}

function renderStaticHostData() {
  const market = getMarket(selectedHost);
  const highSeason = market.highSeasonMonths.map((month) => month.toUpperCase()).join(" ");

  els.hostCity.textContent = selectedHost.city;
  els.listingType.textContent = selectedHost.listing.propertyType;
  els.seasonalityLabel.textContent = `Alta: ${highSeason}`;

  const futureTotal = selectedHost.futureBookings.reduce(
    (sum, booking) => sum + booking.grossValueArs,
    0,
  );
  els.futureBookingTotal.textContent = formatMoney(futureTotal);

  els.hostFacts.innerHTML = [
    ["Antigüedad", `${formatNumber(selectedHost.profile.hostTenureYears)} años`],
    ["Reservas", selectedHost.profile.completedBookings],
    ["Rating", selectedHost.reputation.averageRating.toFixed(2)],
    ["Reviews", selectedHost.reputation.reviewsCount],
    ["Cancelación", `${selectedHost.reputation.cancellationRatePct}%`],
    ["Respuesta", `${selectedHost.reputation.responseRatePct}%`],
    ["Amenities", `${selectedHost.listing.amenitiesScore}/100`],
    ["Mercado", `${market.demandIndex}/100`],
  ]
    .map(([label, value]) => {
      return `<div><dt>${label}</dt><dd>${value}</dd></div>`;
    })
    .join("");
}

function render() {
  const result = simulateOffer();
  renderOutputs(result);
  renderRevenueChart();
  renderFutureBookings(result);
  renderOfferProfitability(result);
}

function updateDemoScenario(scenario) {
  activeDemoScenario = scenario;
  els.demoActions.forEach((button) => {
    button.classList.toggle("active", button.dataset.demoAction === activeDemoScenario);
  });
}

function applyDemoScenario(scenario) {
  updateDemoScenario(scenario);

  if (scenario === "base") {
    setHost(PRIMARY_DEMO_HOST_ID);
    els.demoNarrative.textContent =
      "Martín recibe aprobación total porque el adelanto pedido entra dentro del tope responsable.";
    return;
  }

  if (scenario === "stress") {
    setHost(PRIMARY_DEMO_HOST_ID);
    els.seasonDrop.value = 30;
    els.demoNarrative.textContent =
      "Ante una temporada 30% menor, el monto baja automáticamente y la decisión pasa a aprobación parcial.";
    render();
    return;
  }

  setHost(REJECTED_DEMO_HOST_ID);
  els.demoNarrative.textContent =
    "Una habilitación pendiente activa una regla excluyente: monto cero y motivo visible.";
}

function renderOutputs(result) {
  els.seasonDropOutput.textContent = `${result.params.seasonDrop}%`;
  els.holdbackOutput.textContent = `${result.params.holdback}%`;
  els.feeOutput.textContent = `${result.params.fee}%`;
  const economics = getEconomicsParams();
  els.fundingCostOutput.textContent = `${economics.fundingCost}%`;
  els.pdStressOutput.textContent = `${economics.pdStress > 0 ? "+" : ""}${economics.pdStress}%`;
  els.lossGivenDefaultOutput.textContent = `${economics.lossGivenDefault}%`;
  els.operatingMarginOutput.textContent = `${economics.operatingMargin}%`;
  els.operatingCostOutput.textContent = `${economics.operatingCost}%`;

  els.decisionValue.textContent = decisionLabel(result.decision);
  els.riskBandValue.textContent =
    result.hardRuleReasons.length > 0
      ? `Regla: ${result.hardRuleReasons.join(", ")}`
      : `Riesgo ${riskBand(result.score)}`;
  els.scoreValue.textContent = result.score.toFixed(1);
  els.scoreMeter.style.width = `${Math.max(0, Math.min(result.score, 100))}%`;
  els.pdValue.textContent = `${result.pdPct.toFixed(1)}%`;
  els.pricingHint.textContent =
    result.decision === "rejected"
      ? "Pricing no aplica por regla o riesgo excluyente"
      : `Fee sugerido ${result.pricing.suggestedFeePct.toFixed(1)}% · contractual ${result.params.fee}%`;
  els.recommendedValue.textContent = formatMoney(result.recommended);
  els.maxAdvanceValue.textContent =
    `Tope P10 ${formatMoney(result.recoverabilityCap)} · ajustado por PD ${formatMoney(result.maxAdvance)}`;

  els.decisionPanel.className = `metric-panel decision-panel ${decisionClass(result.decision)}`;
}

function renderRevenueChart() {
  const maxRevenue = Math.max(
    ...selectedHost.monthlyRevenue.map((row) => row.grossRevenueArs),
    1,
  );
  const avgRevenue =
    selectedHost.monthlyRevenue.reduce((sum, row) => sum + row.grossRevenueArs, 0) /
    selectedHost.monthlyRevenue.length;

  els.revenueChart.innerHTML = selectedHost.monthlyRevenue
    .map((row) => {
      const month = monthNames[row.month.slice(5, 7)] || row.month.slice(5, 7);
      const height = Math.max(4, (row.grossRevenueArs / maxRevenue) * 100);
      const tone =
        row.grossRevenueArs >= avgRevenue * 1.25
          ? "high"
          : row.grossRevenueArs <= avgRevenue * 0.6
            ? "low"
            : "";

      return `
        <div class="bar-item" title="${month}: ${formatMoney(row.grossRevenueArs)}">
          <div class="bar-track">
            <span class="bar-fill ${tone}" style="height: ${height}%"></span>
          </div>
          <span class="bar-label">${month}</span>
          <span class="bar-value">${formatCompactMoney(row.grossRevenueArs)}</span>
        </div>
      `;
    })
    .join("");
}

function renderFutureBookings(result) {
  if (selectedHost.futureBookings.length === 0) {
    els.futureBookings.innerHTML = "<p>No hay reservas futuras.</p>";
    return;
  }

  els.futureBookings.innerHTML = selectedHost.futureBookings
    .map((booking) => {
      const adjusted =
        booking.grossValueArs *
        (1 - booking.cancellationRiskPct / 100) *
        (1 - result.params.seasonDrop / 100);
      const retained = adjusted * (result.params.holdback / 100);
      const checkin = booking.checkinDate.slice(5).replace("-", "/");
      const checkout = booking.checkoutDate.slice(5).replace("-", "/");
      return `
        <div class="booking-item">
          <div>
            <strong>${checkin} al ${checkout}</strong>
            <span>Cobro ${booking.payoutDate} · ${formatMoney(booking.grossValueArs)}</span>
          </div>
          <div>
            <small>${booking.cancellationRiskPct}% riesgo</small>
            <span>${formatMoney(retained)} retenible</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderOfferProfitability(result) {
  const assumptions = getEconomicsParams();
  const principal = result.recommended;
  const months = Math.max(1, selectedHost.creditOffer.estimatedRepaymentMonths || 1);
  const feeIncome = principal * (result.params.fee / 100);
  const fundingCost = principal * (assumptions.fundingCost / 100) * (months / 12);
  const termPd = termPdPct(result.pdPct, months);
  const expectedLoss =
    principal * (termPd / 100) * (assumptions.lossGivenDefault / 100);
  const operatingCost = principal * (assumptions.operatingCost / 100);
  const totalCosts = fundingCost + expectedLoss + operatingCost;
  const profit = feeIncome - totalCosts;
  const marginPct = principal > 0 ? (profit / principal) * 100 : 0;
  const tone = profit >= 0 ? "positive" : "negative";

  els.offerMarginLabel.textContent =
    principal > 0 ? `Margen estimado ${marginPct.toFixed(1)}%` : "Sin oferta";
  els.offerProfitability.innerHTML = [
    ["Adelanto", formatMoney(principal), ""],
    ["Ingreso por fee", formatMoney(feeIncome), "positive"],
    ["Costos + riesgo", formatMoney(totalCosts), "negative"],
    ["Resultado estimado", formatMoney(profit), `${tone} outcome`],
  ]
    .map(([label, value, itemTone]) => {
      return `
        <div class="profit-metric ${itemTone}">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `;
    })
    .join("");
}

function bindEvents() {
  els.hostSelect.addEventListener("change", (event) => {
    updateDemoScenario("custom");
    els.demoNarrative.textContent =
      "Exploración manual: ajustá supuestos y observá cómo cambia la decisión.";
    setHost(event.target.value);
  });
  els.resetButton.addEventListener("click", () => setHost(selectedHost.hostId));
  els.demoActions.forEach((button) => {
    button.addEventListener("click", () => applyDemoScenario(button.dataset.demoAction));
  });

  [
    els.requestedAmount,
    els.futureRevenue,
    els.seasonDrop,
    els.holdback,
    els.fee,
    els.fundingCost,
    els.pdStress,
    els.lossGivenDefault,
    els.operatingMargin,
    els.operatingCost,
  ].forEach((input) => input.addEventListener("input", render));
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${DATA_URL}`);
  }

  modelData = await response.json();
  convertMoneyFieldsToUsd(modelData);
  modelData.metadata.currency = "USD";
  renderHostSelect();
  bindEvents();
  setHost(PRIMARY_DEMO_HOST_ID);
}

init().catch((error) => {
  document.body.innerHTML = `
    <main class="app-shell">
      <section class="metric-panel">
        <strong>Error al cargar la demo</strong>
        <small>${error.message}</small>
      </section>
    </main>
  `;
});
