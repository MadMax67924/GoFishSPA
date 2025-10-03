import { executeQuery } from "@/lib/mysql"

export interface SecurityEvent {
  userId?: number
  email?: string
  eventType: 'failed_login' | 'suspicious_purchase' | 'account_locked' | 'password_reset'
  severity: 'low' | 'medium' | 'high'
  description: string
  ipAddress?: string
  userAgent?: string
}

export async function logSecurityEvent(event: SecurityEvent) {
  try {
    const sql = `
      INSERT INTO security_events (user_id, email, event_type, severity, description, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    
    await executeQuery(sql, [
      event.userId || null,
      event.email || null,
      event.eventType,
      event.severity,
      event.description,
      event.ipAddress || null,
      event.userAgent || null
    ])
    
    console.log('🔒 Evento de seguridad registrado:', {
      type: event.eventType,
      severity: event.severity,
      user: event.email || `ID: ${event.userId}`,
      description: event.description
    })
    
    // Enviar alerta a administrador si es de alta severidad
    if (event.severity === 'high') {
      await sendAdminAlert(event)
    }
    
  } catch (error) {
    console.error('Error registrando evento de seguridad:', error)
  }
}

async function sendAdminAlert(event: SecurityEvent) {
  // En un entorno real, aquí enviarías email/notificación al admin
  console.log('🚨 ALERTA ADMINISTRADOR - Evento de alta severidad:', {
    type: event.eventType,
    severity: event.severity,
    description: event.description,
    user: event.email || `ID: ${event.userId}`,
    ip: event.ipAddress,
    timestamp: new Date().toISOString()
  })
  
  // Aquí podrías integrar con:
  // - Email (nodemailer)
  // - Slack webhook
  // - Sistema de notificaciones interno
}