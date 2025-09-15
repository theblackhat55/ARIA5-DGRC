// ARIA5.1 - Linux Storage Service (File System)
import { writeFile, readFile, unlink, mkdir, stat, readdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join, extname, basename } from 'path'
import { randomUUID } from 'crypto'

export class StorageService {
  private baseDir: string
  private initialized = false

  constructor() {
    this.baseDir = process.env.STORAGE_PATH || './uploads'
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    try {
      // Ensure uploads directory exists
      if (!existsSync(this.baseDir)) {
        await mkdir(this.baseDir, { recursive: true })
      }

      // Create subdirectories for organization
      const subdirs = ['documents', 'images', 'reports', 'evidence', 'temp']
      for (const subdir of subdirs) {
        const path = join(this.baseDir, subdir)
        if (!existsSync(path)) {
          await mkdir(path, { recursive: true })
        }
      }

      this.initialized = true
      console.log('📁 Storage service initialized at:', this.baseDir)
    } catch (error) {
      console.error('❌ Storage service initialization failed:', error)
      throw error
    }
  }

  // R2-compatible interface methods
  async put(key: string, data: ArrayBuffer | Buffer | Uint8Array, options?: {
    contentType?: string
    metadata?: Record<string, string>
  }): Promise<void> {
    await this.initialize()

    try {
      const filePath = this.getFilePath(key)
      const dir = filePath.substring(0, filePath.lastIndexOf('/'))
      
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true })
      }

      await writeFile(filePath, Buffer.from(data))

      // Store metadata if provided
      if (options?.metadata || options?.contentType) {
        const metaPath = filePath + '.meta'
        const metadata = {
          contentType: options?.contentType || 'application/octet-stream',
          uploadedAt: new Date().toISOString(),
          size: data.byteLength,
          ...options?.metadata
        }
        await writeFile(metaPath, JSON.stringify(metadata, null, 2))
      }

      console.log('📁 File stored:', key)
    } catch (error) {
      console.error('Storage put error:', error)
      throw error
    }
  }

  async get(key: string): Promise<{
    body: ReadableStream | null
    arrayBuffer(): Promise<ArrayBuffer>
    text(): Promise<string>
    json(): Promise<any>
  } | null> {
    await this.initialize()

    try {
      const filePath = this.getFilePath(key)
      
      if (!existsSync(filePath)) {
        return null
      }

      const buffer = await readFile(filePath)
      
      return {
        body: null, // Simplified for now
        arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        text: async () => buffer.toString('utf8'),
        json: async () => JSON.parse(buffer.toString('utf8'))
      }
    } catch (error) {
      console.error('Storage get error:', error)
      return null
    }
  }

  async delete(key: string): Promise<void> {
    await this.initialize()

    try {
      const filePath = this.getFilePath(key)
      const metaPath = filePath + '.meta'
      
      if (existsSync(filePath)) {
        await unlink(filePath)
      }
      
      if (existsSync(metaPath)) {
        await unlink(metaPath)
      }

      console.log('📁 File deleted:', key)
    } catch (error) {
      console.error('Storage delete error:', error)
      throw error
    }
  }

  async list(options?: { prefix?: string; limit?: number }): Promise<{
    objects: Array<{ key: string; size: number; uploaded: Date }>
  }> {
    await this.initialize()

    try {
      const objects = []
      const files = await this.listFilesRecursive(this.baseDir)
      
      for (const file of files) {
        const relativePath = file.replace(this.baseDir + '/', '')
        
        // Skip metadata files
        if (relativePath.endsWith('.meta')) continue
        
        // Apply prefix filter
        if (options?.prefix && !relativePath.startsWith(options.prefix)) continue
        
        try {
          const stats = await stat(file)
          objects.push({
            key: relativePath,
            size: stats.size,
            uploaded: stats.mtime
          })
        } catch (error) {
          // Skip files that can't be accessed
          continue
        }
        
        // Apply limit
        if (options?.limit && objects.length >= options.limit) break
      }
      
      return { objects }
    } catch (error) {
      console.error('Storage list error:', error)
      return { objects: [] }
    }
  }

  // File management methods
  async saveFile(file: File, category: string = 'documents'): Promise<string> {
    await this.initialize()

    const fileId = randomUUID()
    const extension = extname(file.name) || ''
    const key = `${category}/${fileId}${extension}`
    
    const arrayBuffer = await file.arrayBuffer()
    
    await this.put(key, arrayBuffer, {
      contentType: file.type,
      metadata: {
        originalName: file.name,
        size: file.size.toString()
      }
    })

    return fileId
  }

  async getFile(fileId: string): Promise<{
    buffer: Buffer
    filename: string
    mimeType: string
  } | null> {
    await this.initialize()

    try {
      // Try to find the file in any category
      const categories = ['documents', 'images', 'reports', 'evidence', 'temp']
      
      for (const category of categories) {
        const files = await readdir(join(this.baseDir, category)).catch(() => [])
        const matchingFile = files.find(f => f.startsWith(fileId))
        
        if (matchingFile) {
          const filePath = join(this.baseDir, category, matchingFile)
          const metaPath = filePath + '.meta'
          
          const buffer = await readFile(filePath)
          
          let metadata = {
            contentType: 'application/octet-stream',
            originalName: matchingFile
          }
          
          if (existsSync(metaPath)) {
            try {
              const metaContent = await readFile(metaPath, 'utf8')
              metadata = { ...metadata, ...JSON.parse(metaContent) }
            } catch (error) {
              // Use defaults if metadata is corrupted
            }
          }
          
          return {
            buffer,
            filename: metadata.originalName || matchingFile,
            mimeType: metadata.contentType || 'application/octet-stream'
          }
        }
      }
      
      return null
    } catch (error) {
      console.error('Get file error:', error)
      return null
    }
  }

  async getFileUrl(key: string): Promise<string> {
    // In a local setup, return a direct file serving URL
    return `/api/files/${key}`
  }

  // Helper methods
  private getFilePath(key: string): string {
    // Sanitize key to prevent directory traversal
    const sanitizedKey = key.replace(/\.\./g, '').replace(/^\/+/, '')
    return join(this.baseDir, sanitizedKey)
  }

  private async listFilesRecursive(dir: string): Promise<string[]> {
    const files = []
    
    try {
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = join(dir, entry.name)
        
        if (entry.isDirectory()) {
          const subFiles = await this.listFilesRecursive(fullPath)
          files.push(...subFiles)
        } else {
          files.push(fullPath)
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
    
    return files
  }

  // Storage statistics
  async getStats(): Promise<{
    totalFiles: number
    totalSize: number
    categories: Record<string, { files: number; size: number }>
  }> {
    await this.initialize()

    const stats = {
      totalFiles: 0,
      totalSize: 0,
      categories: {} as Record<string, { files: number; size: number }>
    }

    try {
      const categories = await readdir(this.baseDir, { withFileTypes: true })
      
      for (const category of categories) {
        if (!category.isDirectory()) continue
        
        const categoryPath = join(this.baseDir, category.name)
        const files = await readdir(categoryPath)
        
        let categorySize = 0
        let fileCount = 0
        
        for (const file of files) {
          if (file.endsWith('.meta')) continue // Skip metadata files
          
          try {
            const filePath = join(categoryPath, file)
            const fileStat = await stat(filePath)
            categorySize += fileStat.size
            fileCount++
          } catch (error) {
            // Skip files that can't be accessed
          }
        }
        
        stats.categories[category.name] = {
          files: fileCount,
          size: categorySize
        }
        
        stats.totalFiles += fileCount
        stats.totalSize += categorySize
      }
    } catch (error) {
      console.error('Storage stats error:', error)
    }

    return stats
  }

  // Cleanup
  async cleanup(): Promise<void> {
    console.log('📁 Storage service cleanup completed')
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📁 Storage service shutting down...')
})

process.on('SIGINT', () => {
  console.log('📁 Storage service shutting down...')
})