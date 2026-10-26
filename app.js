const DATA_URL = 'fhcars.json';
const DESCRIPTION_URLS = { en: 'fhcars_descriptions_en.json', pl: 'fhcars_descriptions_pl.json' };
const STORAGE_KEY = 'fh1-garage-purchases';
const translations = {
  en: { eyebrow:'THE OPEN ROAD AWAITS', heroText:'Your personal Forza Horizon 1 collection. Pick your next ride, track your garage, and keep the festival moving.', collection:'COLLECTION', garageValue:'GARAGE VALUE', completion:'COMPLETION', shop:'SHOP', garage:'GARAGE', search:'Search make or model...', sortFeatured:'Featured', sortPriceAsc:'Price: low to high', sortPriceDesc:'Price: high to low', sortPower:'Power', sortYear:'Year', buy:'ADD TO GARAGE', remove:'REMOVE', owned:'IN GARAGE', emptyTitle:'No cars in this lane', emptyText:'Try a different search or move a few rides into your garage.', footer:'A personal collection tracker · Forza Horizon 1' },
  pl: { eyebrow:'OTWARTA DROGA CZEKA', heroText:'Twoja osobista kolekcja z Forza Horizon 1. Wybierz kolejny samochód, śledź garaż i ruszaj na festiwal.', collection:'KOLEKCJA', garageValue:'WARTOŚĆ GARAŻU', completion:'UKOŃCZENIE', shop:'SKLEP', garage:'GARAŻ', search:'Szukaj marki lub modelu...', sortFeatured:'Polecane', sortPriceAsc:'Cena: rosnąco', sortPriceDesc:'Cena: malejąco', sortPower:'Moc', sortYear:'Rok', buy:'DODAJ DO GARAŻU', remove:'USUŃ', owned:'W GARAŻU', emptyTitle:'Brak samochodów w tym miejscu', emptyText:'Zmień wyszukiwanie lub przenieś samochody do garażu.', footer:'Osobisty tracker kolekcji · Forza Horizon 1' }
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
}
function render() {
  translatePage();
  const query = $('#search').value.toLowerCase().trim();
  const sort = $('#sort').value;
  let visible = cars.filter(car => (activeTab === 'shop' ? !purchases.has(identity(car)) : purchases.has(identity(car))))
    .filter(car => `${car.brand} ${car.model} ${car.year}`.toLowerCase().includes(query));
  visible.sort((a,b) => sort === 'priceAsc' ? a.price_cr-b.price_cr : sort === 'priceDesc' ? b.price_cr-a.price_cr : sort === 'powerDesc' ? b.power_hp-a.power_hp : sort === 'yearAsc' ? a.year-b.year : 0);
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
  return `<article class="card" style="animation-delay:${Math.min(i,12)*25}ms"><div class="card-top"></div><div class="card-body"><div class="card-head"><div><span class="year">${car.year} · ${car.brand}</span><h2>${car.model}</h2></div><span class="price">${money(car.price_cr)}</span></div><p class="description">${descriptions[key] || ''}</p><div class="specs"><div class="spec"><span>POWER</span><strong>${car.power_hp} HP</strong></div><div class="spec"><span>TORQUE</span><strong>${car.torque_lb_ft} LB-FT</strong></div><div class="spec"><span>ENGINE</span><strong>${car.engine_liters} L</strong></div></div><div class="card-actions"><span class="owned">${purchases.has(id) ? t.owned : 'FORZA HORIZON 1'}</span><button class="buy" data-id="${encodeURIComponent(id)}">${purchases.has(id) ? t.remove : t.buy}</button></div></div></article>`;
}
document.addEventListener('click', e => {
  const tab = e.target.closest('.tab'); if (tab) { activeTab = tab.dataset.tab; document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab)); render(); }
  const button = e.target.closest('.buy'); if (button) { const id = decodeURIComponent(button.dataset.id); purchases.has(id) ? purchases.delete(id) : purchases.add(id); localStorage.setItem(STORAGE_KEY, JSON.stringify([...purchases])); render(); }
});
$('#search').addEventListener('input', render); $('#sort').addEventListener('change', render);
$('#language-toggle').addEventListener('click', () => { language = language === 'en' ? 'pl' : 'en'; localStorage.setItem('fh1-language', language); load(); });
load();
