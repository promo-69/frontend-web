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

export default function Home() {
  const [releases, setReleases] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadHome() {
      try {
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
  }, [])

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