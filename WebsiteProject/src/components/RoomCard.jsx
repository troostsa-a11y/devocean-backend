import { memo } from 'react';
import { Users, Plus, Minus, ExternalLink, ChevronDown, BedDouble, BedSingle } from 'lucide-react';
import { fmt, perNightFromTemplate } from '../i18n/bookingStrings';
import { IMG } from '../data/content';

// ── Shared helpers (module scope so identities are stable) ────────────────
export function money(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
  } catch {
    return `${currency} ${Number(amount).toFixed(2)}`;
  }
}
// Whole-unit formatting for the informational (approximate) converted amount.
export function approxMoney(amount, currency) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${Math.round(Number(amount) || 0)}`;
  }
}

// All recognised unit-type slugs. Any new room type must be added here first.
export const UNIT_KEYS = ['safari', 'comfort', 'cottage', 'chalet'];

// Subset of UNIT_KEYS whose rooms offer a king/twin bed-preference toggle.
// Garden Cottage is intentionally absent — its bed layout is fixed.
// If a new entry is added to UNIT_KEYS it must also appear here OR in the
// BED_TOGGLE_NON_KEYS list; the unit test enforces this invariant.
export const BED_TOGGLE_UNIT_KEYS = ['safari', 'comfort', 'chalet'];

export function getUnitKey(name) {
  return UNIT_KEYS.find((k) => (name || '').toLowerCase().includes(k));
}

// Sensible default per-room occupancy: fill the room toward the party,
// respecting its adult/child/total caps. Used when the guest hasn't yet
// touched the per-room steppers.
export function defaultRoomOccFor(room, effAdults, effChildren) {
  const uk = getUnitKey(room.name);
  const isChildUnit = BED_TOGGLE_UNIT_KEYS.includes(uk);
  // Beds24 reports maxChildren=0 for every unit; effective capacity is
  // unit-type-driven: safari/comfort/chalet sleep 2A+1C (=3); GC sleeps 2.
  const effMax = isChildUnit ? (room.maxAdults || 2) + 1 : (room.maxAdults || room.maxPeople || 2);
  const maxA = room.maxAdults > 0 ? room.maxAdults : room.maxPeople;
  const a = Math.min(effAdults, maxA);
  const c = Math.min(effChildren, effMax - a);
  return { adults: Math.max(0, a), children: Math.max(0, c), infants: 0 };
}

// Room feature badges — shown on booking cards to match the detail pages.
export const UNIT_FEATURES = {
  safari:  ['shared',  'terrace', 'fan'],
  comfort: ['ensuite', 'terrace', 'fan'],
  cottage: ['ac',      'ensuite', 'queen'],
  chalet:  ['ac',      'ensuite', 'secluded'],
};
export const FEATURE_LABELS = {
  fan:      { en: 'Fan',         pt: 'Ventilador',    nl: 'Ventilator',        fr: 'Ventilateur',          it: 'Ventilatore',       de: 'Ventilator',      es: 'Ventilador',       af: 'Waaier',           sv: 'Fläkt',        pl: 'Wentylator',        ro: 'Ventilator',    sr: 'Ventilator',        hr: 'Ventilator',        cs: 'Ventilátor',      tr: 'Vantilatör', ja: 'ファン',    zh: '风扇',   ru: 'Вентилятор',         zu: 'Ifeni',               sw: 'Feni' },
  terrace:  { en: 'Terrace',     pt: 'Terraço',       nl: 'Terras',            fr: 'Terrasse',             it: 'Terrazza',          de: 'Terrasse',        es: 'Terraza',          af: 'Terras',           sv: 'Terrass',      pl: 'Taras',             ro: 'Terasă',        sr: 'Terasa',            hr: 'Terasa',            cs: 'Terasa',          tr: 'Teras',      ja: 'テラス',  zh: '露台',   ru: 'Терраса',            zu: 'Iterasi',             sw: 'Terasi' },
  shared:   { en: 'Shared Bath', pt: 'WC Partilhado', nl: 'Gedeelde Badkamer', fr: 'Salle de bain partagée', it: 'Bagno condiviso', de: 'Gemeinschaftsbad',es: 'Baño compartido',  af: 'Gedeelde Bad',     sv: 'Delat badrum', pl: 'Wspólna łazienka',  ro: 'Baie comună',   sr: 'Zajedničko kupatilo', hr: 'Zajedničko kupatilo', cs: 'Společná koupelna', tr: 'Ortak Banyo', ja: '共用バス', zh: '共用浴室', ru: 'Общая ванная',    zu: 'Ibhafu elabelwana',   sw: 'Bafu ya pamoja' },
  ensuite:  { en: 'En-suite',    pt: 'WC Privativo',  nl: 'Eigen Badkamer',    fr: 'Salle de bain privée', it: 'Bagno privato',    de: 'Eigenes Bad',     es: 'Baño privado',     af: 'Privaat Bad',      sv: 'Eget badrum',  pl: 'Łazienka prywatna', ro: 'Baie privată',  sr: 'Privatno kupatilo',   hr: 'Privatno kupatilo',   cs: 'Vlastní koupelna', tr: 'Özel Banyo', ja: '専用バス', zh: '独立浴室', ru: 'Собственная ванная', zu: 'Ibhafu langasese',    sw: 'Bafu ya faragha' },
  ac:       { en: 'AC',          pt: 'Ar Condicionado', nl: 'Airco',           fr: 'Climatisation',        it: 'Aria condizionata', de: 'Klimaanlage',     es: 'Aire acondicionado', af: 'Lugversorging',  sv: 'AC',           pl: 'Klimatyzacja',      ro: 'Aer condiționat', sr: 'Klima',          hr: 'Klima',             cs: 'Klimatizace',     tr: 'Klima',      ja: 'エアコン', zh: '空调',   ru: 'Кондиционер',        zu: 'I-AC',                sw: 'Kiyoyozi' },
  queen:    { en: 'Queen Bed',   pt: 'Cama Queen',    nl: 'Queensize Bed',     fr: 'Lit Queen',            it: 'Letto Queen',       de: 'Queen-Bett',      es: 'Cama Queen',       af: 'Queen Bed',        sv: 'Queen-säng',   pl: 'Łóżko Queen',       ro: 'Pat queen',     sr: 'Queen krevet',      hr: 'Queen krevet',      cs: 'Postel Queen',    tr: 'Queen Yatak', ja: 'クイーンベッド', zh: '大床', ru: 'Двуспальная кровать', zu: 'Umbhede weQueen',    sw: 'Kitanda cha Queen' },
  secluded: { en: 'Secluded',    pt: 'Isolado',       nl: 'Afgelegen',         fr: 'Isolé',                it: 'Appartato',         de: 'Abgeschieden',    es: 'Aislado',          af: 'Afgesonderd',      sv: 'Avskilt',      pl: 'Ustronny',          ro: 'Retras',        sr: 'Skrovito',          hr: 'Skrovito',          cs: 'Odlehlé',         tr: 'Tenha',      ja: '隠れ家',   zh: '隐蔽',   ru: 'Уединённый',         zu: 'Okuhlukanisiwe',      sw: 'Faragha' },
};
function getRoomFeatureLabel(feature, lang) {
  const base = lang?.split('-')[0] || 'en';
  return FEATURE_LABELS[feature]?.[lang] || FEATURE_LABELS[feature]?.[base] || FEATURE_LABELS[feature]?.en || feature;
}

// Bed-type toggle labels (Safari Tent, Comfort Tent, Thatched Chalet only).
export const BED_TYPE_LABELS = {
  king:          { en: 'King bed',        pt: 'Cama de casal',          de: 'Doppelbett',            fr: 'Lit double',        es: 'Cama doble',        it: 'Letto matrimoniale',    nl: 'Tweepersoonsbed',        sv: 'Dubbelsäng',    pl: 'Łóżko podwójne',  ro: 'Pat dublu',       sr: 'Bračni krevet',  hr: 'Bračni krevet',  cs: 'Manželská postel', tr: 'Çift kişilik yatak', ja: 'キングベッド', zh: '大床',  ru: 'Двуспальная кровать',  zu: 'Umbhede omkhulu',  sw: 'Kitanda kikubwa',  af: 'Koningsbed'   },
  twin:          { en: 'Twin beds',       pt: 'Camas separadas',        de: 'Zwei Einzelbetten',     fr: 'Lits jumeaux',      es: 'Camas separadas',   it: 'Letti separati',        nl: 'Twee eenpersoonsbedden', sv: 'Enkelsängar',   pl: 'Łóżka oddzielne', ro: 'Paturi separate', sr: 'Odvojena kreveta', hr: 'Odvojena kreveta', cs: 'Oddělené postele', tr: 'İki ayrı yatak',  ja: 'ツインベッド',   zh: '双床', ru: 'Раздельные кровати',   zu: 'Imibhede emibili', sw: 'Vitanda viwili',   af: 'Tweelingsbed' },
  bedPreference: { en: 'Bed preference:', pt: 'Preferência de cama:',   de: 'Betttyp:',              fr: 'Type de lit\u00a0:', es: 'Tipo de cama:',     it: 'Tipo di letto:',        nl: 'Bedvoorkeur:',           sv: 'Sängtyp:',      pl: 'Rodzaj łóżka:',   ro: 'Tip pat:',        sr: 'Tip kreveta:',   hr: 'Vrsta kreveta:', cs: 'Typ postele:',     tr: 'Yatak tercihi:',     ja: 'ベッド:', zh: '床型:', ru: 'Тип кровати:',         zu: 'Ukhetha umbhede:', sw: 'Aina ya kitanda:', af: 'Bedvoorkeur:'  },
};
export function getBedTypeLabel(type, lang) {
  const base = lang?.split('-')[0] || 'en';
  return BED_TYPE_LABELS[type]?.[lang] || BED_TYPE_LABELS[type]?.[base] || BED_TYPE_LABELS[type]?.en || type;
}

// ── Memoized room card ─────────────────────────────────────────────────────
// One available-room card on the /book-direct results step. Extracted from
// BookDirectPage and wrapped in React.memo so a tap on one card (qty +/-,
// rate toggle, occupancy stepper, bed toggle) only re-renders that card —
// every prop below is either a primitive, a per-room slice of state, or a
// useCallback-stable handler from the parent.
function RoomCard({
  room,
  displayName,
  rateChoiceId,        // rateChoice[roomId] — chosen offerId or undefined
  qty,                 // cart[roomId] || 0
  canAddRoom,
  bedChoice,           // bedType[roomId] — 'king' | 'twin' | undefined
  occupancy,           // roomOccupancy[roomId] — array of {adults,children,infants} or undefined
  quotedTotal,         // quote-derived total for this room, or null
  effAdults,
  effChildren,
  effInfants,
  partyAdults,      // raw selector counts (drive capacity labels only)
  partyChildren,
  partyInfants,
  showFx,
  fxRate,              // rate to display currency, or null
  currency,            // display currency (bar currency)
  freeCancellation,
  cancelDays,
  t,
  lang,
  detailQueryString,
  onQty,               // (roomId, qty)
  onRate,              // (roomId, offerId)
  onOcc,               // (roomId, unitIdx, field, val)
  onBedType,           // (roomId, 'king' | 'twin')
}) {
  const fxPrimary = (amount) => approxMoney(amount * fxRate, currency);

  // Default to the refundable (semi-flexible) plan when the guest hasn't
  // chosen a rate yet — never preselect the non-refundable rate.
  const offer =
    room.offers.find((o) => o.offerId === rateChoiceId) ||
    room.offers.find((o) => o.refundable) ||
    room.offers[0];
  const units = offer.unitsAvailable || 0;
  const incDisabled = qty >= units || !canAddRoom;
  // Map the Beds24 room to its marketing unit page + main image
  // by matching the room name against the four unit slugs.
  const unitKey = getUnitKey(room.name);
  const unitImg = unitKey ? IMG.units[unitKey] : null;
  const unitDetailUrl = unitKey ? `/${unitKey}?${detailQueryString}` : null;
  // Per-unit occupancy array: one entry per booked unit, shown when party has children/infants.
  const occArray = (effChildren > 0 || effInfants > 0)
    ? (occupancy ?? Array.from({ length: qty }, () => defaultRoomOccFor(room, effAdults, effChildren)))
    : null;
  // Quote-derived total for this card; falls back to offer.total while no
  // quote exists yet (qty=0 or loading).
  const cardTotal = quotedTotal ?? offer.total;
  const roomMaxA = room.maxAdults > 0 ? room.maxAdults : room.maxPeople;
  // Capacity label. Beds24 reports maxAdults=2 / maxChildren=0 for
  // every unit, so the child slot is driven by unit TYPE, not the
  // Beds24 numbers: the Safari/Comfort tents + Chalet each take
  // 2 adults + 1 child ("Sleeps 2 + 1 child"); the Garden Cottage is
  // a strict 2-adult unit ("Sleeps 2"). The sleepsTotal>2 branch is a
  // fallback for any future larger unit (reframes the last adult slot).
  const sleepsTotal = room.maxAdults || room.maxPeople;
  const childUnit = BED_TOGGLE_UNIT_KEYS.includes(unitKey);
  // Effective total occupancy cap per unit (adults + children combined;
  // infants don't count — they sleep in cribs).
  const effectiveMaxPeople = childUnit ? (room.maxAdults || 2) + 1 : (room.maxAdults || room.maxPeople || 2);
  // When the guest is searching for a single person, the room's
  // full capacity ("Sleeps 2 + 1 child") is misleading — show that
  // it's a single-occupancy ("single use") booking instead.
  const singleGuest = partyAdults + partyChildren === 1;
  let sleepsText;
  if (singleGuest) {
    sleepsText = t.singleUse;
  } else if (childUnit && (partyChildren > 0 || partyInfants > 0)) {
    sleepsText = fmt(t.sleepsAdultsChildren, {
      adults: sleepsTotal,
      children: t.childOccupant,
    });
  } else if (sleepsTotal > 2) {
    sleepsText = fmt(t.sleepsAdultsChildren, {
      adults: sleepsTotal - 1,
      children: t.childOccupant,
    });
  } else {
    sleepsText = fmt(t.sleeps, { count: sleepsTotal });
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6"
      data-testid={`card-room-${room.roomId}`}
      data-unit={unitKey || undefined}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-900" data-testid={`text-room-name-${room.roomId}`}>
            {displayName}
          </h3>
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 mt-0.5">
            <p className="text-lg font-semibold text-slate-700" data-testid={`text-offer-total-${room.roomId}`}>
              {showFx ? fxPrimary(cardTotal) : money(cardTotal, room.currency)}
            </p>
            <p className="text-sm text-slate-500">
              {fmt(perNightFromTemplate(t, room.nights), { nights: room.nights })}
            </p>
            {room.nights > 1 && (
              <p className="text-xs text-slate-500" data-testid={`text-offer-pernight-${room.roomId}`}>
                {showFx
                  ? `${fxPrimary(cardTotal / room.nights)} ${t.avgPerNight}`
                  : `${money(cardTotal / room.nights, room.currency)} ${t.avgPerNight}`}
              </p>
            )}
          </div>
          {room.offers.length === 1 && (
            <p className={`text-xs mt-1 ${offer.refundable ? 'text-emerald-600' : 'text-amber-600'}`}>
              {offer.refundable
                ? (t.rateNoteSemiFlex
                    ? fmt(t.rateNoteSemiFlex, { days: cancelDays })
                    : fmt(t.cancellationPolicy, { days: cancelDays }))
                : (t.rateNoteNonRef || t.depositFullNow || t.nonRefundable)
              }
            </p>
          )}
          {(() => {
            const roomFeatures = UNIT_FEATURES[unitKey] || [];
            return roomFeatures.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {roomFeatures.map((f) => (
                  <span key={f} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                    {getRoomFeatureLabel(f, lang)}
                  </span>
                ))}
              </div>
            ) : null;
          })()}
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-start gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">
              <Users className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {(() => {
                const idx = sleepsText.indexOf(' (');
                return idx >= 0 ? (
                  <span>{sleepsText.slice(0, idx)}<br />{sleepsText.slice(idx + 1)}</span>
                ) : sleepsText;
              })()}
            </span>
            <span
              className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700"
              data-testid={`text-units-${room.roomId}`}
            >
              {fmt(t.unitsLeft, { count: units })}
            </span>
          </div>
          {BED_TOGGLE_UNIT_KEYS.includes(unitKey) && (
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="text-xs text-slate-500 basis-full sm:basis-auto shrink-0">{getBedTypeLabel('bedPreference', lang)}</span>
              <div className="flex gap-1.5">
              {[
                { bt: 'king', label: getBedTypeLabel('king', lang), icon: <BedDouble className="h-4 w-4" /> },
                { bt: 'twin', label: getBedTypeLabel('twin', lang), icon: <span className="flex gap-0.5"><BedSingle className="h-4 w-4" /><BedSingle className="h-4 w-4" /></span> },
              ].map(({ bt, label, icon }) => {
                const active = (bedChoice || 'king') === bt;
                return (
                  <button
                    key={bt}
                    type="button"
                    title={label}
                    onClick={() => onBedType(room.roomId, bt)}
                    className={`w-10 flex items-center justify-center rounded-lg border p-1.5 transition-colors ${
                      active
                        ? 'border-[#9e4b13] bg-[#9e4b13]/10 text-[#9e4b13]'
                        : 'border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {icon}
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </div>

        {unitImg && (
          <a
            href={unitDetailUrl}
            className="shrink-0 self-stretch flex flex-col items-center justify-between gap-1 group w-28 sm:w-48"
            data-testid={`link-room-details-${room.roomId}`}
          >
            <img
              src={unitImg}
              alt={displayName}
              loading="lazy"
              className="w-full flex-1 min-h-0 rounded-lg object-cover border border-slate-200"
            />
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#9e4b13] group-hover:underline">
              {t.details}
              <ExternalLink className="h-3 w-3" />
            </span>
          </a>
        )}
      </div>

      {room.offers.length > 1 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            {t.chooseRate}
          </p>
          <div className="space-y-2" role="radiogroup" aria-label={t.chooseRate}>
            {room.offers.map((o, oIdx) => {
              const checked = o.offerId === offer.offerId;
              const selectByOffset = (delta) => {
                const n = room.offers.length;
                const next = room.offers[(oIdx + delta + n) % n];
                onRate(room.roomId, next.offerId);
              };
              return (
                <div
                  key={o.offerId}
                  className={`rounded-xl border transition-colors ${checked ? 'border-[#9e4b13] bg-[#9e4b13]/5' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    tabIndex={checked ? 0 : -1}
                    onClick={() => onRate(room.roomId, o.offerId)}
                    onKeyDown={(e) => {
                      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        selectByOffset(1);
                      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
                        e.preventDefault();
                        selectByOffset(-1);
                      }
                    }}
                    className="w-full px-3 pt-2.5 text-left"
                    data-testid={`button-rate-${room.roomId}-${o.offerId}`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`h-4 w-4 shrink-0 rounded-full border flex items-center justify-center ${checked ? 'border-[#9e4b13]' : 'border-slate-300'}`}>
                          {checked && <span className="h-2 w-2 rounded-full bg-[#9e4b13]" />}
                        </span>
                        <span className="text-sm font-medium text-slate-800">{t.rate?.[o.type] || o.type}</span>
                      </span>
                      <span className="text-right shrink-0">
                        <span className="block text-sm font-semibold text-slate-900">
                          {showFx ? fxPrimary(o.total) : money(o.total, room.currency)}
                        </span>
                        {room.nights > 1 && (
                          <span className="block text-xs text-slate-500">
                            {showFx
                              ? `${fxPrimary(o.total / room.nights)} ${t.avgPerNight}`
                              : `${money(o.total / room.nights, room.currency)} ${t.avgPerNight}`}
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  {/* Deposit/cancellation summary — full width directly under the
                      price, outside the radio button so the terms link isn't a
                      nested interactive control. */}
                  <p
                    className={`px-3 pb-2.5 mt-1 text-xs pl-9 ${o.refundable ? 'text-emerald-600' : 'text-amber-600'}`}
                    data-testid={`text-rate-note-${room.roomId}-${o.offerId}`}
                  >
                    {o.refundable
                      ? (t.rateNoteSemiFlex
                          ? fmt(t.rateNoteSemiFlex, { days: cancelDays })
                          : fmt(t.cancellationPolicy, { days: cancelDays }))
                      : (t.rateNoteNonRef || t.depositFullNow || t.nonRefundable)
                    }
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="text-sm font-medium text-slate-700">{t.rooms}</span>
        <div className="inline-flex items-center rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => onQty(room.roomId, qty - 1)}
            disabled={qty <= 0}
            aria-label={t.removeRoom}
            className="px-3 py-2 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid={`button-dec-${room.roomId}`}
          >
            <Minus className="h-4 w-4" />
          </button>
          <span
            className="min-w-[2.5rem] text-center font-semibold text-slate-900"
            data-testid={`text-qty-${room.roomId}`}
          >
            {qty}
          </span>
          <button
            type="button"
            onClick={() => onQty(room.roomId, qty + 1)}
            disabled={incDisabled}
            aria-label={t.addRoom}
            className="px-3 py-2 text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed"
            data-testid={`button-inc-${room.roomId}`}
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Scroll-to-selection shortcut — mobile only, shown when this room is added */}
      {qty > 0 && (
        <div className="lg:hidden mt-3 flex justify-end">
          <a
            href="#your-selection"
            className="inline-flex items-center gap-1 text-sm font-medium text-[#9e4b13] hover:underline"
            data-testid={`link-scroll-to-selection-${room.roomId}`}
          >
            <ChevronDown className="h-4 w-4" />
            {t.yourSelection}
          </a>
        </div>
      )}

      {/* Per-unit occupancy — only shown when party includes children/infants */}
      {occArray && qty > 0 && (
        <div className="mt-3 border-t border-slate-100 pt-3 space-y-3">
          {occArray.slice(0, qty).map((occ, unitIdx) => (
            <div key={unitIdx}>
              {unitIdx > 0 && <hr className="border-slate-100 mb-3" />}
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                {t.unit} {unitIdx + 1}
              </p>
              <div className="space-y-2">
              {[
                {
                  field: 'adults',
                  label: t.adults,
                  val: occ.adults,
                  min: 0,
                  max: Math.min(roomMaxA, effectiveMaxPeople - occ.children - (occ.infants ?? 0)),
                },
                {
                  field: 'children',
                  label: t.children,
                  val: occ.children,
                  min: 0,
                  max: Math.min(effectiveMaxPeople, effectiveMaxPeople - occ.adults - (occ.infants ?? 0)),
                },
                ...(effInfants > 0 ? [{
                  field: 'infants',
                  label: t.infants,
                  val: occ.infants ?? 0,
                  min: 0,
                  max: Math.min(effInfants, effectiveMaxPeople - occ.adults - occ.children),
                }] : []),
              ].map(({ field, label, val, min, max }) => (
                <div key={field} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{label}</span>
                  <div className="inline-flex items-center rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => onOcc(room.roomId, unitIdx, field, val - 1)}
                      disabled={val <= min}
                      aria-label={`Decrease ${field}`}
                      className="px-2.5 py-1.5 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`button-occ-dec-${room.roomId}-${unitIdx}-${field}`}
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span
                      className="min-w-[2rem] text-center text-sm font-semibold text-slate-800"
                      data-testid={`text-occ-${room.roomId}-${unitIdx}-${field}`}
                    >
                      {val}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOcc(room.roomId, unitIdx, field, val + 1)}
                      disabled={val >= max}
                      aria-label={`Increase ${field}`}
                      className="px-2.5 py-1.5 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                      data-testid={`button-occ-inc-${room.roomId}-${unitIdx}-${field}`}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(RoomCard);
