import { createContext, useState } from 'react'
import { registerRequest } from '../services/register.service'

const API_URL = 'http://localhost:3000/api/customers'

export const RegisterContext = createContext()

export const RegisterProvider = ({ children }) => {
  const [step1Data, setStep1Data] = useState(null)

  const saveStep1 = (data) => {
    setStep1Data(data)
  }

  const registerCustomer = async (finalData) => {
    try {
      const res = await registerRequest(finalData)
      return { success: true, data: res }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Error al registrar usuario',
      }
    }
  }

  return (
    <RegisterContext.Provider
      value={{ step1Data, saveStep1, registerCustomer }}
    >
      {children}
    </RegisterContext.Provider>
  )
}
