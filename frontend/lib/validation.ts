// Utilidades de validación para casos de uso 2 y 3

export interface ValidationResult {
  isValid: boolean
  message: string
  score?: number
}

// Caso 2: Validar Formato de Correo de Usuario
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, message: "El correo electrónico es requerido" }
  }

  // Expresión regular más robusta para validar email
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

  if (!emailRegex.test(email)) {
    return { isValid: false, message: "El formato del correo electrónico no es válido" }
  }

  // Validaciones adicionales
  if (email.length > 254) {
    return { isValid: false, message: "El correo electrónico es demasiado largo" }
  }

  const [localPart, domain] = email.split("@")
  if (localPart.length > 64) {
    return { isValid: false, message: "La parte local del correo es demasiado larga" }
  }

  // Lista de dominios comunes para sugerencias
  const commonDomains = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com"]
  const domainLower = domain.toLowerCase()

  return { isValid: true, message: "Correo electrónico válido" }
}

// Caso 3: Validar Fuerza de Contraseña de Usuario
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, message: "La contraseña es requerida", score: 0 }
  }

  let score = 0
  const feedback: string[] = []

  // Longitud mínima
  if (password.length < 8) {
    feedback.push("Debe tener al menos 8 caracteres")
  } else {
    score += 1
  }

  // Longitud ideal
  if (password.length >= 12) {
    score += 1
  }

  // Contiene minúsculas
  if (/[a-z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Debe contener al menos una letra minúscula")
  }

  // Contiene mayúsculas
  if (/[A-Z]/.test(password)) {
    score += 1
  } else {
    feedback.push("Debe contener al menos una letra mayúscula")
  }

  // Contiene números
  if (/\d/.test(password)) {
    score += 1
  } else {
    feedback.push("Debe contener al menos un número")
  }

  // Contiene caracteres especiales
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    score += 1
  } else {
    feedback.push("Debe contener al menos un carácter especial")
  }

  // Verificar patrones comunes débiles
  const commonPatterns = [/123456/, /password/i, /qwerty/i, /abc123/i, /admin/i]

  const hasCommonPattern = commonPatterns.some((pattern) => pattern.test(password))
  if (hasCommonPattern) {
    score = Math.max(0, score - 2)
    feedback.push("Evita usar patrones comunes")
  }

  // Determinar el nivel de seguridad
  let strengthLevel: string
  let isValid: boolean

  if (score <= 2) {
    strengthLevel = "Muy débil"
    isValid = false
  } else if (score <= 3) {
    strengthLevel = "Débil"
    isValid = false
  } else if (score <= 4) {
    strengthLevel = "Moderada"
    isValid = true
  } else if (score <= 5) {
    strengthLevel = "Fuerte"
    isValid = true
  } else {
    strengthLevel = "Muy fuerte"
    isValid = true
  }

  const message = isValid
    ? `Contraseña ${strengthLevel.toLowerCase()}`
    : `Contraseña ${strengthLevel.toLowerCase()}: ${feedback.join(", ")}`

  return { isValid, message, score }
}

// Generar token seguro para verificación
export function generateSecureToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

// Validar token de verificación
export function isValidToken(token: string): boolean {
  return /^[a-f0-9]{64}$/.test(token)
}
