import { useState, useEffect } from 'react';
import { Loader2, Gift, CheckCircle2, ArrowLeft } from 'lucide-react';

const DENOMINATIONS = [20, 50, 100, 200, 500];

const GIFT_STRINGS = {
  en: {
    back: 'Back to booking',
    heading: 'Give the gift of DEVOCEAN',
    subtitle: 'Treat someone special to a stay at DEVOCEAN Lodge in Ponta do Ouro, Mozambique. A gift voucher they can redeem when booking direct.',
    voucherValue: 'Voucher value (USD)',
    yourName: 'Your name',
    yourNamePlaceholder: 'Your name',
    yourEmail: 'Your email',
    voucherSentHere: 'voucher sent here',
    recipientName: "Recipient's name",
    optional: 'optional',
    personalMessage: 'Personal message',
    messagePlaceholder: 'Enjoy a well-deserved escape to the coast…',
    giftTotal: 'Gift voucher total',
    deliveryNote: 'Delivered by email after payment. One-time use.',
    pay: 'Pay ${amount}.00 — Send voucher',
    stripeNote: 'Secure payment via Stripe. The voucher code is emailed to the recipient immediately after payment.',
    errName: 'Enter your name.',
    errEmail: 'Enter a valid email address for delivery of the voucher.',
    errCheckout: 'Could not start checkout. Please try again.',
    errUnexpected: 'Unexpected response. Please try again.',
    errNetwork: 'Network error. Please check your connection and try again.',
    steps: [
      { title: 'You pay', body: 'Choose a value and pay securely via Stripe.' },
      { title: 'We email the code', body: 'The recipient gets a unique voucher code by email.' },
      { title: 'They redeem it', body: 'Enter the code at checkout on the Book Direct page.' },
    ],
  },
  pt: {
    back: 'Voltar às reservas',
    heading: 'Ofereça o presente DEVOCEAN',
    subtitle: 'Ofereça a alguém especial uma estadia no DEVOCEAN Lodge em Ponta do Ouro, Moçambique. Um voucher de oferta que pode resgatar ao reservar diretamente.',
    voucherValue: 'Valor do voucher (USD)',
    yourName: 'O seu nome',
    yourNamePlaceholder: 'O seu nome',
    yourEmail: 'O seu email',
    voucherSentHere: 'voucher enviado aqui',
    recipientName: 'Nome do destinatário',
    optional: 'opcional',
    personalMessage: 'Mensagem pessoal',
    messagePlaceholder: 'Desfrute de uma escapada à costa que merece…',
    giftTotal: 'Total do voucher de oferta',
    deliveryNote: 'Entregue por email após o pagamento. Uso único.',
    pay: 'Pagar ${amount}.00 — Enviar voucher',
    stripeNote: 'Pagamento seguro via Stripe. O código do voucher é enviado por email ao destinatário imediatamente após o pagamento.',
    errName: 'Introduza o seu nome.',
    errEmail: 'Introduza um endereço de email válido para entrega do voucher.',
    errCheckout: 'Não foi possível iniciar o pagamento. Tente novamente.',
    errUnexpected: 'Resposta inesperada. Tente novamente.',
    errNetwork: 'Erro de rede. Verifique a sua ligação e tente novamente.',
    steps: [
      { title: 'Paga', body: 'Escolha um valor e pague em segurança via Stripe.' },
      { title: 'Enviamos o código', body: 'O destinatário recebe um código de voucher único por email.' },
      { title: 'Resgata', body: 'Introduza o código no checkout da página de Reserva Direta.' },
    ],
  },
  de: {
    back: 'Zurück zur Buchung',
    heading: 'Schenken Sie das DEVOCEAN-Erlebnis',
    subtitle: 'Beschenken Sie jemanden Besonderen mit einem Aufenthalt im DEVOCEAN Lodge in Ponta do Ouro, Mosambik. Ein Geschenkgutschein, der bei der Direktbuchung eingelöst werden kann.',
    voucherValue: 'Gutscheinwert (USD)',
    yourName: 'Ihr Name',
    yourNamePlaceholder: 'Ihr Name',
    yourEmail: 'Ihre E-Mail',
    voucherSentHere: 'Gutschein wird hierher geschickt',
    recipientName: 'Name des Empfängers',
    optional: 'optional',
    personalMessage: 'Persönliche Nachricht',
    messagePlaceholder: 'Genießen Sie eine wohlverdiente Auszeit an der Küste…',
    giftTotal: 'Gesamtbetrag des Geschenkgutscheins',
    deliveryNote: 'Nach der Zahlung per E-Mail zugestellt. Einmalige Verwendung.',
    pay: '${amount}.00 bezahlen — Gutschein senden',
    stripeNote: 'Sichere Zahlung über Stripe. Der Gutscheincode wird dem Empfänger sofort nach der Zahlung per E-Mail zugesandt.',
    errName: 'Bitte geben Sie Ihren Namen ein.',
    errEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse für die Zustellung des Gutscheins ein.',
    errCheckout: 'Checkout konnte nicht gestartet werden. Bitte versuchen Sie es erneut.',
    errUnexpected: 'Unerwartete Antwort. Bitte versuchen Sie es erneut.',
    errNetwork: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    steps: [
      { title: 'Sie bezahlen', body: 'Wählen Sie einen Betrag und bezahlen Sie sicher über Stripe.' },
      { title: 'Wir senden den Code', body: 'Der Empfänger erhält per E-Mail einen einzigartigen Gutscheincode.' },
      { title: 'Einlösen', body: 'Geben Sie den Code beim Checkout auf der Direktbuchungsseite ein.' },
    ],
  },
  fr: {
    back: 'Retour à la réservation',
    heading: 'Offrez le cadeau DEVOCEAN',
    subtitle: 'Offrez à quelqu\'un de spécial un séjour au DEVOCEAN Lodge à Ponta do Ouro, au Mozambique. Un bon cadeau qu\'il pourra utiliser lors d\'une réservation directe.',
    voucherValue: 'Valeur du bon (USD)',
    yourName: 'Votre nom',
    yourNamePlaceholder: 'Votre nom',
    yourEmail: 'Votre email',
    voucherSentHere: 'bon envoyé ici',
    recipientName: 'Nom du destinataire',
    optional: 'optionnel',
    personalMessage: 'Message personnel',
    messagePlaceholder: 'Profitez d\'une escapade bien méritée au bord de la mer…',
    giftTotal: 'Total du bon cadeau',
    deliveryNote: 'Livré par email après le paiement. Utilisation unique.',
    pay: 'Payer ${amount}.00 — Envoyer le bon',
    stripeNote: 'Paiement sécurisé via Stripe. Le code du bon est envoyé par email au destinataire immédiatement après le paiement.',
    errName: 'Veuillez entrer votre nom.',
    errEmail: 'Veuillez entrer une adresse email valide pour la livraison du bon.',
    errCheckout: 'Impossible de démarrer le paiement. Veuillez réessayer.',
    errUnexpected: 'Réponse inattendue. Veuillez réessayer.',
    errNetwork: 'Erreur réseau. Veuillez vérifier votre connexion et réessayer.',
    steps: [
      { title: 'Vous payez', body: 'Choisissez un montant et payez en toute sécurité via Stripe.' },
      { title: 'Nous envoyons le code', body: 'Le destinataire reçoit un code de bon unique par email.' },
      { title: 'Il l\'utilise', body: 'Saisissez le code lors du paiement sur la page de réservation directe.' },
    ],
  },
  es: {
    back: 'Volver a la reserva',
    heading: 'Regala la experiencia DEVOCEAN',
    subtitle: 'Regala a alguien especial una estancia en DEVOCEAN Lodge en Ponta do Ouro, Mozambique. Un bono regalo que puede canjear al reservar directamente.',
    voucherValue: 'Valor del bono (USD)',
    yourName: 'Tu nombre',
    yourNamePlaceholder: 'Tu nombre',
    yourEmail: 'Tu email',
    voucherSentHere: 'bono enviado aquí',
    recipientName: 'Nombre del destinatario',
    optional: 'opcional',
    personalMessage: 'Mensaje personal',
    messagePlaceholder: 'Disfruta de una escapada bien merecida a la costa…',
    giftTotal: 'Total del bono regalo',
    deliveryNote: 'Entregado por email tras el pago. De un solo uso.',
    pay: 'Pagar ${amount}.00 — Enviar bono',
    stripeNote: 'Pago seguro a través de Stripe. El código del bono se envía por email al destinatario inmediatamente después del pago.',
    errName: 'Introduce tu nombre.',
    errEmail: 'Introduce una dirección de email válida para recibir el bono.',
    errCheckout: 'No se pudo iniciar el pago. Por favor, inténtalo de nuevo.',
    errUnexpected: 'Respuesta inesperada. Por favor, inténtalo de nuevo.',
    errNetwork: 'Error de red. Por favor, comprueba tu conexión e inténtalo de nuevo.',
    steps: [
      { title: 'Pagas', body: 'Elige un importe y paga de forma segura a través de Stripe.' },
      { title: 'Enviamos el código', body: 'El destinatario recibe un código de bono único por email.' },
      { title: 'Lo canjea', body: 'Introduce el código en el pago de la página de reserva directa.' },
    ],
  },
  it: {
    back: 'Torna alla prenotazione',
    heading: 'Regala l\'esperienza DEVOCEAN',
    subtitle: 'Fai un regalo speciale con un soggiorno al DEVOCEAN Lodge a Ponta do Ouro, in Mozambico. Un buono regalo da riscattare prenotando direttamente.',
    voucherValue: 'Valore del buono (USD)',
    yourName: 'Il tuo nome',
    yourNamePlaceholder: 'Il tuo nome',
    yourEmail: 'La tua email',
    voucherSentHere: 'buono inviato qui',
    recipientName: 'Nome del destinatario',
    optional: 'facoltativo',
    personalMessage: 'Messaggio personale',
    messagePlaceholder: 'Goditi una meritata fuga sulla costa…',
    giftTotal: 'Totale buono regalo',
    deliveryNote: 'Consegnato via email dopo il pagamento. Monouso.',
    pay: 'Paga ${amount}.00 — Invia buono',
    stripeNote: 'Pagamento sicuro tramite Stripe. Il codice del buono viene inviato via email al destinatario immediatamente dopo il pagamento.',
    errName: 'Inserisci il tuo nome.',
    errEmail: 'Inserisci un indirizzo email valido per la consegna del buono.',
    errCheckout: 'Impossibile avviare il pagamento. Riprova.',
    errUnexpected: 'Risposta inattesa. Riprova.',
    errNetwork: 'Errore di rete. Controlla la connessione e riprova.',
    steps: [
      { title: 'Paghi', body: 'Scegli un importo e paga in modo sicuro tramite Stripe.' },
      { title: 'Inviamo il codice', body: 'Il destinatario riceve un codice buono univoco via email.' },
      { title: 'Lo riscatta', body: 'Inserisci il codice al pagamento sulla pagina di prenotazione diretta.' },
    ],
  },
  nl: {
    back: 'Terug naar boeking',
    heading: 'Geef het cadeau van DEVOCEAN',
    subtitle: 'Trakteer iemand bijzonders op een verblijf in DEVOCEAN Lodge in Ponta do Ouro, Mozambique. Een cadeaubon die bij een directe boeking kan worden ingewisseld.',
    voucherValue: 'Waarde van de bon (USD)',
    yourName: 'Uw naam',
    yourNamePlaceholder: 'Uw naam',
    yourEmail: 'Uw e-mail',
    voucherSentHere: 'bon wordt hier naartoe gestuurd',
    recipientName: 'Naam ontvanger',
    optional: 'optioneel',
    personalMessage: 'Persoonlijk bericht',
    messagePlaceholder: 'Geniet van een welverdiende ontsnapping aan de kust…',
    giftTotal: 'Totaal cadeaubon',
    deliveryNote: 'Na betaling per e-mail bezorgd. Eenmalig gebruik.',
    pay: '${amount}.00 betalen — Bon versturen',
    stripeNote: 'Veilige betaling via Stripe. De boncode wordt direct na betaling per e-mail naar de ontvanger gestuurd.',
    errName: 'Voer uw naam in.',
    errEmail: 'Voer een geldig e-mailadres in voor de bezorging van de bon.',
    errCheckout: 'Kon het betaalproces niet starten. Probeer het opnieuw.',
    errUnexpected: 'Onverwacht antwoord. Probeer het opnieuw.',
    errNetwork: 'Netwerkfout. Controleer uw verbinding en probeer het opnieuw.',
    steps: [
      { title: 'U betaalt', body: 'Kies een bedrag en betaal veilig via Stripe.' },
      { title: 'Wij sturen de code', body: 'De ontvanger krijgt een unieke boncode per e-mail.' },
      { title: 'Inwisselen', body: 'Voer de code in bij het afrekenen op de pagina Directe boeking.' },
    ],
  },
  sv: {
    back: 'Tillbaka till bokning',
    heading: 'Ge gåvan av DEVOCEAN',
    subtitle: 'Ge någon speciell en vistelse på DEVOCEAN Lodge i Ponta do Ouro, Moçambique. Ett presentkort de kan lösa in vid direktbokning.',
    voucherValue: 'Presentkortsvärde (USD)',
    yourName: 'Ditt namn',
    yourNamePlaceholder: 'Ditt namn',
    yourEmail: 'Din e-post',
    voucherSentHere: 'presentkort skickas hit',
    recipientName: 'Mottagarens namn',
    optional: 'valfritt',
    personalMessage: 'Personligt meddelande',
    messagePlaceholder: 'Njut av en välförtjänt flykt till kusten…',
    giftTotal: 'Totalt presentkort',
    deliveryNote: 'Levereras via e-post efter betalning. Engångsanvändning.',
    pay: 'Betala ${amount}.00 — Skicka presentkort',
    stripeNote: 'Säker betalning via Stripe. Presentkortskoden skickas till mottagaren via e-post direkt efter betalning.',
    errName: 'Ange ditt namn.',
    errEmail: 'Ange en giltig e-postadress för leverans av presentkortet.',
    errCheckout: 'Kunde inte starta betalning. Försök igen.',
    errUnexpected: 'Oväntat svar. Försök igen.',
    errNetwork: 'Nätverksfel. Kontrollera din anslutning och försök igen.',
    steps: [
      { title: 'Du betalar', body: 'Välj ett belopp och betala säkert via Stripe.' },
      { title: 'Vi skickar koden', body: 'Mottagaren får en unik presentkortskod via e-post.' },
      { title: 'De löser in den', body: 'Ange koden i kassan på sidan för direktbokning.' },
    ],
  },
  pl: {
    back: 'Powrót do rezerwacji',
    heading: 'Podaruj DEVOCEAN w prezencie',
    subtitle: 'Zafunduj komuś wyjątkowemu pobyt w DEVOCEAN Lodge w Ponta do Ouro w Mozambiku. Bon prezentowy do realizacji przy rezerwacji bezpośredniej.',
    voucherValue: 'Wartość bonu (USD)',
    yourName: 'Twoje imię i nazwisko',
    yourNamePlaceholder: 'Twoje imię i nazwisko',
    yourEmail: 'Twój email',
    voucherSentHere: 'bon zostanie tu wysłany',
    recipientName: 'Imię i nazwisko odbiorcy',
    optional: 'opcjonalnie',
    personalMessage: 'Osobista wiadomość',
    messagePlaceholder: 'Ciesz się zasłużoną ucieczką na wybrzeże…',
    giftTotal: 'Łączna wartość bonu prezentowego',
    deliveryNote: 'Dostarczony emailem po płatności. Jednorazowego użytku.',
    pay: 'Zapłać ${amount}.00 — Wyślij bon',
    stripeNote: 'Bezpieczna płatność przez Stripe. Kod bonu jest wysyłany emailem do odbiorcy natychmiast po płatności.',
    errName: 'Podaj swoje imię i nazwisko.',
    errEmail: 'Podaj prawidłowy adres email do dostarczenia bonu.',
    errCheckout: 'Nie można uruchomić płatności. Spróbuj ponownie.',
    errUnexpected: 'Nieoczekiwana odpowiedź. Spróbuj ponownie.',
    errNetwork: 'Błąd sieci. Sprawdź połączenie i spróbuj ponownie.',
    steps: [
      { title: 'Płacisz', body: 'Wybierz wartość i zapłać bezpiecznie przez Stripe.' },
      { title: 'Wysyłamy kod', body: 'Odbiorca otrzymuje unikalny kod bonu emailem.' },
      { title: 'Realizacja', body: 'Wpisz kod przy kasie na stronie rezerwacji bezpośredniej.' },
    ],
  },
  ro: {
    back: 'Înapoi la rezervare',
    heading: 'Oferă cadoul DEVOCEAN',
    subtitle: 'Oferă cuiva special un sejur la DEVOCEAN Lodge în Ponta do Ouro, Mozambic. Un voucher cadou pe care îl poate folosi la rezervarea directă.',
    voucherValue: 'Valoarea voucherului (USD)',
    yourName: 'Numele tău',
    yourNamePlaceholder: 'Numele tău',
    yourEmail: 'Email-ul tău',
    voucherSentHere: 'voucher trimis aici',
    recipientName: 'Numele destinatarului',
    optional: 'opțional',
    personalMessage: 'Mesaj personal',
    messagePlaceholder: 'Bucură-te de o evadare binemeritată la coastă…',
    giftTotal: 'Total voucher cadou',
    deliveryNote: 'Livrat prin email după plată. O singură utilizare.',
    pay: 'Plătește ${amount}.00 — Trimite voucher',
    stripeNote: 'Plată securizată prin Stripe. Codul voucherului este trimis prin email destinatarului imediat după plată.',
    errName: 'Introduceți numele dumneavoastră.',
    errEmail: 'Introduceți o adresă de email validă pentru livrarea voucherului.',
    errCheckout: 'Nu s-a putut iniția plata. Vă rugăm să încercați din nou.',
    errUnexpected: 'Răspuns neașteptat. Vă rugăm să încercați din nou.',
    errNetwork: 'Eroare de rețea. Verificați conexiunea și încercați din nou.',
    steps: [
      { title: 'Plătești', body: 'Alege o valoare și plătește în siguranță prin Stripe.' },
      { title: 'Trimitem codul', body: 'Destinatarul primește un cod unic de voucher prin email.' },
      { title: 'Îl folosește', body: 'Introduceți codul la checkout pe pagina de rezervare directă.' },
    ],
  },
  sr: {
    back: 'Nazad na rezervaciju',
    heading: 'Poklonite DEVOCEAN iskustvo',
    subtitle: 'Poklonite nekome posebnom boravak u DEVOCEAN Lodge u Ponta do Ouro, Mozambik. Poklon vaučer koji mogu iskoristiti pri direktnoj rezervaciji.',
    voucherValue: 'Vrednost vaučera (USD)',
    yourName: 'Vaše ime',
    yourNamePlaceholder: 'Vaše ime',
    yourEmail: 'Vaš email',
    voucherSentHere: 'vaučer se šalje ovde',
    recipientName: 'Ime primaoca',
    optional: 'opciono',
    personalMessage: 'Lična poruka',
    messagePlaceholder: 'Uživajte u zasluženom bekstvu na obalu…',
    giftTotal: 'Ukupno poklon vaučer',
    deliveryNote: 'Dostavlja se emailom nakon plaćanja. Jednokratna upotreba.',
    pay: 'Plati ${amount}.00 — Pošalji vaučer',
    stripeNote: 'Sigurno plaćanje putem Stripe-a. Kod vaučera se šalje emailom primaocu odmah nakon plaćanja.',
    errName: 'Unesite svoje ime.',
    errEmail: 'Unesite važeću email adresu za dostavu vaučera.',
    errCheckout: 'Nije moguće pokrenuti plaćanje. Pokušajte ponovo.',
    errUnexpected: 'Neočekivani odgovor. Pokušajte ponovo.',
    errNetwork: 'Greška mreže. Proverite vezu i pokušajte ponovo.',
    steps: [
      { title: 'Plaćate', body: 'Odaberite vrednost i platite bezbedno putem Stripe-a.' },
      { title: 'Šaljemo kod', body: 'Primalac dobija jedinstveni kod vaučera emailom.' },
      { title: 'Iskorišćava ga', body: 'Unesite kod pri plaćanju na stranici za direktnu rezervaciju.' },
    ],
  },
  hr: {
    back: 'Natrag na rezervaciju',
    heading: 'Poklonite DEVOCEAN iskustvo',
    subtitle: 'Poklonite nekome posebnom boravak u DEVOCEAN Lodge u Ponta do Ouro, Mozambik. Poklon bon koji mogu iskoristiti pri direktnoj rezervaciji.',
    voucherValue: 'Vrijednost bona (USD)',
    yourName: 'Vaše ime',
    yourNamePlaceholder: 'Vaše ime',
    yourEmail: 'Vaš email',
    voucherSentHere: 'bon se šalje ovdje',
    recipientName: 'Ime primatelja',
    optional: 'neobavezno',
    personalMessage: 'Osobna poruka',
    messagePlaceholder: 'Uživajte u zasluženom bijegu na obalu…',
    giftTotal: 'Ukupno poklon bon',
    deliveryNote: 'Dostavlja se emailom nakon plaćanja. Jednokratna upotreba.',
    pay: 'Plati ${amount}.00 — Pošalji bon',
    stripeNote: 'Sigurno plaćanje putem Stripea. Kod bona šalje se emailom primatelju odmah nakon plaćanja.',
    errName: 'Unesite svoje ime.',
    errEmail: 'Unesite valjanu email adresu za dostavu bona.',
    errCheckout: 'Nije moguće pokrenuti plaćanje. Pokušajte ponovo.',
    errUnexpected: 'Neočekivani odgovor. Pokušajte ponovo.',
    errNetwork: 'Mrežna greška. Provjerite vezu i pokušajte ponovo.',
    steps: [
      { title: 'Plaćate', body: 'Odaberite vrijednost i platite sigurno putem Stripea.' },
      { title: 'Šaljemo kod', body: 'Primatelj dobiva jedinstveni kod bona emailom.' },
      { title: 'Iskorištava ga', body: 'Unesite kod pri plaćanju na stranici za direktnu rezervaciju.' },
    ],
  },
  cs: {
    back: 'Zpět na rezervaci',
    heading: 'Darujte zážitek DEVOCEAN',
    subtitle: 'Darujte někomu výjimečnému pobyt v DEVOCEAN Lodge v Ponta do Ouro v Mozambiku. Dárkový poukaz, který může uplatnit při přímé rezervaci.',
    voucherValue: 'Hodnota poukazu (USD)',
    yourName: 'Vaše jméno',
    yourNamePlaceholder: 'Vaše jméno',
    yourEmail: 'Váš email',
    voucherSentHere: 'poukaz bude zaslán sem',
    recipientName: 'Jméno příjemce',
    optional: 'nepovinné',
    personalMessage: 'Osobní zpráva',
    messagePlaceholder: 'Užijte si zasloužený únik k pobřeží…',
    giftTotal: 'Celkem dárkový poukaz',
    deliveryNote: 'Doručen emailem po platbě. Jednorázové použití.',
    pay: 'Zaplatit ${amount}.00 — Odeslat poukaz',
    stripeNote: 'Bezpečná platba přes Stripe. Kód poukazu je příjemci zaslán emailem ihned po platbě.',
    errName: 'Zadejte své jméno.',
    errEmail: 'Zadejte platnou emailovou adresu pro doručení poukazu.',
    errCheckout: 'Nepodařilo se spustit platbu. Zkuste to znovu.',
    errUnexpected: 'Neočekávaná odpověď. Zkuste to znovu.',
    errNetwork: 'Chyba sítě. Zkontrolujte připojení a zkuste to znovu.',
    steps: [
      { title: 'Zaplatíte', body: 'Zvolte hodnotu a zaplaťte bezpečně přes Stripe.' },
      { title: 'Zašleme kód', body: 'Příjemce obdrží unikátní kód poukazu emailem.' },
      { title: 'Uplatní ho', body: 'Zadejte kód při pokladně na stránce přímé rezervace.' },
    ],
  },
  tr: {
    back: 'Rezervasyona dön',
    heading: 'DEVOCEAN deneyimini hediye edin',
    subtitle: 'Özel birine Mozambik\'in Ponta do Ouro\'sundaki DEVOCEAN Lodge\'da bir konaklama hediye edin. Doğrudan rezervasyon yaparken kullanabilecekleri bir hediye çeki.',
    voucherValue: 'Hediye çeki değeri (USD)',
    yourName: 'Adınız',
    yourNamePlaceholder: 'Adınız',
    yourEmail: 'E-postanız',
    voucherSentHere: 'hediye çeki buraya gönderilecek',
    recipientName: 'Alıcının adı',
    optional: 'isteğe bağlı',
    personalMessage: 'Kişisel mesaj',
    messagePlaceholder: 'Kıyıda hak ettiğiniz bir kaçamakın tadını çıkarın…',
    giftTotal: 'Hediye çeki toplamı',
    deliveryNote: 'Ödeme sonrası e-posta ile teslim edilir. Tek kullanımlık.',
    pay: '${amount}.00 öde — Çek gönder',
    stripeNote: 'Stripe aracılığıyla güvenli ödeme. Hediye çeki kodu, ödeme sonrasında alıcıya hemen e-posta ile gönderilir.',
    errName: 'Adınızı girin.',
    errEmail: 'Hediye çekinin teslimi için geçerli bir e-posta adresi girin.',
    errCheckout: 'Ödeme başlatılamadı. Lütfen tekrar deneyin.',
    errUnexpected: 'Beklenmedik yanıt. Lütfen tekrar deneyin.',
    errNetwork: 'Ağ hatası. Bağlantınızı kontrol edip tekrar deneyin.',
    steps: [
      { title: 'Ödeme yaparsınız', body: 'Bir değer seçin ve Stripe aracılığıyla güvenle ödeyin.' },
      { title: 'Kodu göndeririz', body: 'Alıcı, e-posta ile benzersiz bir hediye çeki kodu alır.' },
      { title: 'Kullanır', body: 'Doğrudan rezervasyon sayfasında ödeme sırasında kodu girin.' },
    ],
  },
  ja: {
    back: '予約に戻る',
    heading: 'DEVOCEANの体験をプレゼントに',
    subtitle: 'モザンビークのポンタ・ド・オウロにあるDEVOCEAN Lodgeへの宿泊を大切な方へプレゼントしましょう。直接予約時に使えるギフトバウチャーです。',
    voucherValue: 'バウチャー金額（USD）',
    yourName: 'お名前',
    yourNamePlaceholder: 'お名前',
    yourEmail: 'メールアドレス',
    voucherSentHere: 'バウチャーをここに送付',
    recipientName: '受取人の名前',
    optional: '任意',
    personalMessage: 'メッセージ',
    messagePlaceholder: '海辺でのひと時をお楽しみください…',
    giftTotal: 'ギフトバウチャー合計',
    deliveryNote: '支払い後にメールで送付されます。一回限り使用可能。',
    pay: '${amount}.00 を支払い — バウチャーを送る',
    stripeNote: 'Stripeによる安全な決済。支払い後すぐにバウチャーコードが受取人にメールで送られます。',
    errName: 'お名前を入力してください。',
    errEmail: 'バウチャー送付先として有効なメールアドレスを入力してください。',
    errCheckout: 'チェックアウトを開始できませんでした。もう一度お試しください。',
    errUnexpected: '予期しないレスポンスです。もう一度お試しください。',
    errNetwork: 'ネットワークエラーです。接続を確認してもう一度お試しください。',
    steps: [
      { title: 'お支払い', body: '金額を選び、Stripeで安全にお支払いください。' },
      { title: 'コードを送付', body: '受取人にユニークなバウチャーコードがメールで届きます。' },
      { title: '使用する', body: 'ダイレクト予約ページのチェックアウト時にコードを入力。' },
    ],
  },
  zh: {
    back: '返回预订',
    heading: '赠送DEVOCEAN体验礼品',
    subtitle: '为您的特别之人送上一次在莫桑比克蓬塔杜奥鲁DEVOCEAN Lodge的住宿之旅。礼品券可在直接预订时使用。',
    voucherValue: '礼品券金额（美元）',
    yourName: '您的姓名',
    yourNamePlaceholder: '您的姓名',
    yourEmail: '您的邮箱',
    voucherSentHere: '礼品券发送至此',
    recipientName: '收件人姓名',
    optional: '选填',
    personalMessage: '个人留言',
    messagePlaceholder: '享受一次海边的完美逃离之旅…',
    giftTotal: '礼品券总额',
    deliveryNote: '付款后通过邮件发送。仅限一次使用。',
    pay: '支付 ${amount}.00 — 发送礼品券',
    stripeNote: '通过Stripe安全支付。礼品券代码将在付款后立即通过邮件发送给收件人。',
    errName: '请输入您的姓名。',
    errEmail: '请输入有效的电子邮件地址以接收礼品券。',
    errCheckout: '无法开始结账，请重试。',
    errUnexpected: '意外响应，请重试。',
    errNetwork: '网络错误，请检查您的连接后重试。',
    steps: [
      { title: '您付款', body: '选择金额，通过Stripe安全支付。' },
      { title: '我们发送代码', body: '收件人将通过邮件收到唯一礼品券代码。' },
      { title: '兑换使用', body: '在直接预订页面结账时输入代码即可。' },
    ],
  },
  ru: {
    back: 'Вернуться к бронированию',
    heading: 'Подарите DEVOCEAN',
    subtitle: 'Подарите кому-то особенному отдых в DEVOCEAN Lodge в Понта-ду-Оуру, Мозамбик. Подарочный ваучер, который можно использовать при прямом бронировании.',
    voucherValue: 'Номинал ваучера (USD)',
    yourName: 'Ваше имя',
    yourNamePlaceholder: 'Ваше имя',
    yourEmail: 'Ваш email',
    voucherSentHere: 'ваучер будет выслан сюда',
    recipientName: 'Имя получателя',
    optional: 'необязательно',
    personalMessage: 'Личное сообщение',
    messagePlaceholder: 'Наслаждайтесь заслуженным побегом на побережье…',
    giftTotal: 'Итого подарочный ваучер',
    deliveryNote: 'Доставляется по email после оплаты. Одноразовое использование.',
    pay: 'Оплатить ${amount}.00 — Отправить ваучер',
    stripeNote: 'Безопасная оплата через Stripe. Код ваучера отправляется получателю по email сразу после оплаты.',
    errName: 'Введите своё имя.',
    errEmail: 'Введите действительный адрес email для доставки ваучера.',
    errCheckout: 'Не удалось начать оплату. Пожалуйста, попробуйте снова.',
    errUnexpected: 'Неожиданный ответ. Пожалуйста, попробуйте снова.',
    errNetwork: 'Ошибка сети. Проверьте соединение и попробуйте снова.',
    steps: [
      { title: 'Оплачиваете', body: 'Выберите сумму и оплатите безопасно через Stripe.' },
      { title: 'Отправляем код', body: 'Получатель получает уникальный код ваучера по email.' },
      { title: 'Использует', body: 'Введите код при оформлении заказа на странице прямого бронирования.' },
    ],
  },
  af: {
    back: 'Terug na boeking',
    heading: 'Gee die geskenk van DEVOCEAN',
    subtitle: 'Bederf iemand spesiaals met \'n verblyf by DEVOCEAN Lodge in Ponta do Ouro, Mosambiek. \'n Geskenkkoepon wat hulle kan gebruik by direkte boeking.',
    voucherValue: 'Geskenkkoepon waarde (USD)',
    yourName: 'U naam',
    yourNamePlaceholder: 'U naam',
    yourEmail: 'U e-pos',
    voucherSentHere: 'koepon word hierheen gestuur',
    recipientName: 'Ontvanger se naam',
    optional: 'opsioneel',
    personalMessage: 'Persoonlike boodskap',
    messagePlaceholder: 'Geniet \'n welverdiende ontsnapping na die kus…',
    giftTotal: 'Totale geskenkkoepon',
    deliveryNote: 'Afgelewer per e-pos na betaling. Eenmalige gebruik.',
    pay: 'Betaal ${amount}.00 — Stuur koepon',
    stripeNote: 'Veilige betaling via Stripe. Die koeponkode word onmiddellik na betaling per e-pos aan die ontvanger gestuur.',
    errName: 'Voer u naam in.',
    errEmail: 'Voer \'n geldige e-posadres in vir die aflewering van die koepon.',
    errCheckout: 'Kon nie betaling begin nie. Probeer asseblief weer.',
    errUnexpected: 'Onverwagte reaksie. Probeer asseblief weer.',
    errNetwork: 'Netwerkfout. Kontroleer u verbinding en probeer weer.',
    steps: [
      { title: 'U betaal', body: 'Kies \'n bedrag en betaal veilig via Stripe.' },
      { title: 'Ons stuur die kode', body: 'Die ontvanger kry \'n unieke koeponkode per e-pos.' },
      { title: 'Hulle los dit in', body: 'Voer die kode in by afrekening op die Direkte Boeking-bladsy.' },
    ],
  },
  zu: {
    back: 'Buyela ekubhukhineni',
    heading: 'Nika isipho se-DEVOCEAN',
    subtitle: 'Nika umuntu okhethekile uhlalo e-DEVOCEAN Lodge e-Ponta do Ouro, eMozambique. Ivawusha lesipho angalifaka lapho abhukha ngokuqondile.',
    voucherValue: 'Inani levawusha (USD)',
    yourName: 'Igama lakho',
    yourNamePlaceholder: 'Igama lakho',
    yourEmail: 'I-imeyili yakho',
    voucherSentHere: 'ivawusha lithumelwa lapha',
    recipientName: 'Igama lomamukeli',
    optional: 'okukhethekile',
    personalMessage: 'Umlayezo womuntu siqu',
    messagePlaceholder: 'Jabulela ukubaleka okufanelekile okuya ogwini…',
    giftTotal: 'Isamba sevawusha lesipho',
    deliveryNote: 'Ithunyelwa nge-imeyili ngemuva kokukhokha. Kusetshenziswa kanye kuphela.',
    pay: 'Khokha i-${amount}.00 — Thumela ivawusha',
    stripeNote: 'Ukukhokha okuvikelekile nge-Stripe. Ikhodi yevawusha ithunyelwa nge-imeyili kumamukeli ngokushesha ngemuva kokukhokha.',
    errName: 'Faka igama lakho.',
    errEmail: 'Faka ikheli le-imeyili elisebenzayo ukuze kuthunyelwe ivawusha.',
    errCheckout: 'Yehlulekile ukuqala ukukhokha. Sicela uzame futhi.',
    errUnexpected: 'Impendulo engalindelekile. Sicela uzame futhi.',
    errNetwork: 'Iphutha lenethiwekhi. Hlola uxhumano lwakho uzame futhi.',
    steps: [
      { title: 'Ukhokha', body: 'Khetha inani ukhokhe ngokuvikelekile nge-Stripe.' },
      { title: 'Sithumela ikhodi', body: 'Umamukeli uthola ikhodi evawusha elikhethekile nge-imeyili.' },
      { title: 'Bayalifaka', body: 'Faka ikhodi lapho ukhokha ekhasini le-Book Direct.' },
    ],
  },
  sw: {
    back: 'Rudi kwenye uwekaji nafasi',
    heading: 'Toa zawadi ya DEVOCEAN',
    subtitle: 'Mpe mtu maalum likizo katika DEVOCEAN Lodge huko Ponta do Ouro, Msumbiji. Voucha ya zawadi wanayoweza kutumia wakati wa kuweka nafasi moja kwa moja.',
    voucherValue: 'Thamani ya voucha (USD)',
    yourName: 'Jina lako',
    yourNamePlaceholder: 'Jina lako',
    yourEmail: 'Barua pepe yako',
    voucherSentHere: 'voucha itatumwa hapa',
    recipientName: 'Jina la mpokeaji',
    optional: 'hiari',
    personalMessage: 'Ujumbe wa kibinafsi',
    messagePlaceholder: 'Furahia likizo iliyostahilika pwani…',
    giftTotal: 'Jumla ya voucha ya zawadi',
    deliveryNote: 'Inawasilishwa kwa barua pepe baada ya malipo. Matumizi ya mara moja.',
    pay: 'Lipa ${amount}.00 — Tuma voucha',
    stripeNote: 'Malipo salama kupitia Stripe. Nambari ya voucha inatumwa kwa barua pepe kwa mpokeaji mara moja baada ya malipo.',
    errName: 'Weka jina lako.',
    errEmail: 'Weka anwani sahihi ya barua pepe kwa ajili ya uwasilishaji wa voucha.',
    errCheckout: 'Haikuweza kuanza malipo. Tafadhali jaribu tena.',
    errUnexpected: 'Jibu lisilotarajiwa. Tafadhali jaribu tena.',
    errNetwork: 'Hitilafu ya mtandao. Angalia muunganisho wako ujaribu tena.',
    steps: [
      { title: 'Unalipa', body: 'Chagua thamani na ulipe salama kupitia Stripe.' },
      { title: 'Tunatuma nambari', body: 'Mpokeaji anapata nambari ya kipekee ya voucha kwa barua pepe.' },
      { title: 'Wanaitumia', body: 'Weka nambari wakati wa malipo kwenye ukurasa wa Book Direct.' },
    ],
  },
};

