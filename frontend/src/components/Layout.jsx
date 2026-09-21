import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

export default function Layout() {
  const { utente, logout } = useAuth();
  const naviga = useNavigate();

  return (
    <div className="pagina">
      <header className="testata">
        <Link to="/" className="marchio" aria-label="Regen Luxury, home">
          <span className="marchio-segno" aria-hidden="true">R</span>
          <span>
            Regen <em>Luxury</em>
          </span>
        </Link>
        <nav className="menu">
          <NavLink to="/scan">Verifica</NavLink>
          {utente ? (
            <>
              <NavLink to="/gestione" end>
                Gestione
              </NavLink>
              <button
                className="link"
                onClick={() => {
                  logout();
                  naviga("/");
                }}
              >
                Esci
              </button>
            </>
          ) : (
            <NavLink to="/login">Accedi</NavLink>
          )}
        </nav>
      </header>
      <main className="contenuto">
        <Outlet />
      </main>
      <footer className="piede">
        <p>Passaporto digitale dei capi rigenerati · prototipo di tesi, Politecnico di Bari</p>
      </footer>
    </div>
  );
}
