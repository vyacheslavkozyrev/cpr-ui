/**
 * Offline Queue with IndexedDB
 * Stores failed API requests when offline and retries when back online
 * Feature 0004 - Feedback Request Management - T039
 */

const DB_NAME = 'cpr-offline-queue'
const DB_VERSION = 1
const STORE_NAME = 'pending-requests'

export interface QueuedRequest {
  id: string
  url: string
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  headers?: Record<string, string>
  timestamp: number
  retryCount: number
  maxRetries: number
}

/**
 * Initialize IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
  })
}

/**
 * Add a request to the offline queue
 */
export async function addToQueue(
  request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retryCount'>
): Promise<void> {
  const db = await openDB()

  const queuedRequest: QueuedRequest = {
    ...request,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  }

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const addRequest = store.add(queuedRequest)

    addRequest.onsuccess = () => {
      resolve()
    }

    addRequest.onerror = () => {
      reject(new Error('Failed to add request to queue'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Get all queued requests
 */
export async function getQueuedRequests(): Promise<QueuedRequest[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const getAllRequest = store.getAll()

    getAllRequest.onsuccess = () => {
      resolve(getAllRequest.result || [])
    }

    getAllRequest.onerror = () => {
      reject(new Error('Failed to get queued requests'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Remove a request from the queue
 */
export async function removeFromQueue(id: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const deleteRequest = store.delete(id)

    deleteRequest.onsuccess = () => {
      resolve()
    }

    deleteRequest.onerror = () => {
      reject(new Error('Failed to remove request from queue'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Update a request in the queue (e.g., increment retry count)
 */
export async function updateQueuedRequest(
  request: QueuedRequest
): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const putRequest = store.put(request)

    putRequest.onsuccess = () => {
      resolve()
    }

    putRequest.onerror = () => {
      reject(new Error('Failed to update queued request'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Clear all queued requests
 */
export async function clearQueue(): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    const clearRequest = store.clear()

    clearRequest.onsuccess = () => {
      resolve()
    }

    clearRequest.onerror = () => {
      reject(new Error('Failed to clear queue'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}

/**
 * Get the count of queued requests
 */
export async function getQueueCount(): Promise<number> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const store = transaction.objectStore(STORE_NAME)
    const countRequest = store.count()

    countRequest.onsuccess = () => {
      resolve(countRequest.result)
    }

    countRequest.onerror = () => {
      reject(new Error('Failed to get queue count'))
    }

    transaction.oncomplete = () => {
      db.close()
    }
  })
}
