import { useEffect, useState, useContext } from 'react'
import { AuthContext } from '../../../context/AuthContext'
import { getMyLoyaltyRequest, getMyLoyaltyLedgersRequest } from '../../../services/users.service'

// Definición estática de niveles según backend
const LOYALTY_LEVELS = [
  { id: 4, name: 'VIP', required_points: 4500 },
  { id: 3, name: 'Oro', required_points: 2100 },
  { id: 2, name: 'Plata', required_points: 900 },
  { id: 1, name: 'Bronce', required_points: 300 },
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
  const currentLevel = LOYALTY_LEVELS.find((l) => l.id === summary?.loyalty_level)
  const progressPercent = currentLevel
    ? Math.min(
        100,
        Math.round(((summary?.level_progress_points ?? 0) / currentLevel.required_points) * 100),
      )
    : null

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        const s = await getMyLoyaltyRequest()
        if (s) setSummary(s.data || s)

        const l = await getMyLoyaltyLedgersRequest(page, limit)
        if (l) {
          // Normalize ledgers: API may return { data: [...] , metadata: {...} } or the array directly
          const potentialArray = l.data ?? l
          const normalized = Array.isArray(potentialArray)
            ? potentialArray
            : Array.isArray(potentialArray?.data)
            ? potentialArray.data
            : []
          setLedgers(normalized)
          setMetadata(l.metadata ?? l.meta ?? null)
        }
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [page, limit])

  if (loading) return <div className="p-6 text-white">Cargando fidelidad...</div>
  if (error) return <div className="p-6 text-red-400">Error cargando datos.</div>

  return (
    <div className="bg-[#231640] min-h-[calc(100vh-80px)] w-full flex flex-col items-center py-8 font-montserrat text-white">
      <div className="w-full max-w-3xl p-6 bg-gradient-to-b from-[#2A154B] via-[#7B1A82] to-[#231640] rounded-2xl shadow-lg">
        <h1 className="text-3xl font-bold text-[#D9982F] mb-4">Fidelidad</h1>

        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Resumen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded">
              <p className="text-sm text-[#F6AD38] font-bold">Nivel</p>
              <p className="text-2xl font-bold">{currentLevel?.name ?? (summary?.loyalty_level ?? '—')}</p>
              {currentLevel && (
                <p className="text-xs text-white/70">Requiere {currentLevel.required_points} puntos</p>
              )}
              {progressPercent !== null && (
                <p className="text-xs text-white/70 mt-1">Progreso: {progressPercent}%</p>
              )}
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
              disabled={page <= 1}
              className="px-3 py-2 bg-white/5 rounded disabled:opacity-40"
            >
              Anterior
            </button>
            <div>Pagina {page}{metadata ? ` de ${Math.ceil((metadata.total || 0) / (metadata.limit || limit))}` : ''}</div>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={metadata && page >= Math.ceil((metadata.total || 0) / (metadata.limit || limit))}
              className="px-3 py-2 bg-white/5 rounded disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Loyalty
