// Función utilitaria para extraer el ID de cualquier enlace de YouTube
const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export function TrailerPlayer({ url }) {
  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="w-full aspect-video bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center text-gray-400 italic">
        Tráiler oficial no disponible por el momento
      </div>
    );
  }

  return (
    <div className="w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <iframe
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${videoId}?rel=0`}
        title="YouTube trailer player"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      ></iframe>
    </div>
  );
}