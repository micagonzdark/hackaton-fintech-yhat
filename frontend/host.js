const DATA_URL = "../backend/seed/demo_credit_data.json";
const ARS_PER_USD = 1000;
const PRIMARY_DEMO_HOST_ID = "H002";

let data;
let currentHost;

const els = {
  hostSelect: document.querySelector("#hostViewSelect"),
  offerHero: document.querySelector("#offerHero"),
  cycleStrip: document.querySelector("#cycleStrip"),
  offerContent: document.querySelector("#offerContent"),
  rejectedContent: document.querySelector("#rejectedContent"),
  offerStatus: document.querySelector("#offerStatus"),
  offerTitle: document.querySelector("#offerTitle"),
  offerDescription: document.querySelector("#offerDescription"),
  offerAdvance: document.querySelector("#offerAdvance"),
  offerCity: document.querySelector("#offerCity"),
  detailAdvance: document.querySelector("#detailAdvance"),
  detailFee: document.querySelector("#detailFee"),
  detailTotal: document.querySelector("#detailTotal"),
  detailHoldback: document.querySelector("#detailHoldback"),
  detailMonths: document.querySelector("#detailMonths"),
  detailCoverage: document.querySelector("#detailCoverage"),
  offerReasons: document.querySelector("#offerReasons"),
  dataConsent: document.querySelector("#dataConsent"),
  payoutConsent: document.querySelector("#payoutConsent"),
  acceptOffer: document.querySelector("#acceptOffer"),
  acceptanceMessage: document.querySelector("#acceptanceMessage"),
  rejectedReason: document.querySelector("#rejectedReason"),
};

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
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

function visibleCoverage(host) {
  const offer = host.creditOffer;
  const target = offer.recommendedAdvanceArs * (1 + offer.feePct / 100);
  if (target <= 0) return 0;
  const retained = host.futureBookings.reduce((total, booking) => {
    return (
      total +
      booking.grossValueArs *
        (1 - booking.cancellationRiskPct / 100) *
        (offer.holdbackPct / 100)
    );
  }, 0);
  return Math.min(100, Math.round((retained / target) * 100));
}

function decisionLabel(decision) {
  return {
    approved: "Oferta disponible",
    partial: "Oferta conservadora",
    pilot_line: "Línea piloto",
  }[decision] || "Evaluación completada";
}

function renderHost(hostId) {
  currentHost = data.hosts.find((host) => host.hostId === hostId);
  const offer = currentHost.creditOffer;
  const rejected = offer.decision === "rejected" || offer.recommendedAdvanceArs <= 0;

  els.hostSelect.value = currentHost.hostId;
  els.offerContent.hidden = rejected;
  els.rejectedContent.hidden = !rejected;
  els.offerHero.hidden = rejected;
  els.cycleStrip.hidden = rejected;
  els.acceptanceMessage.textContent = "";
  els.dataConsent.checked = false;
  els.payoutConsent.checked = false;
  els.acceptOffer.disabled = true;

  if (rejected) {
    els.rejectedReason.textContent =
      `${currentHost.displayName}: ${offer.mainReasons.join(", ")}. La evaluación puede actualizarse cuando cambien estas condiciones.`;
    return;
  }

  const total = offer.recommendedAdvanceArs * (1 + offer.feePct / 100);
  els.offerStatus.textContent = decisionLabel(offer.decision);
  els.offerTitle.textContent = `Hola, ${currentHost.displayName.split(" - ")[0]}. Tenés una oferta para preparar tu próxima temporada.`;
  els.offerDescription.textContent =
    "Recibí capital hoy y recuperalo con una retención temporal sobre próximos cobros. Sin cuotas fijas.";
  els.offerAdvance.textContent = formatMoney(offer.recommendedAdvanceArs);
  els.offerCity.textContent = `${currentHost.city} · oferta válida para demo`;
  els.detailAdvance.textContent = formatMoney(offer.recommendedAdvanceArs);
  els.detailFee.textContent = `${offer.feePct}% · ${formatMoney(offer.recommendedAdvanceArs * offer.feePct / 100)}`;
  els.detailTotal.textContent = formatMoney(total);
  els.detailHoldback.textContent = `${offer.holdbackPct}%`;
  els.detailMonths.textContent = `${offer.estimatedRepaymentMonths} meses aprox.`;
  els.detailCoverage.textContent = `${visibleCoverage(currentHost)}% del total`;
  els.offerReasons.innerHTML = offer.mainReasons.map((reason) => `<li>${reason}</li>`).join("");
}

function updateAcceptance() {
  els.acceptOffer.disabled = !(els.dataConsent.checked && els.payoutConsent.checked);
}

async function init() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error(`No se pudo cargar ${DATA_URL}`);
  data = await response.json();
  convertMoneyFieldsToUsd(data);
  data.metadata.currency = "USD";
  const orderedHosts = [...data.hosts].sort((a, b) => {
    if (a.hostId === PRIMARY_DEMO_HOST_ID) return -1;
    if (b.hostId === PRIMARY_DEMO_HOST_ID) return 1;
    return a.hostId.localeCompare(b.hostId);
  });
  els.hostSelect.innerHTML = orderedHosts
    .map((host) => `<option value="${host.hostId}">${host.hostId} · ${host.city} · ${host.displayName}</option>`)
    .join("");
  els.hostSelect.addEventListener("change", (event) => renderHost(event.target.value));
  els.dataConsent.addEventListener("change", updateAcceptance);
  els.payoutConsent.addEventListener("change", updateAcceptance);
  els.acceptOffer.addEventListener("click", () => {
    els.acceptanceMessage.textContent =
      `Aceptación simulada: recibirías ${formatMoney(currentHost.creditOffer.recommendedAdvanceArs)} y la retención finalizaría automáticamente al completar el total.`;
    els.acceptOffer.disabled = true;
  });
  renderHost(PRIMARY_DEMO_HOST_ID);
}

init().catch((error) => {
  document.body.innerHTML = `<main class="host-main"><section class="rejected-card"><h2>Error al cargar la demo</h2><p>${error.message}</p></section></main>`;
});
