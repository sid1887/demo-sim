import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './NotificationSystem.css'

const NOTIFICATION_TYPES = {
  success: { icon: '✅', color: '#10b981', bgColor: '#dcfce7' },
  error: { icon: '❌', color: '#ef4444', bgColor: '#fee2e2' },
  warning: { icon: '⚠️', color: '#f59e0b', bgColor: '#fef3c7' },
  info: { icon: 'ℹ️', color: '#3b82f6', bgColor: '#dbeafe' },
  simulation: { icon: '⚡', color: '#8b5cf6', bgColor: '#ede9fe' },
  circuit: { icon: '🔧', color: '#06b6d4', bgColor: '#cffafe' }
}

let notificationId = 0
let notificationQueue = []
let notificationListeners = []

export const notify = {
  success: (message, options = {}) => addNotification('success', message, options),
  error: (message, options = {}) => addNotification('error', message, options),
  warning: (message, options = {}) => addNotification('warning', message, options),
  info: (message, options = {}) => addNotification('info', message, options),
  simulation: (message, options = {}) => addNotification('simulation', message, options),
  circuit: (message, options = {}) => addNotification('circuit', message, options)
}

function addNotification(type, message, options = {}) {
  const notification = {
    id: ++notificationId,
    type,
    message,
    duration: options.duration || 4000,
    persistent: options.persistent || false,
    action: options.action,
    timestamp: Date.now()
  }
  
  notificationQueue.push(notification)
  notificationListeners.forEach(listener => listener([...notificationQueue]))
  
  if (!notification.persistent && notification.duration > 0) {
    setTimeout(() => {
      removeNotification(notification.id)
    }, notification.duration)
  }
  
  return notification.id
}

function removeNotification(id) {
  notificationQueue = notificationQueue.filter(n => n.id !== id)
  notificationListeners.forEach(listener => listener([...notificationQueue]))
}

function Notification({ notification, onClose }) {
  const config = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="notification"
      style={{ 
        backgroundColor: config.bgColor,
        borderLeft: `4px solid ${config.color}`
      }}
    >
      <div className="notification-content">
        <div className="notification-icon">{config.icon}</div>
        <div className="notification-message">{notification.message}</div>
      </div>
      
      {notification.action && (
        <button 
          className="notification-action"
          onClick={() => {
            notification.action.onClick()
            onClose()
          }}
        >
          {notification.action.label}
        </button>
      )}
      
      <button 
        className="notification-close"
        onClick={onClose}
        aria-label="Close notification"
      >
        ×
      </button>
    </motion.div>
  )
}

export default function NotificationSystem() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    notificationListeners.push(setNotifications)
    return () => {
      notificationListeners = notificationListeners.filter(l => l !== setNotifications)
    }
  }, [])

  return (
    <div className="notification-container">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            notification={notification}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}

// Simulation-specific helpers
export const simulationNotify = {
  started: () => notify.simulation('🔬 Starting simulation...', { duration: 2000 }),
  success: (nodeCount, time) => notify.success(
    `✅ Simulation completed! Found ${nodeCount} node voltages in ${time}ms`, 
    { duration: 5000 }
  ),
  error: (error) => notify.error(`❌ Simulation failed: ${error}`, { duration: 8000 }),
  warning: (warning) => notify.warning(`⚠️ ${warning}`, { duration: 6000 })
}

// Circuit-specific helpers
export const circuitNotify = {
  componentAdded: (type) => notify.circuit(`Added ${type} to circuit`, { duration: 2000 }),
  componentSelected: (name) => notify.info(`Selected ${name}`, { duration: 1500 }),
  circuitCleared: () => notify.info('Canvas cleared', { duration: 2000 }),
  exampleLoaded: (name) => notify.success(`Loaded ${name}`, { duration: 3000 })
}