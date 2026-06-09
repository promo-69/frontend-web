import { useEffect, useState } from 'react'

import Footer from '../../components/ui/Footer'
import Carousel from '../../components/home/Carousel'
import HomeReleases from '../../components/home/HomeReleases'
import HomeUpcoming from '../../components/home/HomeUpcoming'
import HomeEvents from '../../components/home/HomeEvents'
import {getEvents} from '../../services/events.service'
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
        const releasesResponse = await getMoviesReleases()

        console.log('RELEASES:', releasesResponse)

        const upcomingResponse = await getUpcomingMovies()

        console.log('UPCOMING:', upcomingResponse)

        const eventsResponse = await getEvents()

        console.log('EVENTS:', eventsResponse)

        setReleases(releasesResponse || [])
        setUpcoming(upcomingResponse?.rows || [])
        setEvents(eventsResponse || [])
      } catch (error) {
        console.error('ERROR HOME:', error)
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
        <p className="animate-pulse">Cargando películas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex justify-center items-center">
        <p>No se pudieron cargar las películas.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
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
