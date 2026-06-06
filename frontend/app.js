const DATA_URL = "../backend/seed/demo_credit_data.json";

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

const els = {
  hostSelect: document.querySelector("#hostSelect"),
  resetButton: document.querySelector("#resetButton"),
  requestedAmount: document.querySelector("#requestedAmount"),
  futureRevenue: document.querySelector("#futureRevenue"),
  seasonDrop: document.querySelector("#seasonDrop"),
  holdback: document.querySelector("#holdback"),
  fee: document.querySelector("#fee"),
  seasonDropOutput: document.querySelector("#seasonDropOutput"),
  holdbackOutput: document.querySelector("#holdbackOutput"),
  feeOutput: document.querySelector("#feeOutput"),
  clusterControls: document.querySelector("#clusterControls"),
  decisionValue: document.querySelector("#decisionValue"),
  riskBandValue: document.querySelector("#riskBandValue"),
  scoreValue: document.querySelector("#scoreValue"),
  scoreMeter: document.querySelector("#scoreMeter"),
  recommendedValue: document.querySelector("#recommendedValue"),
  maxAdvanceValue: document.querySelector("#maxAdvanceValue"),
  repaymentValue: document.querySelector("#repaymentValue"),
  repaymentHint: document.querySelector("#repaymentHint"),
  hostCity: document.querySelector("#hostCity"),
  listingType: document.querySelector("#listingType"),
  seasonalityLabel: document.querySelector("#seasonalityLabel"),
  weightedScoreLabel: document.querySelector("#weightedScoreLabel"),
  futureBookingTotal: document.querySelector("#futureBookingTotal"),
  revenueChart: document.querySelector("#revenueChart"),
  hostFacts: document.querySelector("#hostFacts"),
  clusterBars: document.querySelector("#clusterBars"),
  futureBookings: document.querySelector("#futureBookings"),
  decisionPanel: document.querySelector(".decision-panel"),
};

function formatMoney(value) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1_000_000) {
    return `ARS ${(amount / 1_000_000).toFixed(2).replace(".", ",")}M`;
  }

  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
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
    partial: "Aprobacion parcial",
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

function simulateOffer() {
  const params = getParams();
  const score = weightedScore();
  const adjustedRevenue = params.futureRevenueP10 * (1 - params.seasonDrop / 100);
  const maxAdvance =
    (adjustedRevenue * (params.holdback / 100)) / (1 + params.fee / 100 || 1);
  let recommended = Math.max(0, Math.min(params.requested, maxAdvance));
  let decision = "rejected";

  if (score < 50) {
    recommended = 0;
  } else if (recommended >= params.requested * 0.95 && params.requested > 0) {
    decision = "approved";
  } else if (recommended >= params.requested * 0.45 && params.requested > 0) {
    decision = "partial";
  } else if (recommended > 0) {
    decision = "pilot";
  }

  const repayment = estimateVisibleRepayment(recommended, params);

  return {
    adjustedRevenue,
    decision,
    maxAdvance,
    params,
    recommended,
    repayment,
    score,
  };
}

function estimateVisibleRepayment(recommended, params) {
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

  for (const booking of selectedHost.futureBookings) {
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
  els.hostSelect.innerHTML = modelData.hosts
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
  renderClusterBars();
  renderFutureBookings(result);
}

function renderOutputs(result) {
  els.seasonDropOutput.textContent = `${result.params.seasonDrop}%`;
  els.holdbackOutput.textContent = `${result.params.holdback}%`;
  els.feeOutput.textContent = `${result.params.fee}%`;

  els.decisionValue.textContent = decisionLabel(result.decision);
  els.riskBandValue.textContent = `Riesgo ${riskBand(result.score)}`;
  els.scoreValue.textContent = result.score.toFixed(1);
  els.scoreMeter.style.width = `${Math.max(0, Math.min(result.score, 100))}%`;
  els.recommendedValue.textContent = formatMoney(result.recommended);
  els.maxAdvanceValue.textContent = `Máximo simulado: ${formatMoney(result.maxAdvance)}`;

  const repayment = result.repayment;
  if (result.recommended <= 0) {
    els.repaymentValue.textContent = "No aplica";
    els.repaymentHint.textContent = "Sin oferta";
  } else {
    els.repaymentValue.textContent = `${Math.round(repayment.coverage * 100)}%`;
    els.repaymentHint.textContent = repayment.fullyRepaid
      ? `Cubre ${formatMoney(repayment.target)} en ${repayment.months} meses visibles`
      : `${formatMoney(repayment.collected)} visible sobre ${formatMoney(repayment.target)}`;
  }

  els.weightedScoreLabel.textContent = `Score ${result.score.toFixed(1)}`;
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
          <span class="bar-value">${formatMoney(row.grossRevenueArs)}</span>
        </div>
      `;
    })
    .join("");
}

function renderClusterBars() {
  els.clusterBars.innerHTML = modelData.scoreModel.clusters
    .map((cluster) => {
      const score = clusterScores[cluster.key] || 0;
      const contribution = score * (cluster.weightPct / 100);
      return `
        <div class="cluster-bar">
          <div class="cluster-bar-row">
            <span class="cluster-name">${cluster.name}</span>
            <span class="cluster-track">
              <span class="cluster-fill" style="width: ${score}%"></span>
            </span>
            <span class="cluster-score">${score}/100</span>
          </div>
          <div class="cluster-note">Peso ${cluster.weightPct}% · aporta ${contribution.toFixed(1)} puntos</div>
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
            <span>Payout ${booking.payoutDate} · ${formatMoney(booking.grossValueArs)}</span>
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

function bindEvents() {
  els.hostSelect.addEventListener("change", (event) => setHost(event.target.value));
  els.resetButton.addEventListener("click", () => setHost(selectedHost.hostId));

  [
    els.requestedAmount,
    els.futureRevenue,
    els.seasonDrop,
    els.holdback,
    els.fee,
  ].forEach((input) => input.addEventListener("input", render));
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) {
    throw new Error(`No se pudo cargar ${DATA_URL}`);
  }

  modelData = await response.json();
  renderHostSelect();
  bindEvents();
  setHost(modelData.hosts[0].hostId);
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
