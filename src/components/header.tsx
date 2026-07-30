import Link from "next/link";
import { WalletButton } from "@/components/wallet-button";

export function Header() {
  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="Certify - página inicial">
        <span className="brand-mark">C</span>
        <span>Certify</span>
      </Link>

      <nav className="nav-links" aria-label="Navegação principal">
        <Link href="/meus-certificados">Meus certificados</Link>
        <Link href="/verificar/CERT-7K4M2P">Verificar</Link>
        <Link href="/instituicoes">Sou uma instituição</Link>
        <Link href="/emitir">Emitir certificado</Link>
      </nav>
      <div className="header-wallet">
        <WalletButton />
      </div>
    </header>
  );
}
