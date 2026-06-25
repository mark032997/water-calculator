const RATES = {
  // Galena Park pays City of Houston for clean water
  houstonWaterCost: 4.73,

  // Galena Park trash/tax shown in full bill comparison
  trash: 22.50,
  trashTaxRate: 0.0825,

  // CURRENT GALENA PARK SYSTEM
  // Regular: $14.46 through 6,000 gallons, then each started 1,000-gallon overage block is $7.76.
  // Senior: $10.58 through 6,000 gallons, then each started 1,000-gallon overage block is $5.70.
  // Overage is rounded up by block: 6,001-7,000 = 1 overage block; 7,001-8,000 = 2 blocks.
  // Current sewer equals current water.
  currentRegularMinGallons: 6000,
  currentRegularMinCharge: 14.46,
  currentRegularOveragePerKgal: 7.76,
  currentSeniorMinGallons: 6000,
  currentSeniorMinCharge: 10.58,
  currentSeniorOveragePerKgal: 5.70,
  currentSewerPctOfWater: 1.00,

  // PROPOSED / FUTURE GALENA PARK SYSTEM
  // Universal 3,500-gallon minimum.
  // Regular: $6.00 per 1,000 gallons.
  // Senior: at cost, $4.73 per 1,000 gallons.
  // Future sewer equals 70% of future water.
  futureMinGallons: 3500,
  futureRegularPerKgal: 6.00,
  futureSeniorPerKgal: 4.73,
  futureWastewaterPctOfWater: 0.70,

  // JACINTO CITY COMPARISON
  // Water: $23.26 for first 2,000 gallons, then $6.26 per 1,000 gallons.
  // Sewer: $11.85 for first 2,000 gallons, then $2.99 per 1,000 gallons.
  // Garbage: $16.96, EMS: $2.00.
  jacintoWaterMinGallons: 2000,
  jacintoWaterMinCharge: 23.26,
  jacintoWaterOverage: 6.26,
  jacintoSewerMinGallons: 2000,
  jacintoSewerMinCharge: 11.85,
  jacintoSewerOverage: 2.99,
  jacintoGarbage: 16.96,
  jacintoEMS: 2.00
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

function billWithMinimumCharge(gallons, minGallons, minCharge, overagePerKgal) {
  const overGallons = Math.max(0, gallons - minGallons);
  const overageBlocks = Math.ceil(overGallons / 1000);
  return minCharge + overageBlocks * overagePerKgal;
}

function currentWater(gallons, isSenior) {
  return isSenior
    ? billWithMinimumCharge(
        gallons,
        RATES.currentSeniorMinGallons,
        RATES.currentSeniorMinCharge,
        RATES.currentSeniorOveragePerKgal
      )
    : billWithMinimumCharge(
        gallons,
        RATES.currentRegularMinGallons,
        RATES.currentRegularMinCharge,
        RATES.currentRegularOveragePerKgal
      );
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

function jacintoFullBill(gallons) {
  const water = billWithMinimumCharge(
    gallons,
    RATES.jacintoWaterMinGallons,
    RATES.jacintoWaterMinCharge,
    RATES.jacintoWaterOverage
  );
  const sewer = billWithMinimumCharge(
    gallons,
    RATES.jacintoSewerMinGallons,
    RATES.jacintoSewerMinCharge,
    RATES.jacintoSewerOverage
  );
  const garbage = RATES.jacintoGarbage;
  const ems = RATES.jacintoEMS;
  return { water, sewer, garbage, ems, total: water + sewer + garbage + ems };
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
  const jacintoBill = jacintoFullBill(gallons);

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
  fillText("jacintoTotal", money(jacintoBill.total));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gallons")?.addEventListener("input", calculate);
  document.getElementById("seniorToggle")?.addEventListener("change", calculate);
  calculate();
});