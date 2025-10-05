import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY

// Verificar que la clave existe y tiene longitud correcta
function getEncryptionKey(): Buffer {
  if (!ENCRYPTION_KEY) {
    throw new Error('ENCRYPTION_KEY no está configurada en las variables de entorno')
  }
  
  // Asegurar que la clave tenga 32 bytes (256 bits)
  return crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32)
}

export interface EncryptedData {
  encrypted: string
  iv: string
  authTag: string
}

export function encryptData(data: string): EncryptedData {
  const key = getEncryptionKey()
  const iv = crypto.randomBytes(16) // Vector de inicialización
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
  
  let encrypted = cipher.update(data, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  const authTag = cipher.getAuthTag()
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  }
}

export function decryptData(encryptedData: EncryptedData): string {
  const key = getEncryptionKey()
  const iv = Buffer.from(encryptedData.iv, 'hex')
  const authTag = Buffer.from(encryptedData.authTag, 'hex')
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Función para hashear datos (para búsquedas)
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

// Función para verificar si el cifrado/descifrado funciona
export function testEncryption(): boolean {
  try {
    const testData = 'datos de prueba'
    const encrypted = encryptData(testData)
    const decrypted = decryptData(encrypted)
    
    return testData === decrypted
  } catch (error) {
    console.error('Error en test de cifrado:', error)
    return false
  }
}