export default function GiftVouchersPage({ lang }) {
  const g = GIFT_STRINGS[(lang || 'en').split('-')[0]] || GIFT_STRINGS.en;

  // SEO: unique title + description for the gift vouchers page
  useEffect(() => {
    const prevTitle = document.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    const prevDesc = metaDesc?.content || '';
    document.title = 'Gift Vouchers | DEVOCEAN Lodge – Ponta do Ouro, Mozambique';
    if (metaDesc) metaDesc.content = 'Give the gift of a beach escape at DEVOCEAN Lodge, Ponta do Ouro, Mozambique. Choose any USD amount, delivered by email, redeemable on direct bookings.';
    return () => {
      document.title = prevTitle;
      if (metaDesc) metaDesc.content = prevDesc;
    };
  }, []);

  const [amount, setAmount] = useState(100);
  const [purchaserName, setPurchaserName] = useState('');
  const [purchaserEmail, setPurchaserEmail] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!purchaserName.trim()) { setError(g.errName); return; }
    if (!purchaserEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(purchaserEmail.trim())) {
      setError(g.errEmail); return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/gift-voucher/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          purchaserName: purchaserName.trim(),
          purchaserEmail: purchaserEmail.trim(),
          recipientName: recipientName.trim() || undefined,
          message: message.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || g.errCheckout);
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError(g.errUnexpected);
      }
    } catch {
      setError(g.errNetwork);
    } finally {
      setLoading(false);
    }
  };

  const INPUT_CLASS =
    'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#9e4b13] focus:ring-2 focus:ring-[#9e4b13]/20 outline-none transition';
  const LABEL_CLASS = 'block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide';

  return (
    <div className="min-h-screen bg-slate-50 pt-[var(--stack-h)]">
      <div className="max-w-xl mx-auto px-4 py-8">
        <a
          href="/book-direct"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
          data-testid="link-back-to-booking"
        >
          <ArrowLeft className="h-4 w-4" />
          {g.back}
        </a>
        {/* Hero */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber-100 mb-4">
            <Gift className="h-7 w-7 text-amber-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{g.heading}</h1>
          <p className="text-slate-500 text-sm leading-relaxed max-w-sm mx-auto">
            {g.subtitle}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Amount */}
            <div>
              <label className={LABEL_CLASS}>{g.voucherValue}</label>
              <div className="flex flex-wrap gap-2" data-testid="group-denominations">
                {DENOMINATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setAmount(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                      amount === d
                        ? 'bg-[#9e4b13] text-white border-[#9e4b13]'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-[#9e4b13] hover:text-[#9e4b13]'
                    }`}
                    data-testid={`button-amount-${d}`}
                  >
                    ${d}
                  </button>
                ))}
              </div>
            </div>

            {/* Purchaser */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-purchaser-name">{g.yourName}</label>
                <input
                  id="gv-purchaser-name"
                  type="text"
                  value={purchaserName}
                  onChange={(e) => setPurchaserName(e.target.value)}
                  placeholder={g.yourNamePlaceholder}
                  className={INPUT_CLASS}
                  data-testid="input-purchaser-name"
                />
              </div>
              <div>
                <label className={LABEL_CLASS} htmlFor="gv-purchaser-email">
                  {g.yourEmail} <span className="font-normal text-slate-400">({g.voucherSentHere})</span>
                </label>
                <input
                  id="gv-purchaser-email"
                  type="email"
                  value={purchaserEmail}
                  onChange={(e) => setPurchaserEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  data-testid="input-purchaser-email"
                />
              </div>
            </div>

            {/* Recipient name (optional, for personalisation) */}
            <div>
              <label className={LABEL_CLASS} htmlFor="gv-recipient-name">
                {g.recipientName} <span className="font-normal text-slate-400">({g.optional})</span>
              </label>
              <input
                id="gv-recipient-name"
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="Jane Smith"
                className={INPUT_CLASS}
                data-testid="input-recipient-name"
              />
            </div>

            {/* Personal message */}
            <div>
              <label className={LABEL_CLASS} htmlFor="gv-message">
                {g.personalMessage} <span className="font-normal text-slate-400">({g.optional})</span>
              </label>
              <textarea
                id="gv-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={g.messagePlaceholder}
                className={INPUT_CLASS + ' resize-none'}
                data-testid="input-message"
              />
            </div>

            {/* Summary */}
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500">{g.giftTotal}</p>
                <p className="text-lg font-bold text-slate-900">${amount}.00 USD</p>
              </div>
              <div className="text-xs text-slate-400 text-right max-w-[160px]">
                {g.deliveryNote}
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600" data-testid="text-error">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#9e4b13] px-6 py-3 text-white font-semibold hover:bg-[#854011] transition-colors disabled:opacity-60"
              data-testid="button-pay"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Gift className="h-5 w-5" />}
              {g.pay.replace('{amount}', amount)}
            </button>

            <p className="text-center text-xs text-slate-400">
              {g.stripeNote}
            </p>
          </form>
        </div>

        {/* How it works */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {g.steps.map((step, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-100 p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 mb-1">{i + 1}</div>
              <p className="text-sm font-semibold text-slate-800">{step.title}</p>
              <p className="text-xs text-slate-500 mt-1">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
