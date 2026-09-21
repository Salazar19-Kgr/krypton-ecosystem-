export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#031a2c] text-white">
      {/* Fondo acuático */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_15%_45%,rgba(255,177,110,.35),transparent_25%),radial-gradient(ellipse_at_85%_15%,rgba(70,205,255,.35),transparent_30%),radial-gradient(ellipse_at_50%_70%,rgba(0,190,255,.3),transparent_45%),linear-gradient(135deg,#071b31,#003b61_48%,#031321)]" />

      <div className="absolute -left-[20%] top-[22%] h-[35%] w-[140%] rotate-[-8deg] rounded-[50%] border-t border-cyan-200/30 bg-cyan-300/10 blur-xl" />
      <div className="absolute -left-[15%] top-[48%] h-[28%] w-[130%] rotate-[5deg] rounded-[50%] border-t border-white/20 bg-blue-400/10 blur-2xl" />
      <div className="absolute -left-[10%] bottom-[2%] h-[30%] w-[120%] rotate-[-4deg] rounded-[50%] bg-cyan-300/10 blur-3xl" />

      {/* Reflejos de agua */}
      <div className="absolute left-[8%] top-[38%] h-40 w-40 rounded-full bg-cyan-200/20 blur-3xl" />
      <div className="absolute right-[8%] top-[12%] h-52 w-52 rounded-full bg-sky-300/20 blur-3xl" />
      <div className="absolute bottom-[18%] left-[42%] h-48 w-48 rounded-full bg-blue-300/20 blur-3xl" />

      {/* Encabezado */}
      <header className="relative z-10 flex items-center justify-between px-6 py-7 sm:px-10">
        <div className="rounded-full border border-cyan-100/40 bg-white/10 px-5 py-3 shadow-[0_0_30px_rgba(70,220,255,.18)] backdrop-blur-2xl">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_15px_#67e8f9]" />
          <span className="text-sm text-white/90">Krypton Ecosystem</span>
        </div>

        <button className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-2xl shadow-xl backdrop-blur-2xl">
          ☰
        </button>
      </header>

      {/* Contenido */}
      <section className="relative z-10 mx-auto flex min-h-[calc(100vh-110px)] max-w-6xl flex-col items-center px-5 pb-8 pt-20 text-center">

        <div className="mb-9">
          <h1 className="text-5xl font-light tracking-[0.22em] text-white drop-shadow-[0_0_25px_rgba(150,230,255,.35)] sm:text-7xl">
            KRYPTON
          </h1>

          <p className="mt-3 text-lg font-light tracking-[0.55em] text-white/90 sm:text-2xl">
            ECOSYSTEM
          </p>
        </div>

        {/* Vidrio líquido principal */}
        <div className="w-full max-w-4xl rounded-[2rem] border border-white/35 bg-white/[0.10] px-7 py-11 shadow-[0_25px_90px_rgba(0,150,255,.22),inset_0_1px_0_rgba(255,255,255,.35)] backdrop-blur-2xl">
          <h2 className="text-3xl font-semibold leading-tight sm:text-5xl">
            Inteligencia diseñada
            <br />
            <span className="text-cyan-100">para adaptarse a ti.</span>
          </h2>

          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-white/80 sm:text-xl">
            Ecosistema multifuncional diseñado para adaptarse a tus límites y capacidades.
          </p>
        </div>

        {/* Botón cristal */}
        <button className="mt-8 rounded-full border border-cyan-100/70 bg-cyan-200/20 px-12 py-4 text-lg font-medium shadow-[0_0_40px_rgba(50,210,255,.35),inset_0_1px_0_rgba(255,255,255,.5)] backdrop-blur-2xl transition hover:scale-105 hover:bg-cyan-200/30">
          Comenzar
          <span className="ml-4">→</span>
        </button>

        {/* Funciones */}
        <div className="mt-16 grid w-full max-w-5xl grid-cols-2 gap-5 sm:grid-cols-4">
          {[
            ["✦", "IA Avanzada", "Piensa contigo"],
            ["◎", "Información", "Sin límites"],
            ["▣", "Análisis de Imágenes", "Ve y comprende"],
            ["ϟ", "Mucho más", "En constante evolución"],
          ].map(([icon, title, description]) => (
            <div
              key={title}
              className="rounded-3xl border border-white/20 bg-white/[0.09] px-4 py-6 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_15px_40px_rgba(0,100,180,.15)] backdrop-blur-2xl"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-100/30 bg-cyan-200/10 text-xl text-cyan-100 shadow-[0_0_20px_rgba(70,220,255,.15)]">
                {icon}
              </div>

              <h3 className="text-sm font-medium sm:text-base">
                {title}
              </h3>

              <p className="mt-1 text-xs text-white/55">
                {description}
              </p>
            </div>
          ))}
        </div>

        <footer className="mt-16 pb-5 text-xs tracking-wider text-white/45">
          © 2026 · Krypton Ecosystem
        </footer>
      </section>
    </main>
  )
}
