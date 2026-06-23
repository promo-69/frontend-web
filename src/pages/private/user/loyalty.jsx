import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import { getMyLoyaltyRequest, getMyLoyaltyLedgersRequest } from '../../../services/users.service'
import Footer from '../../../components/ui/Footer' // <-- Asegúrate de tener importado tu Footer aquí

// Definición estática de niveles según backend (solo id -> name, usado como fallback)
const LOYALTY_LEVELS = [
  { id: 4, name: 'VIP' },
  { id: 3, name: 'Oro' },
  { id: 2, name: 'Plata' },
  { id: 1, name: 'Bronce' },
]

function Loyalty() {
  const { user } = useContext(AuthContext)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [summary, setSummary] = useState(null)
  const [ledgers, setLedgers] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [metadata, setMetadata] = useState(null)

  // Preferir el nombre enviado por la API; si no existe, mapear por id como fallback
  const levelName = summary?.loyalty_level_name ?? LOYALTY_LEVELS.find((l) => l.id === summary?.loyalty_level)?.name
  
  // Calcular totalPages a partir de metadata (soporta total, count, total_count)
  const totalCount = metadata?.total ?? metadata?.count ?? metadata?.total_count ?? 0
  const metaLimit = metadata?.limit ?? limit
  const totalPages = totalCount > 0 ? Math.max(1, Math.ceil(totalCount / metaLimit)) : 0

  // Asegurar que la página actual esté dentro del rango válido
  useEffect(() => {
    if (totalPages === 0 && page !== 1) {
      setPage(1)
    }
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages)
    }
  }, [totalPages, page])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const s = await getMyLoyaltyRequest()
        if (s) setSummary(s.data || s)

        const l = await getMyLoyaltyLedgersRequest(page, limit)
        if (l) {
          // Normalize ledgers: support shapes like
          // 1) { data: [...] }
          // 2) { data: { rows: [...], count: N } }
          // 3) { rows: [...], count: N }
          // 4) direct array [...]
          const raw = l.data ?? l
          let ledgerArray = []
          let meta = null

          if (Array.isArray(raw)) {
            ledgerArray = raw
          } else if (raw && Array.isArray(raw.rows)) {
            ledgerArray = raw.rows
            if (raw.count != null) meta = { total: raw.count, limit: raw.limit ?? limit }
          } else if (raw && Array.isArray(raw.data)) {
            ledgerArray = raw.data
          } else if (raw && Array.isArray(raw?.data?.rows)) {
            ledgerArray = raw.data.rows
            const maybeCount = raw.data.count ?? raw.data.total ?? null
            if (maybeCount != null) meta = { total: maybeCount, limit: raw.data.limit ?? limit }
          } else {
            ledgerArray = []
          }

          // If meta still null, try other locations
          if (!meta) {
            const rawMeta = l.metadata ?? l.meta ?? null
            if (rawMeta) {
              meta = rawMeta
            } else {
              const total = l.total ?? l.count ?? l.total_count ?? null
              const metaLimit = l.limit ?? limit
              if (total != null) meta = { total, limit: metaLimit }
            }
          }

          setLedgers(ledgerArray)
          setMetadata(meta)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit])

  /* SE REEMPLAZÓ: Pantalla de carga integrada con el degradado idéntica a Subscriptions */
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] text-white justify-between font-montserrat relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando fidelidad...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) return <div className="p-6 text-red-400">Error cargando datos.</div>

  return (
    /* SE CORRIGIÓ: min-h-screen y fondo con el degradado para evitar franjas blancas */
    <div className="bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] min-h-screen w-full flex flex-col justify-between font-montserrat text-white overflow-x-hidden">
      
      {/* SE MODIFICÓ: pt-4 md:pt-10 para elevar un poco el componente en pantallas de escritorio */}
      <main className="flex-grow w-full flex flex-col items-center px-4 pt-4 md:pt-10 pb-12">
        {/* SE INVIRTIÓ: La tarjeta pasa a ser de color morado sólido y hereda borde sutil */}
        <div className="w-full max-w-3xl p-6 bg-[#231640] border border-white/5 rounded-2xl shadow-2xl shadow-black/30">
          <h1 className="text-3xl font-bold text-[#D9982F] mb-4">Fidelidad</h1>

          <section className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Resumen</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded">
                <p className="text-sm text-[#F6AD38] font-bold">Nivel</p>
                <p className="text-2xl font-bold">{levelName ?? (summary?.loyalty_level ?? '—')}</p>
              </div>
              <div className="p-4 bg-white/5 rounded">
                <p className="text-sm text-[#F6AD38] font-bold">Progreso de nivel</p>
                <p className="text-2xl font-bold">{summary?.level_progress_points ?? 0}</p>
              </div>
              <div className="p-4 bg-white/5 rounded">
                <p className="text-sm text-[#F6AD38] font-bold">Puntos</p>
                <p className="text-2xl font-bold">{summary?.points_balance ?? 0}</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Movimientos</h2>
            {ledgers.length === 0 ? (
              <p className="text-sm text-white/80">No hay movimientos registrados.</p>
            ) : (
              <ul className="space-y-2">
                {ledgers.map((item, idx) => (
                  <li key={idx} className="p-3 bg-white/5 rounded flex justify-between">
                    <div>
                      <p className="font-bold">{item.description || item.type || 'Movimiento'}</p>
                      <p className="text-sm text-white/80">{item.created_at || item.date || ''}</p>
                    </div>
                    <div className={`font-bold ${item.amount && item.amount < 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {item.amount ?? item.points ?? ''}
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || totalPages === 0}
                className="px-3 py-2 bg-white/5 rounded disabled:opacity-40"
              >
                Anterior
              </button>
              <div>
                Pagina {page}
                {typeof totalPages === 'number' ? ` de ${totalPages}` : ''}
              </div>
              <button
                onClick={() => setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))}
                disabled={totalPages === 0 || (totalPages > 0 && page >= totalPages)}
                className="px-3 py-2 bg-white/5 rounded disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </section>
        </div>
      </main>
      
      {/* Footer al fondo para mantener concordancia con la estructura general */}
      <Footer />
    </div>
  )
}

export default Loyalty