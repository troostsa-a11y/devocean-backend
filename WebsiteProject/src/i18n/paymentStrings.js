// Payment wording is separate from display-only FX estimates and base pricing.
const STRINGS = {
  en: {
    checkoutCurrency: 'Stripe charges {currency}. The final amount is shown before you pay.',
    paymentEstimate: 'Estimated card payment: {amount}.',
    balanceCurrency: 'Any remaining balance is due on arrival and can be paid by card or cash (MZN, ZAR or USD).',
    displayEstimate: 'Prices shown in {currency} are approximate conversions.',
  },
  'pt-PT': {
    checkoutCurrency: 'A Stripe cobra em {currency}. O valor final é apresentado antes de pagar.',
    paymentEstimate: 'Pagamento estimado por cartão: {amount}.',
    balanceCurrency: 'Qualquer saldo restante é devido à chegada e pode ser pago com cartão ou em dinheiro (MZN, ZAR ou USD).',
    displayEstimate: 'Os preços apresentados em {currency} são conversões aproximadas.',
  },
  pt: {
    checkoutCurrency: 'A Stripe cobra em {currency}. O valor final é mostrado antes de pagar.',
    paymentEstimate: 'Pagamento estimado com cartão: {amount}.',
    balanceCurrency: 'Qualquer saldo restante deve ser pago na chegada, com cartão ou em dinheiro (MZN, ZAR ou USD).',
    displayEstimate: 'Os preços mostrados em {currency} são conversões aproximadas.',
  },
  de: {
    checkoutCurrency: 'Stripe belastet in {currency}. Der endgültige Betrag wird vor der Zahlung angezeigt.',
    paymentEstimate: 'Voraussichtliche Kartenzahlung: {amount}.',
    balanceCurrency: 'Ein verbleibender Restbetrag ist bei Ankunft fällig und kann per Karte oder bar bezahlt werden (MZN, ZAR oder USD).',
    displayEstimate: 'Die angezeigten Preise in {currency} sind ungefähre Umrechnungen.',
  },
  nl: {
    checkoutCurrency: 'Stripe rekent af in {currency}. Het definitieve bedrag wordt vóór betaling getoond.',
    paymentEstimate: 'Geschatte kaartbetaling: {amount}.',
    balanceCurrency: 'Een eventueel restbedrag is bij aankomst verschuldigd en kan met een kaart of contant worden betaald (MZN, ZAR of USD).',
    displayEstimate: 'De getoonde prijzen in {currency} zijn geschatte omrekeningen.',
  },
  fr: {
    checkoutCurrency: 'Stripe débite en {currency}. Le montant final est affiché avant le paiement.',
    paymentEstimate: 'Paiement par carte estimé : {amount}.',
    balanceCurrency: 'Tout solde restant est dû à l’arrivée et peut être réglé par carte ou en espèces (MZN, ZAR ou USD).',
    displayEstimate: 'Les prix affichés en {currency} sont des conversions approximatives.',
  },
  it: {
    checkoutCurrency: 'Stripe addebita in {currency}. L’importo finale viene mostrato prima del pagamento.',
    paymentEstimate: 'Pagamento con carta stimato: {amount}.',
    balanceCurrency: 'L’eventuale saldo restante è dovuto all’arrivo e può essere pagato con carta o in contanti (MZN, ZAR o USD).',
    displayEstimate: 'I prezzi mostrati in {currency} sono conversioni approssimative.',
  },
  es: {
    checkoutCurrency: 'Stripe cobra en {currency}. El importe final se muestra antes de pagar.',
    paymentEstimate: 'Pago estimado con tarjeta: {amount}.',
    balanceCurrency: 'Cualquier saldo restante se debe pagar a la llegada y puede abonarse con tarjeta o en efectivo (MZN, ZAR o USD).',
    displayEstimate: 'Los precios mostrados en {currency} son conversiones aproximadas.',
  },
  sv: {
    checkoutCurrency: 'Stripe debiterar i {currency}. Det slutliga beloppet visas före betalning.',
    paymentEstimate: 'Uppskattad kortbetalning: {amount}.',
    balanceCurrency: 'Eventuellt återstående belopp ska betalas vid ankomst och kan betalas med kort eller kontanter (MZN, ZAR eller USD).',
    displayEstimate: 'Priserna som visas i {currency} är ungefärliga omräkningar.',
  },
  pl: {
    checkoutCurrency: 'Stripe pobiera płatność w {currency}. Ostateczna kwota jest widoczna przed zapłatą.',
    paymentEstimate: 'Szacowana płatność kartą: {amount}.',
    balanceCurrency: 'Pozostała kwota jest płatna po przyjeździe i można ją uregulować kartą lub gotówką (MZN, ZAR lub USD).',
    displayEstimate: 'Ceny wyświetlane w {currency} są przybliżonymi przeliczeniami.',
  },
  ro: {
    checkoutCurrency: 'Stripe încasează în {currency}. Suma finală este afișată înainte de plată.',
    paymentEstimate: 'Plată estimată cu cardul: {amount}.',
    balanceCurrency: 'Orice sold rămas se achită la sosire, cu cardul sau în numerar (MZN, ZAR sau USD).',
    displayEstimate: 'Prețurile afișate în {currency} sunt conversii aproximative.',
  },
  sr: {
    checkoutCurrency: 'Stripe naplaćuje u {currency}. Konačan iznos se prikazuje pre plaćanja.',
    paymentEstimate: 'Procenjena uplata karticom: {amount}.',
    balanceCurrency: 'Preostali iznos dospeva za plaćanje po dolasku i može se platiti karticom ili gotovinom (MZN, ZAR ili USD).',
    displayEstimate: 'Cene prikazane u {currency} su približne konverzije.',
  },
  hr: {
    checkoutCurrency: 'Stripe naplaćuje u {currency}. Konačan iznos prikazuje se prije plaćanja.',
    paymentEstimate: 'Procijenjeno plaćanje karticom: {amount}.',
    balanceCurrency: 'Preostali iznos plaća se pri dolasku, karticom ili gotovinom (MZN, ZAR ili USD).',
    displayEstimate: 'Cijene prikazane u {currency} približne su konverzije.',
  },
  cs: {
    checkoutCurrency: 'Stripe účtuje v {currency}. Konečná částka se zobrazí před platbou.',
    paymentEstimate: 'Odhadovaná platba kartou: {amount}.',
    balanceCurrency: 'Případný zbývající doplatek je splatný při příjezdu a lze jej uhradit kartou nebo v hotovosti (MZN, ZAR nebo USD).',
    displayEstimate: 'Ceny zobrazené v {currency} jsou přibližné přepočty.',
  },
  tr: {
    checkoutCurrency: 'Stripe {currency} cinsinden tahsil eder. Son tutar ödeme öncesinde gösterilir.',
    paymentEstimate: 'Tahmini kart ödemesi: {amount}.',
    balanceCurrency: 'Kalan bakiye varışta ödenmelidir; kartla veya nakit olarak ödenebilir (MZN, ZAR veya USD).',
    displayEstimate: '{currency} cinsinden gösterilen fiyatlar yaklaşık dönüşümlerdir.',
  },
  ja: {
    checkoutCurrency: 'Stripeでの請求通貨は{currency}です。お支払い前に最終金額が表示されます。',
    paymentEstimate: 'カード支払いの目安：{amount}。',
    balanceCurrency: '残額がある場合は到着時にお支払いください。カードまたは現金（MZN、ZAR、USD）でお支払いいただけます。',
    displayEstimate: '{currency}で表示される価格は概算の換算額です。',
  },
  zh: {
    checkoutCurrency: 'Stripe以{currency}收款，最终金额会在付款前显示。',
    paymentEstimate: '银行卡付款估算金额：{amount}。',
    balanceCurrency: '如有余额，需在抵达时支付，可使用银行卡或现金（MZN、ZAR或USD）。',
    displayEstimate: '以{currency}显示的价格为近似换算金额。',
  },
  ru: {
    checkoutCurrency: 'Stripe списывает оплату в {currency}. Итоговая сумма показана до оплаты.',
    paymentEstimate: 'Ориентировочная оплата картой: {amount}.',
    balanceCurrency: 'Оставшуюся сумму необходимо оплатить по прибытии картой или наличными (MZN, ZAR или USD).',
    displayEstimate: 'Цены в {currency} являются приблизительным пересчётом.',
  },
  af: {
    checkoutCurrency: 'Stripe hef in {currency}. Die finale bedrag word voor betaling gewys.',
    paymentEstimate: 'Geskatte kaartbetaling: {amount}.',
    balanceCurrency: 'Enige uitstaande saldo is by aankoms betaalbaar en kan per kaart of kontant betaal word (MZN, ZAR of USD).',
    displayEstimate: 'Pryse in {currency} is benaderde omskakelings.',
  },
  zu: {
    checkoutCurrency: 'I-Stripe ikhokhisa nge-{currency}. Inani lokugcina liyaboniswa ngaphambi kokukhokha.',
    paymentEstimate: 'Inkokhelo yekhadi elinganiselwe: {amount}.',
    balanceCurrency: 'Noma iyiphi imali esele ikhokhwa lapho ufika futhi ingakhokhwa ngekhadi noma ngemali engukheshi (MZN, ZAR noma USD).',
    displayEstimate: 'Amanani aboniswe nge-{currency} ayizilinganiso zokushintsha imali.',
  },
  sw: {
    checkoutCurrency: 'Stripe hutoza kwa {currency}. Kiasi cha mwisho huonyeshwa kabla ya kulipa.',
    paymentEstimate: 'Makadirio ya malipo kwa kadi: {amount}.',
    balanceCurrency: 'Salio lolote lililobaki linapaswa kulipwa unapofika na linaweza kulipwa kwa kadi au pesa taslimu (MZN, ZAR au USD).',
    displayEstimate: 'Bei zinazoonyeshwa kwa {currency} ni makadirio ya ubadilishaji.',
  },
};

