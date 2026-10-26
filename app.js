const DATA_URL = 'fhcars.json';
const DESCRIPTION_URLS = { en: 'fhcars_descriptions_en.json', pl: 'fhcars_descriptions_pl.json' };
const STORAGE_KEY = 'fh1-garage-purchases';
const translations = {
  en: { eyebrow:'THE OPEN ROAD AWAITS', heroText:'Your personal Forza Horizon 1 collection. Pick your next ride, track your garage, and keep the festival moving.', collection:'COLLECTION', garageValue:'GARAGE VALUE', completion:'COMPLETION', shop:'SHOP', garage:'GARAGE', search:'Search make or model...', sortFeatured:'Featured', sortPriceAsc:'Price: low to high', sortPriceDesc:'Price: high to low', sortPowerAsc:'Power: low to high', sortPowerDesc:'Power: high to low', sortTorqueAsc:'Torque: low to high', sortTorqueDesc:'Torque: high to low', sortWeightAsc:'Weight: low to high', sortWeightDesc:'Weight: high to low', sortYearAsc:'Year: old to new', sortYearDesc:'Year: new to old', power:'POWER', torque:'TORQUE', weight:'WEIGHT', engine:'ENGINE', filters:'FILTERS', clearFilters:'Clear filters', brand:'MAKE', allMakes:'All makes', powerRange:'POWER (HP)', torqueRange:'TORQUE (LB-FT)', weightRange:'WEIGHT (LBS)', engineRange:'ENGINE (L)', buy:'ADD TO GARAGE', remove:'REMOVE', owned:'IN GARAGE', emptyTitle:'No cars in this lane', emptyText:'Try a different search or move a few rides into your garage.', footer:'A personal collection tracker · Forza Horizon 1' },
  pl: { eyebrow:'OTWARTA DROGA CZEKA', heroText:'Twoja osobista kolekcja z Forza Horizon 1. Wybierz kolejny samochód, śledź garaż i ruszaj na festiwal.', collection:'KOLEKCJA', garageValue:'WARTOŚĆ GARAŻU', completion:'UKOŃCZENIE', shop:'SKLEP', garage:'GARAŻ', search:'Szukaj marki lub modelu...', sortFeatured:'Polecane', sortPriceAsc:'Cena: rosnąco', sortPriceDesc:'Cena: malejąco', sortPowerAsc:'Moc: rosnąco', sortPowerDesc:'Moc: malejąco', sortTorqueAsc:'Moment: rosnąco', sortTorqueDesc:'Moment: malejąco', sortWeightAsc:'Waga: rosnąco', sortWeightDesc:'Waga: malejąco', sortYearAsc:'Rok: najstarsze', sortYearDesc:'Rok: najnowsze', power:'MOC', torque:'MOMENT', weight:'WAGA', engine:'SILNIK', filters:'FILTRY', clearFilters:'Wyczyść filtry', brand:'MARKA', allMakes:'Wszystkie marki', powerRange:'MOC (KM)', torqueRange:'MOMENT (LB-FT)', weightRange:'WAGA (LBS)', engineRange:'SILNIK (L)', buy:'DODAJ DO GARAŻU', remove:'USUŃ', owned:'W GARAŻU', emptyTitle:'Brak samochodów w tym miejscu', emptyText:'Zmień wyszukiwanie lub przenieś samochody do garażu.', footer:'Osobisty tracker kolekcji · Forza Horizon 1' }
};
let cars = [], descriptions = {}, language = localStorage.getItem('fh1-language') || 'en', activeTab = 'shop';
let purchases = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
const $ = s => document.querySelector(s);
const identity = car => `${car.brand}|${car.model}|${car.year}`;
const money = n => `${new Intl.NumberFormat(language === 'pl' ? 'pl-PL' : 'en-US').format(n)} CR`;
async function load() {
  try {
    const [carResponse, descResponse] = await Promise.all([fetch(DATA_URL), fetch(DESCRIPTION_URLS[language])]);
    if (!carResponse.ok || !descResponse.ok) throw new Error('Could not load vehicle data');
    const database = await carResponse.json();
    const descData = await descResponse.json();
    cars = database.cars;
    $('#brand-filter').insertAdjacentHTML('beforeend', [...new Set(cars.map(car => car.brand))].sort((a,b) => a.localeCompare(b)).map(brand => `<option value="${brand}">${brand}</option>`).join(''));
    descriptions = Object.fromEntries(descData.cars.map(d => [`${d.brand}|${d.model}|${d.year}`, d[`description_${language}`]]));
    render();
  } catch (error) { $('#car-grid').innerHTML = `<p class="empty">Unable to load the vehicle database.</p>`; console.error(error); }
}
function translatePage() {
  const t = translations[language];
  document.documentElement.lang = language;
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t[el.dataset.i18n]; });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => { el.placeholder = t[el.dataset.i18nPlaceholder]; });
  $('#language-toggle').textContent = language === 'en' ? 'PL' : 'EN';
  $('#theme-toggle').setAttribute('aria-label', language === 'pl' ? (document.documentElement.dataset.theme === 'dark' ? 'Włącz jasny motyw' : 'Włącz ciemny motyw') : (document.documentElement.dataset.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'));
  [...$('#brand-filter').options].forEach(option => { if (!option.value) option.textContent = t.allMakes; });
  document.querySelectorAll('.range-filters input').forEach(input => { input.placeholder = language === 'pl' ? (input.id.endsWith('min') ? 'Od' : 'Do') : (input.id.endsWith('min') ? 'Min' : 'Max'); });
}
function render() {
  translatePage();
  const query = $('#search').value.toLowerCase().trim();
  const sort = $('#sort').value;
  const brand = $('#brand-filter').value;
  let visible = cars.filter(car => (activeTab === 'shop' ? !purchases.has(identity(car)) : purchases.has(identity(car))))
    .filter(car => `${car.brand} ${car.model} ${car.year}`.toLowerCase().includes(query))
    .filter(car => !brand || car.brand === brand)
    .filter(car => ['power','torque','weight','engine'].every(field => {
      const value = car[{power:'power_hp',torque:'torque_lb_ft',weight:'weight_lbs',engine:'engine_liters'}[field]];
      const min = $('#'+field+'-min').value, max = $('#'+field+'-max').value;
      return (min === '' || (value != null && value >= Number(min))) && (max === '' || (value != null && value <= Number(max)));
    }));
  const sortValues = { priceAsc:['price_cr',1], priceDesc:['price_cr',-1], powerAsc:['power_hp',1], powerDesc:['power_hp',-1], torqueAsc:['torque_lb_ft',1], torqueDesc:['torque_lb_ft',-1], weightAsc:['weight_lbs',1], weightDesc:['weight_lbs',-1], yearAsc:['year',1], yearDesc:['year',-1] };
  if (sortValues[sort]) { const [field, direction] = sortValues[sort]; visible.sort((a,b) => ((a[field] ?? Infinity) - (b[field] ?? Infinity)) * direction); }
  $('#car-grid').innerHTML = visible.map((car, i) => card(car, i)).join('');
  $('#empty-state').hidden = visible.length > 0;
  $('#shop-count').textContent = cars.filter(c => !purchases.has(identity(c))).length;
  $('#garage-count').textContent = purchases.size;
  const value = cars.filter(c => purchases.has(identity(c))).reduce((sum,c) => sum+c.price_cr, 0);
  $('#collection-count').textContent = `${purchases.size} / ${cars.length}`;
  $('#garage-value').textContent = money(value);
  const percent = cars.length ? Math.round(purchases.size / cars.length * 100) : 0;
  $('#completion-value').textContent = `${percent}%`; $('#progress-bar').style.width = `${percent}%`;
}
function card(car, i) {
  const id = identity(car), key = identity(car);
  const t = translations[language];
  return `<article class="card" style="animation-delay:${Math.min(i,12)*25}ms"><div class="card-top"></div><div class="card-body"><div class="card-head"><div><span class="year">${car.year} · <span class="make">${car.brand}</span></span><h2>${car.model}</h2></div><span class="price">${money(car.price_cr)}</span></div><p class="description">${descriptions[key] || ''}</p><div class="specs"><div class="spec"><span>${t.power}</span><strong>${car.power_hp} HP</strong></div><div class="spec"><span>${t.torque}</span><strong>${car.torque_lb_ft} LB-FT</strong></div><div class="spec"><span>${t.engine}</span><strong>${car.engine_liters} L</strong></div><div class="spec"><span>${t.weight}</span><strong>${car.weight_lbs ?? '—'} LBS</strong></div></div><div class="card-actions"><span class="owned">${purchases.has(id) ? t.owned : ''}</span><button class="buy" data-id="${encodeURIComponent(id)}">${purchases.has(id) ? t.remove : t.buy}</button></div></div></article>`;
}
document.addEventListener('click', e => {
  const tab = e.target.closest('.tab'); if (tab) { activeTab = tab.dataset.tab; document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab)); render(); }
  const button = e.target.closest('.buy'); if (button) { const id = decodeURIComponent(button.dataset.id); purchases.has(id) ? purchases.delete(id) : purchases.add(id); localStorage.setItem(STORAGE_KEY, JSON.stringify([...purchases])); render(); }
});
$('#search').addEventListener('input', render); $('#sort').addEventListener('change', render);
$('#brand-filter').addEventListener('change', render);
document.querySelectorAll('.range-filters input').forEach(input => input.addEventListener('input', render));
$('#clear-filters').addEventListener('click', () => { $('#brand-filter').value = ''; document.querySelectorAll('.range-filters input').forEach(input => input.value = ''); $('#search').value = ''; render(); });
$('#language-toggle').addEventListener('click', () => { language = language === 'en' ? 'pl' : 'en'; localStorage.setItem('fh1-language', language); load(); });
const savedTheme = localStorage.getItem('fh1-theme') || 'light';
document.documentElement.dataset.theme = savedTheme;
function drawThemeIcon() { $('#theme-icon').innerHTML = document.documentElement.dataset.theme === 'dark' ? '<path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/>' : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>'; }
drawThemeIcon();
$('#theme-toggle').addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; localStorage.setItem('fh1-theme', theme); drawThemeIcon(); translatePage(); });
load();
