export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative py-8 sm:py-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-xl font-bold text-gradient">2bleA</span>
            <p className="text-sm text-gray-600 mt-1">
              Transformamos tu idea en realidad digital.
            </p>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-sm text-gray-500 flex-wrap justify-center">
            <a
              href={`https://wa.me/5492622530837`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-premium-accent transition-colors"
            >
              WhatsApp
            </a>
            <a
              href="mailto:gonzalezlucasaaron@gmail.com"
              className="hover:text-premium-accent transition-colors"
            >
              Email
            </a>
            <a
              href="#presupuesto"
              className="hover:text-premium-accent transition-colors"
            >
              Presupuesto
            </a>
            <a
              href="/cliente/login"
              className="hover:text-premium-accent transition-colors"
            >
              Iniciar sesión
            </a>
          </div>

          <p className="text-sm text-gray-600">
            &copy; {year} 2bleA. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
