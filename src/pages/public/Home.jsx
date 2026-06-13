import { useEffect, useState } from 'react'

import Footer from '../../components/ui/Footer'
import Carousel from '../../components/home/Carousel'
import HomeReleases from '../../components/home/HomeReleases'
import HomeUpcoming from '../../components/home/HomeUpcoming'
import HomeEvents from '../../components/home/HomeEvents'
import { getEvents } from '../../services/events.service'
import {
  getMoviesReleases,
  getUpcomingMovies,
} from '../../services/movies.service'

// ✅ IMPORTACIONES COMPLEMENTARIAS PARA AUTONOMÍA DE ESTADO
import { useCart } from '../../context/CartContext'
import { getCinemas } from '../../services/info.service'

export default function Home() {
  const { cart, setCinema } = useCart()
  const [releases, setReleases] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadHome() {
      try {
        // 🏙️ INICIALIZACIÓN SILENCIOSA DE SUCURSAL
        // Garantiza el estado del carrito e inventario downstream sin depender del Header
        if (!cart.cinema) {
          const savedCinema = localStorage.getItem('cine_cinema')
          
          if (savedCinema) {
            setCinema(JSON.parse(savedCinema))
          } else {
            const cinemasData = await getCinemas()
            if (cinemasData && cinemasData.length > 0) {
              // Mantenemos Barquisimeto como fallback seguro inicial
              const defaultCinema = cinemasData.find(
                (cine) =>
                  cine.name?.toLowerCase().includes('barquisimeto') ||
                  cine.city?.toLowerCase().includes('barquisimeto')
              )
              const chosen = defaultCinema || cinemasData[0]
              setCinema(chosen)
              localStorage.setItem('cine_cinema', JSON.stringify(chosen))
            }
          }
        }

        // 🎬 CARGA DE DATOS MULTI-REPOSITORIO
        const releasesData = await getMoviesReleases()
        const upcomingData = await getUpcomingMovies()
        const eventsData = await getEvents()

        console.log('RELEASES CARGADOS:', releasesData)
        console.log('UPCOMING CARGADOS:', upcomingData)
        console.log('EVENTS CARGADOS:', eventsData)

        setReleases(releasesData)
        setUpcoming(upcomingData)
        setEvents(eventsData)

      } catch (error) {
        console.error('ERROR EN CAPA VISUAL HOME:', error)
        setError(true)
      } finally {
        setLoading(false) 
      }
    }

    loadHome()
  }, [cart.cinema, setCinema])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex justify-center items-center">
        <p className="animate-pulse">Cargando cartelera...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex justify-center items-center">
        <p>No se pudieron cargar las películas ni los eventos.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
      {/* El carrusel se mantiene intacto */}
      <Carousel />

      <main className="px-6 md:px-16 py-12">
        <HomeReleases movies={releases} />

        <HomeUpcoming movies={upcoming} />

        <HomeEvents movies={events} />
      </main>

      <Footer />
    </div>
  )
}