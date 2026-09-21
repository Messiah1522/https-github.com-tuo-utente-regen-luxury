import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function HomePage() {
  const [codice, setCodice] = useState("");
  const naviga = useNavigate();
  const valido = /^[A-Za-z0-9_-]{3,64}$/.test(codice.trim());

  return (
    <>
      <section className="eroe">
        <p className="sopratitolo">Moda di lusso rigenerata</p>
        <h1>La storia di ogni capo, verificabile in un tocco.</h1>
        <p>
          Avvicina il telefono al tag NFC cucito nel capo oppure inquadra il QR code: vedrai autenticità, interventi di
          rigenerazione, passaggi di proprietà e impatto ambientale evitato. Senza app e senza registrazione.
        </p>
        <Link to="/scan" className="pulsante">
          Inquadra il QR code
        </Link>
      </section>

      <section className="scheda">
        <h2>Hai il codice del tag?</h2>
        <form
          className="modulo modulo-in-linea"
          onSubmit={(e) => {
            e.preventDefault();
            if (valido) naviga(`/v/${encodeURIComponent(codice.trim())}`);
          }}
        >
          <input value={codice} onChange={(e) => setCodice(e.target.value)} placeholder="es. NFC-001" aria-label="Codice del tag" />
          <button className="pulsante" disabled={!valido}>
            Verifica
          </button>
        </form>
      </section>

      <section className="griglia-tre">
        <div>
          <h3>Autenticità</h3>
          <p>I dati del capo sono confrontati con le impronte registrate sulla blockchain Polygon: ogni modifica non autorizzata è rilevata.</p>
        </div>
        <div>
          <h3>Rigenerazione</h3>
          <p>Riparazioni, upcycling e sostituzioni di parti, con i materiali impiegati e il laboratorio che li ha eseguiti.</p>
        </div>
        <div>
          <h3>Sostenibilità</h3>
          <p>Stima della CO₂ e dell’acqua risparmiate rispetto a un capo nuovo, con le fonti scientifiche usate.</p>
        </div>
      </section>
    </>
  );
}
