const cron = require('node-cron');
const DatabaseBackup = require('./backup-database');
const fs = require('fs');
const path = require('path');

class BackupScheduler {
  constructor() {
    this.backup = new DatabaseBackup();
    this.logFile = path.join(process.cwd(), 'backups', 'backup-logs.json');
    this.initScheduler();
  }

  initScheduler() {
    console.log('⏰ Iniciando programador de backups...');
    
    // Backup diario a las 2:00 AM
    cron.schedule('0 2 * * *', () => {
      console.log('🔄 Ejecutando backup diario programado...');
      this.executeScheduledBackup('daily');
    }, {
      timezone: "America/Santiago"
    });

    // Backup semanal los domingos a las 3:00 AM
    cron.schedule('0 3 * * 0', () => {
      console.log('🔄 Ejecutando backup semanal programado...');
      this.executeScheduledBackup('weekly');
    }, {
      timezone: "America/Santiago"
    });

    // Backup mensual el primer día del mes a las 4:00 AM
    cron.schedule('0 4 1 * *', () => {
      console.log('🔄 Ejecutando backup mensual programado...');
      this.executeScheduledBackup('monthly');
    }, {
      timezone: "America/Santiago"
    });

    console.log('✅ Programador de backups iniciado');
    console.log('📅 Programación:');
    console.log('   - Diario: 2:00 AM');
    console.log('   - Semanal (Dom): 3:00 AM');
    console.log('   - Mensual (Día 1): 4:00 AM');
  }

  async executeScheduledBackup(type) {
    const startTime = Date.now();
    
    try {
      console.log(`\n🔄 Iniciando backup ${type}...`);
      
      const backupFile = await this.backup.backupWithMySQLDump()
        .catch(async () => {
          console.log('🔄 Fallback a backup manual...');
          return await this.backup.backupManual();
        });

      await this.backup.verifyBackup(backupFile);
      await this.backup.cleanupOldBackups();

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Registrar en log
      await this.logBackup({
        type,
        file: backupFile,
        status: 'success',
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      });

      console.log(`✅ Backup ${type} completado en ${duration}s: ${backupFile}`);
      
    } catch (error) {
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      // Registrar error en log
      await this.logBackup({
        type,
        file: null,
        status: 'error',
        error: error.message,
        duration: `${duration}s`,
        timestamp: new Date().toISOString()
      });

      console.error(`❌ Error en backup ${type}:`, error.message);
    }
  }

  async logBackup(entry) {
    try {
      let logs = [];
      
      if (fs.existsSync(this.logFile)) {
        const content = fs.readFileSync(this.logFile, 'utf8');
        logs = JSON.parse(content);
      }
      
      // Mantener solo los últimos 100 logs
      logs.unshift(entry);
      if (logs.length > 100) {
        logs = logs.slice(0, 100);
      }
      
      fs.writeFileSync(this.logFile, JSON.stringify(logs, null, 2));
    } catch (error) {
      console.error('Error guardando log de backup:', error);
    }
  }

  // Método para obtener estadísticas de backups
  getBackupStats() {
    try {
      if (!fs.existsSync(this.logFile)) {
        return { total: 0, success: 0, error: 0, lastBackup: null };
      }
      
      const logs = JSON.parse(fs.readFileSync(this.logFile, 'utf8'));
      const success = logs.filter(log => log.status === 'success').length;
      const error = logs.filter(log => log.status === 'error').length;
      
      return {
        total: logs.length,
        success,
        error,
        lastBackup: logs[0] || null
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return { total: 0, success: 0, error: 0, lastBackup: null };
    }
  }
}

// Iniciar scheduler si se ejecuta directamente
if (require.main === module) {
  const scheduler = new BackupScheduler();
  
  // Mantener el proceso activo
  console.log('🔄 Proceso de backup en ejecución...');
  process.on('SIGINT', () => {
    console.log('🛑 Deteniendo programador de backups...');
    process.exit(0);
  });
}

module.exports = BackupScheduler;