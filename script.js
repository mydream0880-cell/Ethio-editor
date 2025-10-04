// script.js - SUPABASE VERSION
import { supabase } from './supabase.js'

let currentJobId = null

document.addEventListener('DOMContentLoaded', function() {
  setupEventListeners()
  loadHomePage()
})

function setupEventListeners() {
  document.getElementById('btn-home').addEventListener('click', loadHomePage)
  document.getElementById('btn-my').addEventListener('click', loadMyProjects)
  document.getElementById('submit-delivery').addEventListener('click', submitDelivery)
  document.getElementById('cancel-delivery').addEventListener('click', closeModal)
  document.querySelector('.close-modal').addEventListener('click', closeModal)
  
  document.getElementById('delivery-modal').addEventListener('click', function(e) {
    if (e.target.id === 'delivery-modal') closeModal()
  })
}

async function loadHomePage() {
  updateNavigation('home')
  const container = document.getElementById('jobs-container')
  container.innerHTML = '<div class="loading-state">Loading jobs...</div>'

  try {
    const { data: jobs, error } = await supabase
      .from('Jobs')
      .select('*')
      .eq('status', 'posted')
      .order('expiry', { ascending: true })

    if (error) throw error
    
    container.innerHTML = ''
    
    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<div class="empty-state">📭 No jobs available</div>'
      return
    }
    
    jobs.forEach(job => {
      container.appendChild(createJobCard(job, 'available'))
    })
    
  } catch (error) {
    console.error('Error loading jobs:', error)
    container.innerHTML = '<div class="empty-state error">❌ Failed to load jobs</div>'
  }
}

async function loadMyProjects() {
  updateNavigation('my-projects')
  const container = document.getElementById('projects-container')
  container.innerHTML = '<div class="loading-state">Loading projects...</div>'

  try {
    const { data: jobs, error } = await supabase
      .from('Jobs')
      .select('*')
      .eq('status', 'accepted')
      .order('expiry', { ascending: true })

    if (error) throw error
    
    container.innerHTML = ''
    
    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<div class="empty-state">📁 No projects yet</div>'
      return
    }
    
    jobs.forEach(job => {
      container.appendChild(createJobCard(job, 'accepted'))
    })
    
  } catch (error) {
    console.error('Error loading projects:', error)
    container.innerHTML = '<div class="empty-state error">❌ Failed to load projects</div>'
  }
}

function createJobCard(job, type) {
  const card = document.createElement('div')
  card.className = `job-card ${type}-card`
  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(job.title)}</h3>
      <div class="card-badge ${type}">${type === 'available' ? '📋 Available' : '✅ Accepted'}</div>
    </div>
    <div class="card-body">
      <p class="card-description">${escapeHtml(job.description)}</p>
      <div class="card-details">
        <div class="detail-item">
          <span class="detail-icon">📅</span>
          <span class="detail-text">${job.expiry}</span>
        </div>
        <div class="detail-item">
          <span class="detail-icon">💰</span>
          <span class="detail-text">${escapeHtml(job.salary)}</span>
        </div>
      </div>
    </div>
    <div class="card-footer">
      ${type === 'available' ? 
        '<button class="btn-accept">✅ Accept Job</button>' : 
        '<button class="btn-submit">🚀 Submit Project</button>'
      }
    </div>
  `

  const button = card.querySelector(type === 'available' ? '.btn-accept' : '.btn-submit')
  button.addEventListener('click', () => {
    if (type === 'available') {
      acceptJob(job.id, card)
    } else {
      openDeliveryModal(job.id, card)
    }
  })

  return card
}

async function acceptJob(jobId, card) {
  const button = card.querySelector('.btn-accept')
  const originalText = button.innerHTML
  
  button.innerHTML = 'Accepting...'
  button.disabled = true
  
  try {
    const { error } = await supabase
      .from('Jobs')
      .update({ status: 'accepted' })
      .eq('id', jobId)

    if (error) throw error
    
    showNotification('✅ Job accepted!', 'success')
    card.remove()
    loadHomePage()
    
  } catch (error) {
    console.error('Error accepting job:', error)
    button.innerHTML = originalText
    button.disabled = false
    showNotification('❌ Failed to accept job', 'error')
  }
}

function openDeliveryModal(jobId, card) {
  currentJobId = jobId
  document.getElementById('delivery-modal').classList.remove('hidden')
  document.getElementById('drive-link').value = ''
  document.getElementById('telebirr-number').value = ''
}

function closeModal() {
  document.getElementById('delivery-modal').classList.add('hidden')
  currentJobId = null
}

async function submitDelivery() {
  const driveLink = document.getElementById('drive-link').value.trim()
  const telebirr = document.getElementById('telebirr-number').value.trim()
  const button = document.getElementById('submit-delivery')
  const originalText = button.innerHTML

  if (!driveLink) {
    showNotification('🔗 Please enter Drive link', 'error')
    return
  }

  if (!/^09\d{8}$/.test(telebirr)) {
    showNotification('📱 Telebirr must be 10 digits starting with 09', 'error')
    return
  }

  button.innerHTML = 'Submitting...'
  button.disabled = true

  try {
    const { error } = await supabase
      .from('Jobs')
      .update({ 
        status: 'delivered',
        delivery_link: driveLink,
        editor_telebirr: telebirr
      })
      .eq('id', currentJobId)

    if (error) throw error

    showNotification('🎉 Project submitted!', 'success')
    closeModal()
    loadMyProjects()
    
  } catch (error) {
    console.error('Error submitting:', error)
    showNotification('❌ Submission failed', 'error')
  } finally {
    button.innerHTML = originalText
    button.disabled = false
  }
}

function updateNavigation(active) {
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'))
  document.querySelectorAll('section').forEach(sec => sec.classList.remove('active'))
  
  if (active === 'home') {
    document.getElementById('btn-home').classList.add('active')
    document.getElementById('job-list').classList.add('active')
  } else {
    document.getElementById('btn-my').classList.add('active')
    document.getElementById('my-projects').classList.add('active')
  }
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