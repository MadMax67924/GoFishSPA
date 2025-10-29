const DatabaseBackup = require('./backup-database');
const BackupScheduler = require('./backup-scheduler');
const fs = require('fs');
const path = require('path');
const checkDiskSpace = require('check-disk-space');

class BackupMonitor {
  constructor() {
    this.backup = new DatabaseBackup();
    this.scheduler = new BackupScheduler();
    this.logFile = path.join(process.cwd(), 'backups', 'backup-logs.json');
    this.alertThresholds = {
      minDiskSpace: 1 * 1024 * 1024 * 1024, // 1GB mínimo
      maxBackupAge: 24 * 60 * 60 * 1000, // 24 horas máximo
      maxBackupSize: 500 * 1024 * 1024 // 500MB máximo por backup
    };
  }

  // Verificar estado general del sistema
  async checkSystemStatus() {
    const status = {
      database: await this.checkDatabaseConnection(),
      diskSpace: await this.checkDiskSpace(),
      backups: await this.checkBackupsStatus(),
      scheduler: this.checkSchedulerStatus(),
      lastBackup: this.getLastBackupInfo(),
      alerts: []
    };

    // Generar alertas
    if (!status.database.connected) {
      status.alerts.push('❌ No hay conexión a la base de datos');
    }

    if (status.diskSpace.free < this.alertThresholds.minDiskSpace) {
      status.alerts.push(`⚠️  Espacio en disco bajo: ${(status.diskSpace.free / 1024 / 1024 / 1024).toFixed(2)}GB libre`);
    }

    if (status.backups.lastBackupAge > this.alertThresholds.maxBackupAge) {
      status.alerts.push(`⚠️  Último backup muy antiguo: ${this.formatDuration(status.backups.lastBackupAge)}`);
    }

    if (status.backups.total === 0) {
      status.alerts.push('❌ No hay backups existentes');
    }

    status.overall = status.alerts.length === 0 ? 'healthy' : 'warning';

    return status;
  }

