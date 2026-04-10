import profileImage from '../../../assets/images/Profile'
import ProfileForm from '../../components/forms/ProfileForm' // Podrías separar el form luego

function Profile() {
  return (
    <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)] min-h-screen flex">
      {/* Lado Izquierdo - Imagen */}
      <div className="w-1/2 flex items-center justify-center">
        <img
          src={profileImage}
          className="w-full h-full object-cover"
          alt="perfil imagen"
        />
      </div>

      {/* Lado Derecho - Contenido */}
      <div className="w-1/2 flex items-start justify-center pt-12 overflow-y-auto">
        <div className="flex flex-col items-center space-y-4 w-full px-10">
          <h1 className="text-center text-[#D9982F] text-4xl font-montserrat font-bold">
            Perfil
          </h1>
          <p className="text-center text-white text-lg font-montserrat">
            Tu espacio, tu identidad.
          </p>
          
          {/* Formulario*/}
          <div className="w-full max-w-md bg-white/5 p-8 rounded-xl backdrop-blur-sm">
             {/* Simulación del formulario */}
             <form className="space-y-6 text-white">
                <div className="flex gap-4">
                   <div className="flex-1 border-b border-gray-500">
                      <label className="block text-[10px] uppercase text-gray-400">Nombre</label>
                      <p className="py-1">Yessea</p>
                   </div>
                   <div className="flex-1 border-b border-gray-500">
                      <label className="block text-[10px] uppercase text-gray-400">Apellido</label>
                      <p className="py-1">Parra</p>
                   </div>
                </div>
                
                <div className="flex gap-4 pt-4">
                   <button className="flex-1 border border-white rounded-full py-2">Volver</button>
                   <button className="flex-1 bg-[#D9982F] text-[#231640] font-bold rounded-full py-2">Guardar</button>
                </div>
             </form>
          </div>

          <p className="text-white/60 text-xs pt-4">2026. Todos los derechos reservados</p>
        </div>
      </div>
    </div>
  )
}

export default Profile