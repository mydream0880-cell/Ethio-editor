import { API_URL } from './sheetdb.js';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('post-job').addEventListener('click', postJob);
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('job-expiry').min = today;
  loadDeliveredProjects();
});

async function postJob() {
  const client = document.getElementById('client-username').value.trim();
  const title = document.getElementById('job-title').value.trim();
  const desc = document.getElementById('job-description').value.trim();
  const expiry = document.getElementById('job-expiry').value;
  const salary = document.getElementById('job-salary').value.trim();

  if (!client || !title || !desc || !expiry || !salary) {
    return showNotification('❌ Fill all fields', 'error');
  }

  if (!client.startsWith('@')) {
    return showNotification('❌ Username must start with @', 'error');
  }

  const job = {
    id: Date.now().toString(),
    client_username: client,
    title,
    description: desc,
    expiry,
    salary,
    status: "posted",
    delivery_link: "",
    editor_telebirr: ""
  };

  try {
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: [job] })
    });
    showNotification('✅ Job posted!', 'success');
    loadDeliveredProjects();
  } catch (e) {
    console.error(e);
    showNotification('❌ Failed to post job', 'error');
  }
}

async function loadDeliveredProjects() {
  const container = document.getElementById('delivered-jobs');
  container.innerHTML = "🔄 Loading...";

  try {
    const res = await fetch(`${API_URL}/search?status=delivered`);
    const jobs = await res.json();

    container.innerHTML = "";
    if (!jobs.length) {
      container.innerHTML = "📦 No deliveries yet";
      return;
    }

    jobs.forEach(job => {
      const div = document.createElement('div');
      div.className = "delivered-card";
      div.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p>💰 ${job.salary} | 📅 ${job.expiry}</p>
        <p>👤 ${job.client_username}</p>
        <p>📱 ${job.editor_telebirr || "—"}</p>
        <p>🔗 <a href="${job.delivery_link}" target="_blank">${job.delivery_link || "—"}</a></p>
      `;
      container.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    container.innerHTML = "❌ Failed to load deliveries";
  }
}

function showNotification(msg, type) {
  alert(msg); // Simple alert for now
}