import Link from "next/link";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Certify - página inicial">
        <span className="brand-mark">C</span>
        <span>Certify</span>
      </Link>

      <nav className="nav-links" aria-label="Navegação principal">
        <Link href="/verificar/CERT-7K4M2P">Verificar</Link>
        <Link href="/emitir">Emitir certificado</Link>
      </nav>
    </header>
  );
}