const STATUS_STRINGS = {
  en: ['Payment awaiting review', 'Please do not pay again. Contact reception to verify the payment; your booking is not yet confirmed.', 'The payment exchange rate is temporarily unavailable. Please retry or select USD.'],
  pt: ['Pagamento em análise', 'Não pague novamente. Contacte a receção para verificar o pagamento; a sua reserva ainda não está confirmada.', 'A taxa de câmbio para pagamento está temporariamente indisponível. Tente novamente ou selecione USD.'],
  de: ['Zahlung wird geprüft', 'Bitte zahlen Sie nicht erneut. Kontaktieren Sie die Rezeption zur Prüfung der Zahlung; Ihre Buchung ist noch nicht bestätigt.', 'Der Wechselkurs für die Zahlung ist vorübergehend nicht verfügbar. Bitte versuchen Sie es erneut oder wählen Sie USD.'],
  nl: ['Betaling wordt gecontroleerd', 'Betaal niet opnieuw. Neem contact op met de receptie om de betaling te controleren; uw boeking is nog niet bevestigd.', 'De wisselkoers voor de betaling is tijdelijk niet beschikbaar. Probeer opnieuw of kies USD.'],
  fr: ['Paiement en cours de vérification', 'Ne payez pas à nouveau. Contactez la réception pour vérifier le paiement ; votre réservation n’est pas encore confirmée.', 'Le taux de change du paiement est temporairement indisponible. Réessayez ou sélectionnez USD.'],
  it: ['Pagamento in verifica', 'Non pagare di nuovo. Contatta la reception per verificare il pagamento; la prenotazione non è ancora confermata.', 'Il tasso di cambio per il pagamento non è temporaneamente disponibile. Riprova o seleziona USD.'],
  es: ['Pago pendiente de revisión', 'No pague de nuevo. Contacte con recepción para verificar el pago; su reserva aún no está confirmada.', 'El tipo de cambio para el pago no está disponible temporalmente. Inténtelo de nuevo o seleccione USD.'],
  sv: ['Betalningen behöver kontrolleras', 'Betala inte igen. Kontakta receptionen för att kontrollera betalningen; din bokning är ännu inte bekräftad.', 'Växelkursen för betalningen är tillfälligt otillgänglig. Försök igen eller välj USD.'],
  pl: ['Płatność oczekuje na weryfikację', 'Nie płać ponownie. Skontaktuj się z recepcją, aby sprawdzić płatność; rezerwacja nie jest jeszcze potwierdzona.', 'Kurs walutowy dla płatności jest chwilowo niedostępny. Spróbuj ponownie lub wybierz USD.'],
  ro: ['Plată în curs de verificare', 'Nu plătiți din nou. Contactați recepția pentru a verifica plata; rezervarea nu este încă confirmată.', 'Cursul valutar pentru plată este temporar indisponibil. Încercați din nou sau selectați USD.'],
  sr: ['Uplata čeka proveru', 'Nemojte ponovo plaćati. Kontaktirajte recepciju radi provere uplate; rezervacija još nije potvrđena.', 'Kurs za plaćanje trenutno nije dostupan. Pokušajte ponovo ili izaberite USD.'],
  hr: ['Plaćanje čeka provjeru', 'Nemojte ponovno plaćati. Obratite se recepciji radi provjere plaćanja; rezervacija još nije potvrđena.', 'Tečaj za plaćanje trenutačno nije dostupan. Pokušajte ponovno ili odaberite USD.'],
  cs: ['Platba čeká na ověření', 'Neplaťte znovu. Kontaktujte recepci pro ověření platby; vaše rezervace ještě není potvrzena.', 'Směnný kurz pro platbu je dočasně nedostupný. Zkuste to znovu nebo zvolte USD.'],
  tr: ['Ödeme inceleme bekliyor', 'Lütfen tekrar ödeme yapmayın. Ödemeyi doğrulamak için resepsiyonla iletişime geçin; rezervasyonunuz henüz onaylanmadı.', 'Ödeme döviz kuru geçici olarak kullanılamıyor. Tekrar deneyin veya USD seçin.'],
  ja: ['お支払いの確認が必要です', '再度お支払いしないでください。お支払いの確認について受付にお問い合わせください。予約はまだ確定していません。', 'お支払い用の為替レートを一時的に取得できません。もう一度お試しいただくか、USDを選択してください。'],
  zh: ['付款等待核实', '请勿再次付款。请联系前台核实付款；您的预订尚未确认。', '暂时无法获取付款汇率。请重试或选择USD。'],
  ru: ['Платёж ожидает проверки', 'Не платите повторно. Свяжитесь с ресепшеном для проверки платежа; бронирование ещё не подтверждено.', 'Курс валюты для оплаты временно недоступен. Повторите попытку или выберите USD.'],
  af: ['Betaling wag op nagaan', 'Moet asseblief nie weer betaal nie. Kontak ontvangs om die betaling na te gaan; u bespreking is nog nie bevestig nie.', 'Die wisselkoers vir betaling is tydelik nie beskikbaar nie. Probeer weer of kies USD.'],
  zu: ['Inkokhelo ilinde ukuhlolwa', 'Sicela ungakhokhi futhi. Xhumana nendawo yokwamukela izivakashi ukuze ihlole inkokhelo; ukubhukha kwakho akukaqinisekiswa.', 'Izinga lokushintsha imali lenkokhelo alitholakali okwamanje. Zama futhi noma ukhethe i-USD.'],
  sw: ['Malipo yanasubiri uhakiki', 'Tafadhali usilipe tena. Wasiliana na mapokezi ili kuhakiki malipo; nafasi yako bado haijathibitishwa.', 'Kiwango cha ubadilishaji kwa malipo hakipatikani kwa sasa. Jaribu tena au chagua USD.'],
};

export function getPaymentStrings(lang = 'en-GB') {
  const base = String(lang).toLowerCase().split('-')[0];
  const strings = STRINGS[lang] || STRINGS[base] || STRINGS.en;
  const [reviewTitle, reviewMsg, fxUnavailable] = STATUS_STRINGS[base] || STATUS_STRINGS.en;
  return { ...strings, reviewTitle, reviewMsg, fxUnavailable };
}