  // Verificar conexión a la base de datos
  async checkDatabaseConnection() {
    try {
      const isConnected = await this.backup.testConnection();
      return {
        connected: isConnected,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Verificar espacio en disco
  async checkDiskSpace() {
    try {
      const diskSpace = await checkDiskSpace(process.cwd());
      return {
        free: diskSpace.free,
        size: diskSpace.size,
        used: diskSpace.size - diskSpace.free,
        freePercentage: ((diskSpace.free / diskSpace.size) * 100).toFixed(1)
      };
    } catch (error) {
      return {
        free: 0,
        size: 0,
        used: 0,
        freePercentage: 0,
        error: error.message
      };
    }
  }

  // Verificar estado de los backups
  async checkBackupsStatus() {
    try {
      const backupDir = this.backup.backupDir;
      const files = fs.readdirSync(backupDir)
        .filter(file => file.endsWith('.sql') || file.endsWith('.gz'))
        .map(file => {
          const filePath = path.join(backupDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: stats.size,
            modified: stats.mtime,
            age: Date.now() - stats.mtime.getTime()
          };
        })
        .sort((a, b) => b.modified - a.modified);

      const totalSize = files.reduce((sum, file) => sum + file.size, 0);
      const lastBackup = files[0];

      return {
        total: files.length,
        totalSize,
        lastBackup: lastBackup ? lastBackup.name : null,
        lastBackupAge: lastBackup ? lastBackup.age : Infinity,
        lastBackupSize: lastBackup ? lastBackup.size : 0,
        files
      };
    } catch (error) {
      return {
        total: 0,
        totalSize: 0,
        lastBackup: null,
        lastBackupAge: Infinity,
        lastBackupSize: 0,
        error: error.message
      };
    }
  }

  // Verificar estado del scheduler
  checkSchedulerStatus() {
    const stats = this.scheduler.getBackupStats();
    return {
      running: true, // Asumiendo que el scheduler está corriendo
      totalExecutions: stats.total,
      successRate: stats.total > 0 ? (stats.success / stats.total * 100).toFixed(1) : 0,
      lastExecution: stats.lastBackup
    };
  }

  // Obtener información del último backup
  getLastBackupInfo() {
    const stats = this.scheduler.getBackupStats();
    return stats.lastBackup;
  }

  // Generar reporte de estado
  async generateStatusReport() {
    const status = await this.checkSystemStatus();
    
    console.log('\n📊 REPORTE DE ESTADO - SISTEMA DE BACKUP');
    console.log('=========================================');
    
    // Estado general
    console.log(`\n🏥 ESTADO GENERAL: ${status.overall === 'healthy' ? '✅ SALUDABLE' : '⚠️  CON ALERTAS'}`);
    
    // Base de datos
    console.log('\n🗄️  BASE DE DATOS:');
    console.log(`   Conexión: ${status.database.connected ? '✅ Conectada' : '❌ Desconectada'}`);
    if (status.database.error) {
      console.log(`   Error: ${status.database.error}`);
    }

    // Espacio en disco
    console.log('\n💾 ESPACIO EN DISCO:');
    console.log(`   Libre: ${(status.diskSpace.free / 1024 / 1024 / 1024).toFixed(2)}GB (${status.diskSpace.freePercentage}%)`);
    console.log(`   Usado: ${(status.diskSpace.used / 1024 / 1024 / 1024).toFixed(2)}GB`);
    console.log(`   Total: ${(status.diskSpace.size / 1024 / 1024 / 1024).toFixed(2)}GB`);

    // Backups
    console.log('\n📦 BACKUPS:');
    console.log(`   Total: ${status.backups.total} archivos`);
    console.log(`   Tamaño total: ${(status.backups.totalSize / 1024 / 1024).toFixed(2)}MB`);
    if (status.backups.lastBackup) {
      console.log(`   Último backup: ${status.backups.lastBackup}`);
      console.log(`   Antigüedad: ${this.formatDuration(status.backups.lastBackupAge)}`);
      console.log(`   Tamaño: ${(status.backups.lastBackupSize / 1024 / 1024).toFixed(2)}MB`);
    }

    // Scheduler
    console.log('\n⏰ PROGRAMADOR:');
    console.log(`   Estado: ${status.scheduler.running ? '✅ Ejecutándose' : '❌ Detenido'}`);
    console.log(`   Ejecuciones: ${status.scheduler.totalExecutions}`);
    console.log(`   Tasa de éxito: ${status.scheduler.successRate}%`);
    if (status.scheduler.lastExecution) {
      console.log(`   Última ejecución: ${new Date(status.scheduler.lastExecution.timestamp).toLocaleString('es-CL')}`);
    }

    // Alertas
    if (status.alerts.length > 0) {
      console.log('\n🚨 ALERTAS:');
      status.alerts.forEach(alert => console.log(`   ${alert}`));
    }

    console.log('\n=========================================\n');

    return status;
  }

  // Monitoreo en tiempo real
  startRealTimeMonitoring(interval = 300000) { // 5 minutos por defecto
    console.log('🔍 Iniciando monitoreo en tiempo real...');
    
    setInterval(async () => {
      const status = await this.checkSystemStatus();
      
      if (status.alerts.length > 0) {
        console.log(`\n🚨 [${new Date().toLocaleString('es-CL')}] Alertas detectadas:`);
        status.alerts.forEach(alert => console.log(`   ${alert}`));
        
        // Aquí podrías agregar notificaciones por email, Slack, etc.
        this.sendAlerts(status.alerts);
      } else {
        console.log(`✅ [${new Date().toLocaleString('es-CL')}] Sistema OK`);
      }
    }, interval);
  }

  // Método para enviar alertas (extensible)
  sendAlerts(alerts) {
    // Por ahora solo log, pero puedes extender para:
    // - Enviar email
    // - Enviar a Slack
    // - Enviar SMS
    // etc.
    
    console.log('📢 Enviando alertas...');
    // Ejemplo: enviar email
    // this.sendEmailAlert(alerts);
  }

  // Utilidad: formatear duración
  formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }
}

// Manejo de argumentos de línea de comandos
async function main() {
  const monitor = new BackupMonitor();
  const args = process.argv.slice(2);

  if (args.includes('--status') || args.includes('-s')) {
    // Generar reporte de estado
    await monitor.generateStatusReport();
  } else if (args.includes('--monitor') || args.includes('-m')) {
    // Iniciar monitoreo en tiempo real
    monitor.startRealTimeMonitoring();
    
    // Mantener proceso activo
    console.log('🔄 Monitoreo activo. Presiona Ctrl+C para detener.');
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo monitoreo...');
      process.exit(0);
    });
  } else if (args.includes('--test') || args.includes('-t')) {
    // Ejecutar pruebas rápidas
    console.log('🧪 Ejecutando pruebas del sistema...');
    const status = await monitor.checkSystemStatus();
    console.log('Pruebas completadas. Estado:', status.overall);
  } else {
    // Modo por defecto: reporte único
    console.log('👀 Verificando estado del sistema...');
    await monitor.generateStatusReport();
  }
}

if (require.main === module) {
  main();
}

module.exports = BackupMonitor;