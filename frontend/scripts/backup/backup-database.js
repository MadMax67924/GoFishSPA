const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

class DatabaseBackup {
  constructor() {
    this.backupDir = path.join(process.cwd(), 'backups');
    this.ensureBackupDirectory();
    this.config = {
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'toki1801',
      database: process.env.DB_NAME || 'gofish'
    };
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log('✅ Carpeta de backups creada:', this.backupDir);
    }
  }

  // Conexión a MySQL
  async getConnection() {
    return await mysql.createConnection(this.config);
  }

  // Ejecutar consulta
  async executeQuery(sql, params = []) {
    const connection = await this.getConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } finally {
      await connection.end();
    }
  }

  // Verificar conexión
  async testConnection() {
    try {
      const connection = await this.getConnection();
      await connection.execute('SELECT 1');
      await connection.end();
      console.log('✅ Conexión a MySQL establecida');
      return true;
    } catch (error) {
      console.error('❌ Error de conexión a MySQL:', error.message);
      return false;
    }
  }

  // Método 1: Backup usando mysqldump (recomendado)
  async backupWithMySQLDump() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupDir, `backup-${timestamp}.sql`);

    const command = `mysqldump -h ${this.config.host} -P ${this.config.port} -u ${this.config.user} -p${this.config.password} ${this.config.database} > "${backupFile}"`;

    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Error en backup con mysqldump:', error);
          reject(error);
        } else {
          console.log(`✅ Backup creado: ${backupFile}`);
          
          // Comprimir el backup
          this.compressBackup(backupFile)
            .then(compressedFile => {
              // Eliminar el archivo SQL original
              fs.unlinkSync(backupFile);
              resolve(compressedFile);
            })
            .catch(compressError => {
              console.error('Error comprimiendo backup:', compressError);
              resolve(backupFile); // Devolver el archivo sin comprimir
            });
        }
      });
    });
  }

  // Método 2: Backup manual con consultas SQL (alternativo)
  async backupManual() {
    try {
      console.log('🔍 Verificando conexión a la base de datos...');
      const isConnected = await this.testConnection();
      
      if (!isConnected) {
        throw new Error('No se pudo conectar a la base de datos');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFile = path.join(this.backupDir, `backup-manual-${timestamp}.sql`);
      
      let backupContent = '';

      // Obtener todas las tablas
      const tables = await this.executeQuery('SHOW TABLES');
      
      backupContent += `-- Backup Manual - GoFish SpA\n`;
      backupContent += `-- Fecha: ${new Date().toLocaleString('es-CL')}\n`;
      backupContent += `-- Base de datos: ${this.config.database}\n\n`;

      for (const table of tables) {
        const tableName = Object.values(table)[0];
        console.log(`📊 Respaldando tabla: ${tableName}`);
        
        // Crear sentencia CREATE TABLE
        const createTable = await this.executeQuery(`SHOW CREATE TABLE \`${tableName}\``);
        backupContent += `\n-- Table structure for table \`${tableName}\`\n`;
        backupContent += `DROP TABLE IF EXISTS \`${tableName}\`;\n`;
        backupContent += `${createTable[0]['Create Table']};\n\n`;
        
        // Obtener datos de la tabla
        const tableData = await this.executeQuery(`SELECT * FROM \`${tableName}\``);
        
        if (tableData.length > 0) {
          backupContent += `-- Dumping data for table \`${tableName}\`\n`;
          backupContent += `INSERT INTO \`${tableName}\` VALUES\n`;
          
          const rows = tableData.map(row => {
            const values = Object.values(row).map(value => {
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              return value;
            });
            return `(${values.join(', ')})`;
          });
          
          backupContent += rows.join(',\n') + ';\n\n';
        }
      }

      // Guardar archivo
      fs.writeFileSync(backupFile, backupContent, 'utf8');
      console.log(`✅ Backup manual creado: ${backupFile}`);
      
      return backupFile;
    } catch (error) {
      console.error('❌ Error en backup manual:', error);
      throw error;
    }
  }

  // Comprimir archivo de backup
  async compressBackup(filePath) {
    return new Promise((resolve, reject) => {
      const compressedFile = `${filePath}.gz`;
      const gzip = require('zlib').createGzip();
      const input = fs.createReadStream(filePath);
      const output = fs.createWriteStream(compressedFile);

      input.pipe(gzip).pipe(output);

      output.on('finish', () => {
        console.log(`✅ Backup comprimido: ${compressedFile}`);
        resolve(compressedFile);
      });

      output.on('error', (error) => {
        reject(error);
      });
    });
  }

  // Limpiar backups antiguos (mantener solo los últimos 30 días)
  async cleanupOldBackups() {
    try {
      const files = fs.readdirSync(this.backupDir);
      const now = Date.now();
      const thirtyDaysAgo = 30 * 24 * 60 * 60 * 1000; // 30 días en milisegundos

      let deletedCount = 0;

      for (const file of files) {
        const filePath = path.join(this.backupDir, file);
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          console.log(`🗑️  Backup eliminado: ${file}`);
          deletedCount++;
        }
      }

      console.log(`✅ Limpieza completada: ${deletedCount} backups antiguos eliminados`);
      return deletedCount;
    } catch (error) {
      console.error('❌ Error en limpieza de backups:', error);
      throw error;
    }
  }

  // Verificar integridad del backup
  async verifyBackup(backupFile) {
    try {
      const stats = fs.statSync(backupFile);
      const fileSize = stats.size;
      
      console.log(`🔍 Verificando backup: ${backupFile}`);
      console.log(`📏 Tamaño del archivo: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      
      if (fileSize === 0) {
        throw new Error('El archivo de backup está vacío');
      }
      
      // Verificar que el archivo no esté corrupto
      if (backupFile.endsWith('.gz')) {
        // Para archivos comprimidos, intentar descomprimir
        const zlib = require('zlib');
        const gunzip = zlib.createGunzip();
        const input = fs.createReadStream(backupFile);
        
        return new Promise((resolve, reject) => {
          input.pipe(gunzip);
          
          gunzip.on('error', (error) => {
            reject(new Error('Backup corrupto o incompleto'));
          });
          
          gunzip.on('end', () => {
            console.log('✅ Backup verificado: archivo no corrupto');
            resolve(true);
          });
        });
      } else {
        // Para archivos SQL, verificar que tenga contenido válido
        const content = fs.readFileSync(backupFile, 'utf8');
        if (!content.includes('CREATE TABLE') && !content.includes('INSERT INTO')) {
          throw new Error('El backup no contiene datos válidos');
        }
        
        console.log('✅ Backup verificado: estructura válida');
        return true;
      }
    } catch (error) {
      console.error('❌ Error verificando backup:', error);
      throw error;
    }
  }
}

// Función principal
async function main() {
  const backup = new DatabaseBackup();
  
  try {
    console.log('🚀 Iniciando proceso de backup...');
    
    let backupFile;
    
    // Intentar con mysqldump primero
    try {
      backupFile = await backup.backupWithMySQLDump();
    } catch (error) {
      console.log('🔄 Mysqldump falló, usando método manual...');
      backupFile = await backup.backupManual();
    }
    
    // Verificar el backup
    await backup.verifyBackup(backupFile);
    
    // Limpiar backups antiguos
    await backup.cleanupOldBackups();
    
    console.log('🎉 Proceso de backup completado exitosamente');
    return backupFile;
  } catch (error) {
    console.error('💥 Error en el proceso de backup:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = DatabaseBackup;