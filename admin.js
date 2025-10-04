// admin.js - SUPABASE VERSION
import { supabase } from './supabase.js'

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners()
  loadDeliveredProjects()
})

function setupEventListeners() {
  document.getElementById('post-job').addEventListener('click', postJob)
  
  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0]
  document.getElementById('job-expiry').min = today
}

async function postJob() {
  const client = document.getElementById('client-username').value.trim()
  const title = document.getElementById('job-title').value.trim()
  const desc = document.getElementById('job-description').value.trim()
  const expiry = document.getElementById('job-expiry').value
  const salary = document.getElementById('job-salary').value.trim()
  const button = document.getElementById('post-job')
  const originalText = button.innerHTML

  if (!client || !title || !desc || !expiry || !salary) {
    showNotification('❌ Please fill all fields', 'error')
    return
  }

  if (!client.startsWith('@')) {
    showNotification('❌ Username must start with @', 'error')
    return
  }

  button.innerHTML = 'Posting...'
  button.disabled = true

  try {
    const { error } = await supabase
      .from('Jobs')
      .insert([{
        client_username: client,
        title: title,
        description: desc,
        expiry: expiry,
        salary: salary,
        status: 'posted'
      }])

    if (error) throw error

    showNotification('✅ Job posted successfully!', 'success')
    
    // Clear form
    document.getElementById('client-username').value = ''
    document.getElementById('job-title').value = ''
    document.getElementById('job-description').value = ''
    document.getElementById('job-expiry').value = ''
    document.getElementById('job-salary').value = ''
    
    loadDeliveredProjects()
    
  } catch (error) {
    console.error('Error posting job:', error)
    showNotification('❌ Failed to post job', 'error')
  } finally {
    button.innerHTML = originalText
    button.disabled = false
  }
}

async function loadDeliveredProjects() {
  const container = document.getElementById('delivered-jobs')
  container.innerHTML = '<div class="loading-state">Loading deliveries...</div>'

  try {
    const { data: jobs, error } = await supabase
      .from('Jobs')
      .select('*')
      .eq('status', 'delivered')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    container.innerHTML = ''
    
    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<div class="empty-state">📦 No deliveries yet</div>'
      return
    }
    
    jobs.forEach(job => {
      container.appendChild(createDeliveryCard(job))
    })
    
  } catch (error) {
    console.error('Error loading deliveries:', error)
    container.innerHTML = '<div class="empty-state error">❌ Failed to load deliveries</div>'
  }
}

function createDeliveryCard(job) {
  const card = document.createElement('div')
  card.className = 'delivered-card glass-card'
  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(job.title)}</h3>
      <button class="btn-delete">🗑️</button>
    </div>
    
    <div class="card-body">
      <p class="card-description">${escapeHtml(job.description)}</p>
      
      <div class="project-details">
        <div class="detail-row">
          <span class="detail-label">📅 Expiry:</span>
          <span class="detail-value">${job.expiry}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">💰 Salary:</span>
          <span class="detail-value">${escapeHtml(job.salary)}</span>
        </div>
      </div>

      <div class="info-section">
        <div class="info-item">
          <label>👤 Client Telegram</label>
          <div class="copy-field">
            <span class="copy-text">${escapeHtml(job.client_username)}</span>
            <button class="btn-copy" data-text="${escapeHtml(job.client_username)}">📋</button>
          </div>
        </div>
        
        <div class="info-item">
          <label>📱 Editor Telebirr</label>
          <div class="copy-field">
            <span class="copy-text">${job.editor_telebirr || 'Not provided'}</span>
            <button class="btn-copy" data-text="${job.editor_telebirr}">📋</button>
          </div>
        </div>
        
        <div class="info-item">
          <label>🔗 Drive Link</label>
          <div class="copy-field">
            <a href="${job.delivery_link}" target="_blank" class="drive-link">${job.delivery_link || 'No link'}</a>
            <button class="btn-copy" data-text="${job.delivery_link}">📋</button>
          </div>
        </div>
      </div>
    </div>
  `

  // Copy buttons
  card.querySelectorAll('.btn-copy').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.getAttribute('data-text')
      if (!text) return
      
      try {
        await navigator.clipboard.writeText(text)
        const original = btn.innerHTML
        btn.innerHTML = '✅'
        setTimeout(() => btn.innerHTML = original, 2000)
      } catch (error) {
        showNotification('❌ Copy failed', 'error')
      }
    })
  })

  // Delete button
  card.querySelector('.btn-delete').addEventListener('click', async () => {
    if (!confirm('🗑️ Delete this project?')) return
    
    try {
      const { error } = await supabase
        .from('Jobs')
        .delete()
        .eq('id', job.id)

      if (error) throw error
      
      card.style.animation = 'slideOut 0.3s forwards'
      setTimeout(() => card.remove(), 300)
      showNotification('✅ Project deleted', 'success')
      
    } catch (error) {
      console.error('Error deleting:', error)
      showNotification('❌ Delete failed', 'error')
    }
  })

  return card
}

function showNotification(message, type) {
  const notification = document.createElement('div')
  notification.className = `notification ${type}`
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `
  
  document.body.appendChild(notification)
  setTimeout(() => notification.classList.add('show'), 10)
  
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove()
  })
  
  setTimeout(() => notification.remove(), 5000)
}

function escapeHtml(text) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}