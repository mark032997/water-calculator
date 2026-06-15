const RATES = {
  houstonWaterCost: 4.73,
  trash: 22.50,
  trashTaxRate: 0.0825,

  // CURRENT SYSTEM
  // Regular: 6,000 gallon minimum at $2.41 per 1,000 gallons.
  // Senior: 6,000 gallon minimum at $1.76 per 1,000 gallons.
  // Current sewer equals current water.
  currentRegularMinGallons: 6000,
  currentRegularPerKgal: 2.41,
  currentSeniorMinGallons: 6000,
  currentSeniorPerKgal: 1.76,
  currentSewerPctOfWater: 1.00,

  // PROPOSED / FUTURE SYSTEM
  // Universal 3,500 gallon minimum.
  // Regular: $6.00 per 1,000 gallons.
  // Senior: at cost, $4.73 per 1,000 gallons.
  // Future sewer equals 60% of future water.
  futureMinGallons: 3500,
  futureRegularPerKgal: 6.00,
  futureSeniorPerKgal: 4.73,
  futureWastewaterPctOfWater: 0.60
};

function money(value) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function minimumCharge(minGallons, perKgal) {
  return (minGallons / 1000) * perKgal;
}

function billByMinimumAndRate(gallons, minGallons, perKgal) {
  const base = minimumCharge(minGallons, perKgal);
  const overGallons = Math.max(0, gallons - minGallons);
  return base + (overGallons / 1000) * perKgal;
}

function currentWater(gallons, isSenior) {
  return isSenior
    ? billByMinimumAndRate(gallons, RATES.currentSeniorMinGallons, RATES.currentSeniorPerKgal)
    : billByMinimumAndRate(gallons, RATES.currentRegularMinGallons, RATES.currentRegularPerKgal);
}

function futureWater(gallons, isSenior) {
  return isSenior
    ? billByMinimumAndRate(gallons, RATES.futureMinGallons, RATES.futureSeniorPerKgal)
    : billByMinimumAndRate(gallons, RATES.futureMinGallons, RATES.futureRegularPerKgal);
}

function cohCost(gallons) {
  return (gallons / 1000) * RATES.houstonWaterCost;
}

function taxOnTrash() {
  return RATES.trash * RATES.trashTaxRate;
}

function currentFullBill(gallons, isSenior) {
  const water = currentWater(gallons, isSenior);
  const sewer = water * RATES.currentSewerPctOfWater;
  const trash = RATES.trash;
  const tax = taxOnTrash();
  return { water, sewer, trash, tax, total: water + sewer + trash + tax };
}

function futureFullBill(gallons, isSenior) {
  const water = futureWater(gallons, isSenior);
  const sewer = water * RATES.futureWastewaterPctOfWater;
  const trash = RATES.trash;
  const tax = taxOnTrash();
  return { water, sewer, trash, tax, total: water + sewer + trash + tax };
}

function setGallons(value) {
  const input = document.getElementById("gallons");
  if (input) input.value = value;
  calculate();
}

function fillText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function calculate() {
  const gallonsEl = document.getElementById("gallons");
  const seniorEl = document.getElementById("seniorToggle");
  const gallons = Math.max(0, Number(gallonsEl?.value || 0));
  const isSenior = !!seniorEl?.checked;

  const nowWater = currentWater(gallons, isSenior);
  const paidToCoh = cohCost(gallons);
  const waterLoss = Math.max(0, paidToCoh - nowWater);

  const nowBill = currentFullBill(gallons, isSenior);
  const futureBill = futureFullBill(gallons, isSenior);

  fillText("waterNow", money(nowWater));
  fillText("paidToCoh", money(paidToCoh));
  fillText("cityLoss", money(waterLoss));

  fillText("currentWater", money(nowBill.water));
  fillText("currentSewer", money(nowBill.sewer));
  fillText("currentTrash", money(nowBill.trash));
  fillText("currentTax", money(nowBill.tax));
  fillText("currentTotal", money(nowBill.total));

  fillText("futureWater", money(futureBill.water));
  fillText("futureSewer", money(futureBill.sewer));
  fillText("futureTrash", money(futureBill.trash));
  fillText("futureTax", money(futureBill.tax));
  fillText("futureTotal", money(futureBill.total));

  fillText("futureDifference", money(futureBill.total - nowBill.total));
  fillText("futureWaterMargin", money(futureBill.water - paidToCoh));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gallons")?.addEventListener("input", calculate);
  document.getElementById("seniorToggle")?.addEventListener("change", calculate);
  calculate();
});