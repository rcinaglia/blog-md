import { createFileRoute } from '@tanstack/react-router'

import Header from '#/components/Header'
import Footer from '#/components/Footer'

export const Route = createFileRoute('/privacy-policy')({
  component: RouteComponent,
    head: () => ({
    meta: [
      {
        title: 'Privacy Policy | cinaglia.dev',
      },
    ]
  }),
})

function RouteComponent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="w-[90%] sm:w-[90%] md:w-[70%] lg:w-[50%] mx-auto sm:mt-25 mt-32 flex flex-col gap-y-7 mb-35 flex-1">
        <div className='gap-y-3 flex flex-col'>
          <h1 className='text-4xl font-bold'>Privacy Policy</h1>
          <p className='text-sm text-white/30'>Ultimo aggiornamento: 24/08/2026</p>
          <p>Questo sito non installa alcun cookie di profilazione, di terze parti o tecnico sul tuo dispositivo. Non esiste quindi un banner di consenso ai cookie, perché non ne vengono usati.</p>
        </div>
        <div className='gap-y-3 flex flex-col'>
          <h1 className='text-3xl font-bold'>Come raccogliamo i dati</h1>
          <p>
            Per capire come viene utilizzato il sito (numero di visite, pagine più viste, provenienza del traffico) utilizziamo Umami, uno strumento di analisi open source, installato su un nostro server (self-hosted). I dati <b>non vengono condivisi con terze parti</b> e non lasciano la nostra infrastruttura.
          </p>
          <p>Nello specifico, Umami raccoglie in forma aggregata e anonima:
            <ul className='ml-5 list-disc'>
              <li>pagine visitate e durata della visita</li>
              <li>sito di provenienza (referrer)</li>
              <li>tipo di browser e dispositivo (es. mobile/desktop)</li>
              <li>paese di provenienza (a livello geografico generico, non geolocalizzazione precisa)</li>
            </ul>
          </p>
          <p>
            <b>Non vengono raccolti:</b> nome, email, indirizzo IP in chiaro (viene anonimizzato/hashato prima di essere salvato), né alcun identificativo che permetta di risalire alla tua identità personale.
          </p>
          <p>
            Umami non utilizza cookie per funzionare. Per distinguere le sessioni di navigazione può generare, tramite `localStorage` del browser, un identificativo pseudonimo temporaneo e non riconducibile a dati anagrafici. Questo dato non viene incrociato con altre fonti e non permette la profilazione dell'utente.
          </p>
        </div>
        <div className='gap-y-3 flex flex-col'>
          <h1 className='text-3xl font-bold'>Base giuridica del trattamento</h1>
          <p>Il trattamento dei dati statistici anonimi avviene sulla base del legittimo interesse del titolare a comprendere l'utilizzo del sito (art. 6.1.f GDPR), data la natura minima, aggregata e non identificativa dei dati raccolti.</p>
        </div>
        <div className='gap-y-3 flex flex-col'>
          <h1 className='text-3xl font-bold'>I tuoi diritti</h1>
          <p>Poiché i dati raccolti sono anonimi e aggregati, non è possibile risalire alla singola persona: per questo motivo non siamo in grado di individuare, modificare o cancellare "i dati di un utente specifico" su richiesta, semplicemente perché non abbiamo modo di sapere quali dati appartengano a chi.</p>
          <p>Hai diritto a proporre reclamo all'autorità di controllo competente (in Italia, il <b>Garante per la Protezione dei Dati Personali</b> — www.garanteprivacy.it).</p>
        </div>
        <div className='gap-y-3 flex flex-col'>
          <h1 className='text-3xl font-bold'>Modifiche a questa privacy policy</h1>
          <p>Questa policy può essere aggiornata nel tempo. Ti invitiamo a consultarla periodicamente. La data di ultimo aggiornamento è indicata in cima alla pagina.</p>
        </div>
      </div>
      <Footer/>
    </div>
  )
}
