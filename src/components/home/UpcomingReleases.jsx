// src/components/home/UpcomingReleases.jsx
export default function UpcomingReleases() {
  const billboardMovies = [1, 2, 3, 4, 5, 6, 7, 8]

  return (
    <section>
      <h3 className="text-[#f4b400] text-2xl md:text-3xl font-bold mb-10">
        Próximos Estrenos
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {billboardMovies.map((i) => (
          <div
            key={i}
            className="aspect-[2/3] bg-white/5 rounded-3xl border border-white/10 shadow-2xl flex items-center justify-center text-gray-500 font-bold text-2xl"
          >
            {i}
          </div>
        ))}
      </div>
    </section>
  )
}
