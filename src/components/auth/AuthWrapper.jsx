"use client"

import { useState } from "react"
import { Login } from "./Login"
import { Register } from "./Register"

export function AuthWrapper() {
  const [isLogin, setIsLogin] = useState(true)

  const toggleMode = () => {
    setIsLogin(!isLogin)
  }

  return isLogin ? <Login onToggleMode={toggleMode} /> : <Register onToggleMode={toggleMode} />
}
