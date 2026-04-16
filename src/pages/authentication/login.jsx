import React from 'react'
import loginImage from '../../assets/images/LoginHD.jpg'
import LoginForm from '../../components/forms/LoginForm'
import logotipo from '../../assets/images/logotype/logoCiineflix.png'
//[linear-gradient(to_bottom,#231640_0%,#7B1A82_18%,#231640_53%,#420946_79%,#231640_87%)]

function Login() {
  return (
    <>
      <div className="bg-[linear-gradient(to_bottom,#231640_0%,#7B1A82_50%,#231640_100%)] min-h-screen flex">
        <div className="w-1/2 flex items-center justify-center pt-16">
          <div className="flex flex-col items-center space-y-6">
            <img src={logotipo} className="w-60 h-auto" alt="logotipo" />
            <h1 className="text-center text-[#D9982F] text-4xl leading-tight font-montserrat font-bold">
              Inicio de sesión
            </h1>
            <p className="text-center text-white text-4lg leading-relaxed font-montserrat max-w-md">
              Accede a tu cuenta para disfrutar de todas las funciones de
              nuestra plataforma
            </p>
            <LoginForm />
            <p className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">
              ¿No tienes cuenta?
              <a href="/register" className="text-[#D9982F] underline">
                Regístrate
              </a>
            </p>
            <p className="text-[#D9982F] text-sm opacity-80 hover:opacity-100">2026. Todos los derechos reservados</p>
          </div>
        </div>
        <div className="w-1/2 flex items-center justify-center">
          <img src={loginImage} className="h-dvh w-full object-cover" alt="login imagen" />
        </div>
      </div>
    </>
  )
}

export default Login
