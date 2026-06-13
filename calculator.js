
const RATES = {
  houstonWaterCost: 4.73,
  trash: 22.50,
  trashTaxRate: 0.0825,

  currentRegularMinGallons: 6000,
  currentRegularMinCharge: 14.46,
  currentRegularOverage: 7.76,

  currentSeniorMinGallons: 6000,
  currentSeniorMinCharge: 10.58,
  currentSeniorOverage: 5.70,

  futureMinGallons: 3500,
  futureRegularPerKgal: 7.76,
  futureSeniorPerKgal: 5.70,

  // Future wastewater assumption requested by user:
  // 70% of future water charge.
  futureWastewaterPctOfWater: 0.70,

  // Current full bill assumption used in this public calculator.
  currentSewerPctOfWater: 1.00,

  jacintoMinGallons: 2000,
  jacintoMinCharge: 23.26,
  jacintoOverage: 6.26
};

function money(value){
  return value.toLocaleString("en-US", {style:"currency", currency:"USD"});
}
function bill(gallons, minGallons, minCharge, overageRate){
  const overGallons = Math.max(0, gallons - minGallons);
  return minCharge + (overGallons / 1000) * overageRate;
}
function currentWater(gallons, isSenior){
  return isSenior
    ? bill(gallons, RATES.currentSeniorMinGallons, RATES.currentSeniorMinCharge, RATES.currentSeniorOverage)
    : bill(gallons, RATES.currentRegularMinGallons, RATES.currentRegularMinCharge, RATES.currentRegularOverage);
}
function futureWater(gallons, isSenior){
  const rate = isSenior ? RATES.futureSeniorPerKgal : RATES.futureRegularPerKgal;
  const minCharge = RATES.futureMinGallons / 1000 * rate;
  return bill(gallons, RATES.futureMinGallons, minCharge, rate);
}
function cohCost(gallons){
  return gallons / 1000 * RATES.houstonWaterCost;
}
function jacintoWater(gallons){
  return bill(gallons, RATES.jacintoMinGallons, RATES.jacintoMinCharge, RATES.jacintoOverage);
}
function taxOnTrash(){
  return RATES.trash * RATES.trashTaxRate;
}
function currentFullBill(gallons, isSenior){
  const water = currentWater(gallons, isSenior);
  const sewer = water * RATES.currentSewerPctOfWater;
  const trash = RATES.trash;
  const tax = taxOnTrash();
  return {water, sewer, trash, tax, total: water + sewer + trash + tax};
}
function futureFullBill(gallons, isSenior){
  const water = futureWater(gallons, isSenior);
  const sewer = water * RATES.futureWastewaterPctOfWater;
  const trash = RATES.trash;
  const tax = taxOnTrash();
  return {water, sewer, trash, tax, total: water + sewer + trash + tax};
}
function jacintoFullBill(gallons){
  const water = jacintoWater(gallons);
  const sewer = water * 0.50;
  const trash = RATES.trash;
  const tax = taxOnTrash();
  return {water, sewer, trash, tax, total: water + sewer + trash + tax};
}
function setGallons(value){
  document.getElementById("gallons").value = value;
  calculate();
}
function fillText(id, value){
  const el = document.getElementById(id);
  if(el) el.textContent = value;
}
function calculate(){
  const gallons = Math.max(0, Number(document.getElementById("gallons")?.value || 0));
  const isSenior = !!document.getElementById("seniorToggle")?.checked;

  const nowWater = currentWater(gallons, isSenior);
  const paidToCoh = cohCost(gallons);
  const waterLoss = Math.max(0, paidToCoh - nowWater);

  const nowBill = currentFullBill(gallons, isSenior);
  const futureBill = futureFullBill(gallons, isSenior);
  const jacinto = jacintoFullBill(gallons);

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

  fillText("jacintoTotal", money(jacinto.total));
  fillText("futureDifference", money(futureBill.total - nowBill.total));
  fillText("futureWaterMargin", money(futureBill.water - paidToCoh));
}
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gallons")?.addEventListener("input", calculate);
  document.getElementById("seniorToggle")?.addEventListener("change", calculate);
  calculate();
});
