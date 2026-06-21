import React, { useEffect, useState } from 'react';
import Footer from '../../../components/ui/Footer';
import MovieCard from '../../../components/movies/MovieCard'; 
import { getMovieSubscriptions } from '../../../services/subscription.service';

export default function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })

    async function loadSubscriptions() {
      try {
        const response = await getMovieSubscriptions()
        const dataPayload = response?.data || response || []
        setSubscriptions(dataPayload)
      } catch (error) {
        console.error('❌ Error al cargar el listado de películas suscritas:', error)
        setSubscriptions([])
      } finally {
        setLoading(false)
      }
    }

    loadSubscriptions()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#231640] text-white justify-between font-['Montserrat'] relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-[80px] animate-pulse" />
        <div className="flex-grow flex items-center justify-center relative z-10">
          <p className="text-sm font-bold tracking-widest uppercase animate-pulse text-gray-300">
            Cargando tus suscripciones...
          </p>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] text-white justify-between font-['Montserrat'] relative overflow-hidden">
      
      {/* Fondos ambientales sutiles solicitados */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-white/[0.01] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[30%] right-[-5%] w-[40vw] h-[40vw] bg-white/[0.01] rounded-full blur-[140px] pointer-events-none" />

      <section className={`px-4 md:px-8 lg:px-16 w-full flex-grow flex flex-col relative z-10 ${subscriptions.length === 0 ? 'py-12' : 'py-16'}`}>
        <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col">
          
          {/* MENSAJE DE ARRIBA ADAPTADO AL ESTILO SOLICITADO */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/5 pb-6 mb-10 gap-6">
            <div className="border-l-4 border-yellow-500 pl-4 text-left">
              <h3 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white leading-none">
                Mis Películas <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">Suscritas</span>
              </h3>
              <p className="text-xs md:text-sm text-gray-400 mt-3 tracking-wide font-medium max-w-xl leading-relaxed">
                Aquí puedes observar y gestionar todos los próximos estrenos a los que te has suscrito para recibir notificaciones personalizadas.
              </p>
            </div>
          </div>

          {/* Renderizado Condicional delegando a MovieCard */}
          {subscriptions.length === 0 ? (
            <div className="flex-grow flex items-center justify-center my-auto pb-12">
              <p className="text-gray-400 text-base md:text-lg font-medium tracking-wide bg-white/5 px-6 py-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                Aún no tienes suscripciones activas a ningún estreno.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
              {subscriptions.map((sub, index) => {
                const movieData = sub._Movies
                if (!movieData) return null

                // Adaptamos la estructura exacta requerida por tu MovieCard
                const normalizedMovie = {
                  id: movieData.id,
                  title: movieData.title,
                  poster_url: movieData.poster_url,
                  ageClassification: { description: 'Próximamente' }
                }

                return (
                  <MovieCard 
                    key={sub.id || `${movieData.id}-${index}`}
                    movie={normalizedMovie}
                    upcoming={true}
                  />
                )
              })}
            </div>
          )}

        </div>
      </section>

      <Footer />
    </div>
  )
}