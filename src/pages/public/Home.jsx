import { useEffect, useState, useRef } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

import Footer from '../../components/ui/Footer'
import Carousel from '../../components/home/Carousel'
import HomeReleases from '../../components/home/HomeReleases'
import HomeUpcoming from '../../components/home/HomeUpcoming'
import HomeEvents from '../../components/home/HomeEvents'
import { getEvents } from '../../services/events.service'
import {
  getMoviesBillboard,
  getUpcomingMovies,
} from '../../services/movies.service'

export default function Home() {
  const [releases, setReleases] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [events, setEvents] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Referencias para controlar el scroll horizontal de cada sección
  const releasesRef = useRef(null)
  const upcomingRef = useRef(null)
  const eventsRef = useRef(null)

  useEffect(() => {
    async function loadHome() {
      try {
        const billboardData = await getMoviesBillboard()
        const upcomingData = await getUpcomingMovies()
        const eventsData = await getEvents()

        console.log("Data cruda recibida de cartelera:", billboardData);

        const safeBillboard = Array.isArray(billboardData) ? billboardData : [];
        const processedBillboard = safeBillboard.map(item => {
          const content = item.movie || item.event || item;
          
          const isSpecialEvent = item.type === 'special_event' || !!item.event;

          return {
            ...content,
            type: item.type, 
            showtimes: item.showtimes, 
            isEvent: isSpecialEvent, 
            
            posterUrl: content.poster_url || content.posterUrl,
            ageClassification: content.age_classification || content.ageClassification
          };
        });

        // Eliminamos duplicados
        const uniqueBillboard = Array.from(
          new Map(processedBillboard.map(m => [`${m.type}-${m.id}`, m])).values()
        );

        setReleases(uniqueBillboard)
        setUpcoming(Array.isArray(upcomingData) ? upcomingData : [])
        setEvents(Array.isArray(eventsData) ? eventsData : [])
      } catch (error) {
        console.error('ERROR EN CAPA VISUAL HOME:', error)
        setError(true)
      } finally {
        setLoading(false) 
      }
    }

    loadHome()
  }, [])

  const handleScroll = (ref, direction) => {
    if (!ref.current) return

    const firstCard = ref.current.querySelector('.movie-carousel-card')
    if (!firstCard) return

    const gap = 24
    const scrollAmount = firstCard.offsetWidth + gap

    ref.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  // LÓGICA DE DETECCIÓN POST-RENDER DE FALLBACKS 
  useEffect(() => {
    if (loading || error) return;

    const setupImageFallbacks = () => {
      const cards = document.querySelectorAll('.movie-carousel-card');
      
      cards.forEach(card => {
        const img = card.querySelector('img');
        
        if (card && !card.querySelector('.fallback-box-fallback')) {
          const posterContainer = img?.parentElement || card.querySelector('.aspect-\\[2\\/3\\]') || card.firstElementChild;
          
          if (posterContainer) {
            const fallbackDiv = document.createElement('div');
            fallbackDiv.className = "fallback-box-fallback w-full h-full flex flex-col items-center justify-center bg-[#1b1032] text-gray-500 p-4 absolute inset-0 z-10";
            fallbackDiv.style.display = 'none';
            fallbackDiv.innerHTML = `
              <span class="text-3xl mb-2">🎬</span>
              <span class="text-[11px] uppercase tracking-wider font-bold text-center px-2">
                Sin Póster Disponible
              </span>
            `;
            
            posterContainer.style.position = 'relative';
            posterContainer.appendChild(fallbackDiv);

            if (!img || !img.getAttribute('src') || img.getAttribute('src') === 'undefined' || img.getAttribute('src').includes('null')) {
              if (img) img.style.display = 'none';
              fallbackDiv.style.display = 'flex';
            } else {
              img.addEventListener('error', () => {
                img.style.display = 'none';
                fallbackDiv.style.display = 'flex';
              });
            }
          }
        }
      });
    };

    const timeoutId = setTimeout(setupImageFallbacks, 150);
    return () => clearTimeout(timeoutId);
  }, [loading, error, releases, upcoming, events]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex justify-center items-center">
        <p className="animate-pulse tracking-widest uppercase font-bold text-sm">Cargando cartelera...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#231640] text-white flex justify-center items-center">
        <p className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-2xl text-red-400">
          No se pudieron cargar las películas ni los eventos.
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#231640] text-white overflow-x-hidden">

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .hide-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>

      <Carousel />

      <main className="px-6 md:px-16 py-12 flex flex-col gap-16">
        
        {/* CARTELERA EN ESTRENO */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              🎬 Cartelera en Estreno
            </h2>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => handleScroll(releasesRef, 'left')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={() => handleScroll(releasesRef, 'right')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronRight size={20} />
              </button>
              <a 
                href="/billboard" 
                className="ml-2 bg-[#f4b400] hover:bg-[#e0a500] text-black font-black text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-md shadow-[#f4b400]/10 tracking-wider uppercase"
              >
                Ver más
              </a>
            </div>
          </div>
          
          <div
            ref={releasesRef}
            className="overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth w-full"
          >
            <HomeReleases movies={releases} />
          </div>
        </section>

        {/* PRÓXIMOS ESTRENOS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              ✨ Próximos Estrenos
            </h2>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => handleScroll(upcomingRef, 'left')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={() => handleScroll(upcomingRef, 'right')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronRight size={20} />
              </button>
              <a 
                href="/upcoming" 
                className="ml-2 bg-[#f4b400] hover:bg-[#e0a500] text-black font-black text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-md shadow-[#f4b400]/10 tracking-wider uppercase"
              >
                Ver más
              </a>
            </div>
          </div>

          <div
            ref={upcomingRef}
            className="overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth w-full"
          >
            <HomeUpcoming movies={upcoming} />
          </div>
        </section>

        {/* SECCIÓN: PRÓXIMOS EVENTOS */}
        <section>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
            <h2 className="text-xl md:text-2xl font-black tracking-wide uppercase bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              🗓️ Eventos
            </h2>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button 
                onClick={() => handleScroll(eventsRef, 'left')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronLeft size={20} />
              </button>
              <button 
                onClick={() => handleScroll(eventsRef, 'right')}
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 text-gray-300 transition-all"
              >
                <FiChevronRight size={20} />
              </button>
              <a 
                href="/eventos" 
                className="ml-2 bg-[#f4b400] hover:bg-[#e0a500] text-black font-black text-xs md:text-sm px-5 py-2.5 rounded-xl transition-all transform hover:scale-105 shadow-md shadow-[#f4b400]/10 tracking-wider uppercase"
              >
                Ver más
              </a>
            </div>
          </div>

          <div
            ref={eventsRef}
            className="overflow-x-auto overflow-y-hidden hide-scrollbar scroll-smooth w-full"
          >
            <HomeEvents events={events} />          
          </div>
        </section>

      </main>

      <Footer />
    </div>
  )
}