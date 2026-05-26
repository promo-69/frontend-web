import Carousel from '../../components/home/Carousel'
import Recommendations from '../../components/home/Recomendations'
import UpcomingReleases from '../../components/home/UpcomingReleases'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">
      <Carousel />

      <main className="px-6 md:px-16 py-12">
        <Recommendations />
        <UpcomingReleases />
      </main>

      <footer className="py-12 text-center text-gray-500 border-t border-white/10">
        <p>&copy; 2026 CINEFLIX - Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
