// admin.js (PocketBase version)
import { pb } from './pocketbase.js';

document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadDeliveredProjects();
});

function setupEventListeners() {
  document.getElementById('post-job').addEventListener('click', postJob);
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('job-expiry').min = today;
}

async function postJob() {
  const client  = document.getElementById('client-username').value.trim();
  const title   = document.getElementById('job-title').value.trim();
  const desc    = document.getElementById('job-description').value.trim();
  const expiry  = document.getElementById('job-expiry').value;
  const salary  = document.getElementById('job-salary').value.trim();
  const btn     = document.getElementById('post-job');
  const orig    = btn.innerHTML;

  if (!client || !title || !desc || !expiry || !salary) {
    return showNotification('❌ Please fill all fields', 'error');
  }
  if (!client.startsWith('@')) {
    return showNotification('❌ Client username must start with @', 'error');
  }

  btn.innerHTML = '🔄 Posting...';
  btn.disabled  = true;

  try {
    await pb.collection('jobs').create({
      client_username: client,
      title,
      description: desc,
      expiry,
      salary,
      status: 'posted'
    });

    showNotification('✅ Job posted successfully!', 'success');
    document.getElementById('post-job-form').reset();
    loadDeliveredProjects();

  } catch (e) {
    console.error(e);
    showNotification('❌ Failed to post job', 'error');
  } finally {
    btn.innerHTML = orig;
    btn.disabled  = false;
  }
}

async function loadDeliveredProjects() {
  const container = document.getElementById('delivered-jobs');
  container.innerHTML = '<div class="loading-state">🔄 Loading deliveries...</div>';

  try {
    const jobs = await pb.collection('jobs').getFullList({
      filter: 'status = "delivered"',
      sort: '-created'
    });

    container.innerHTML = '';
    if (jobs.length === 0) {
      container.innerHTML = '<div class="empty-state">📦 No deliveries yet</div>';
      return;
    }

    jobs.forEach(job => {
      container.appendChild(createDeliveryCard(job));
    });

  } catch (e) {
    console.error(e);
    container.innerHTML = '<div class="empty-state error">❌ Failed to load deliveries</div>';
  }
}

function createDeliveryCard(job) {
  const card = document.createElement('div');
  card.className = 'delivered-card glass-card';
  card.innerHTML = `
    <div class="card-header">
      <h3>${escapeHtml(job.title)}</h3>
      <button class="btn-delete">🗑️</button>
    </div>
    <div class="card-body">
      <p>${escapeHtml(job.description)}</p>
      <div class="project-details">
        <div>📅 ${job.expiry}</div>
        <div>💰 ${escapeHtml(job.salary)}</div>
      </div>
      <div class="info-section">
        <div>👤 ${escapeHtml(job.client_username)}</div>
        <div>📱 ${job.editor_telebirr || 'Not provided'}</div>
        <div>🔗 <a href="${job.delivery_link}" target="_blank">${job.delivery_link || 'No link'}</a></div>
      </div>
    </div>
  `;

  card.querySelector('.btn-delete').addEventListener('click', async () => {
    if (!confirm('🗑️ Delete this project permanently?')) return;
    try {
      await pb.collection('jobs').delete(job.id);
      card.remove();
      showNotification('✅ Project deleted', 'success');
    } catch (e) {
      console.error(e);
      showNotification('❌ Delete failed', 'error');
    }
  });

  return card;
}

function showNotification(msg, type) {
  const n = document.createElement('div');
  n.className    = `notification ${type}`;
  n.innerHTML    = `<span>${msg}</span><button class="notification-close">&times;</button>`;
  document.body.appendChild(n);
  setTimeout(() => n.classList.add('show'), 10);
  n.querySelector('.notification-close').addEventListener('click', () => n.remove());
  setTimeout(() => n.remove(), 5000);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}