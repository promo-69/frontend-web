import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import { getMyLoyaltyRequest, getMyLoyaltyLedgersRequest } from '../../../services/users.service'
import Footer from '../../../components/ui/Footer' 
import PageHeader from '../../../components/ui/PageHeader'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

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
    <div className="bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] min-h-screen w-full flex flex-col justify-between font-montserrat text-white overflow-x-hidden relative">
      {/* Fondos ambientales sutiles */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className="px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 py-16">
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* SECCIÓN CABECERA */}
          <PageHeader
            className="border-b border-white/5 pb-6 mb-10"
            titlePrefix="Mi"
            titleHighlight="Fidelidad"
            subtitle="Consulta el estado actual de tus puntos, tu progreso para el siguiente nivel y el registro de tus movimientos."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* COLUMNA IZQUIERDA: RESUMEN DE FIDELIDAD */}
            <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-1 gap-6 h-fit">
              <div className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-2 hover:border-yellow-500/30 transition-colors">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Nivel Actual</p>
                <p className="font-black text-3xl text-yellow-400">{levelName ?? (summary?.loyalty_level ?? '—')}</p>
              </div>
              <div className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-2 hover:border-yellow-500/30 transition-colors">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Progreso de Nivel</p>
                <p className="font-black text-3xl text-white">
                  {Number(summary?.level_progress_points ?? 0).toLocaleString('es-ES', { useGrouping: true })} 
                  <span className="text-sm font-normal text-gray-500 ml-1">pts</span>
                </p>
              </div>
              <div className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl flex flex-col gap-2 hover:border-yellow-500/30 transition-colors">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">Puntos Disponibles</p>
                <p className="font-black text-3xl text-white">
                  {Number(summary?.points_balance ?? 0).toLocaleString('es-ES', { useGrouping: true })} 
                  <span className="text-sm font-normal text-gray-500 ml-1">pts</span>
                </p>
              </div>
            </div>

            {/* COLUMNA DERECHA: LISTA DE MOVIMIENTOS */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-[#231640] border border-white/10 rounded-2xl p-6 shadow-xl hover:border-yellow-500/30 transition-colors flex-grow">
                <div className="flex flex-col gap-1 mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-2xl font-black text-yellow-400 tracking-tight">Historial de Movimientos</h2>
                  <p className="text-sm text-gray-400 font-medium">Revisa el detalle de todos los puntos acumulados y canjeados</p>
                </div>
                
                {ledgers.length === 0 ? (
                  <p className="text-sm text-gray-500 italic text-center py-4">— No hay movimientos registrados —</p>
                ) : (
                  <ul className="space-y-4">
                    {ledgers.map((item, idx) => (
                      <li key={idx} className="flex flex-col min-[400px]:flex-row justify-between items-start min-[400px]:items-center gap-3 min-[400px]:gap-4 border-b border-white/5 pb-5 last:border-0 last:pb-0">
                        <div className="flex flex-col gap-1.5 w-full min-[400px]:w-auto">
                          <p className="font-bold text-[1.05rem] text-gray-200 leading-tight">
                            {item.remarks || item._OperationTypes?.description || item.description || item.type || 'Movimiento'}
                          </p>
                          {item.remarks && (
                            <p className="text-[0.9rem] text-gray-400">
                              {item._OperationTypes?.description || item.description || item.type || 'Movimiento'}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            {item.created_at ? new Date(item.created_at).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' }) : (item.date || '')}
                          </p>
                        </div>
                        <div className="flex flex-row min-[400px]:flex-col justify-between items-center min-[400px]:items-end w-full min-[400px]:w-auto mt-2 min-[400px]:mt-0">
                          <div className={`font-mono font-bold text-lg whitespace-nowrap ${item._OperationTypes?.is_increment === false ? 'text-red-400' : 'text-green-400'}`}>
                            {item._OperationTypes?.is_increment === false ? '-' : '+'}{Number(item.points ?? item.amount ?? 0).toLocaleString('es-ES', { useGrouping: true })}
                          </div>
                          <p className="text-xs font-semibold text-gray-500 mt-0 min-[400px]:mt-1">
                            Balance: <span className="text-white">{Number(item.points_balance ?? 0).toLocaleString('es-ES', { useGrouping: true })}</span>
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* CONTROLES DE PAGINACIÓN */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white/5"
                  >
                    <FiChevronLeft className="text-lg" />
                    Anterior
                  </button>
                  <div className="text-sm font-bold text-gray-400">
                    Página <span className="text-white">{page}</span> de {totalPages || 1}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                    disabled={page >= (totalPages || 1)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:hover:bg-white/5"
                  >
                    Siguiente
                    <FiChevronRight className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer al fondo para mantener concordancia con la estructura general */}
      <Footer />
    </div>
  )
}

export default Loyalty