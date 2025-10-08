// script.js
import { API_URL } from './sheetdb.js';

let currentJobId = null;

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-home').addEventListener('click', loadHomePage);
  document.getElementById('btn-my').addEventListener('click', loadMyProjects);
  document.getElementById('submit-delivery').addEventListener('click', submitDelivery);
  document.getElementById('cancel-delivery').addEventListener('click', closeModal);
  document.querySelector('.close-modal').addEventListener('click', closeModal);
  document.getElementById('delivery-modal').addEventListener('click', e => {
    if (e.target.id === 'delivery-modal') closeModal();
  });
  loadHomePage();
});

async function loadHomePage() {
  const cont = document.getElementById('jobs-container');
  cont.innerHTML = "🔄 Loading jobs...";

  try {
    const res = await fetch(`${API_URL}/search?status=posted`);
    const jobs = await res.json();

    cont.innerHTML = "";
    if (!jobs.length) {
      cont.innerHTML = "📭 No jobs available";
      return;
    }

    jobs.forEach(job => {
      const div = document.createElement('div');
      div.className = "job-card";
      div.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <p>💰 ${job.salary} | 📅 ${job.expiry}</p>
        <button>✅ Accept</button>
      `;
      div.querySelector('button').addEventListener('click', () => acceptJob(job.id));
      cont.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    cont.innerHTML = "❌ Failed to load jobs";
  }
}

async function loadMyProjects() {
  const cont = document.getElementById('projects-container');
  cont.innerHTML = "🔄 Loading projects...";

  try {
    const res = await fetch(`${API_URL}/search?status=accepted`);
    const jobs = await res.json();

    cont.innerHTML = "";
    if (!jobs.length) {
      cont.innerHTML = "📁 No projects yet";
      return;
    }

    jobs.forEach(job => {
      const div = document.createElement('div');
      div.className = "project-card";
      div.innerHTML = `
        <h3>${job.title}</h3>
        <p>${job.description}</p>
        <button>🚀 Submit</button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        currentJobId = job.id;
        document.getElementById('delivery-modal').classList.remove('hidden');
      });
      cont.appendChild(div);
    });
  } catch (e) {
    console.error(e);
    cont.innerHTML = "❌ Failed to load projects";
  }
}

async function acceptJob(id) {
  await fetch(`${API_URL}/id/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "accepted" })
  });
  loadHomePage();
}

async function submitDelivery() {
  const link = document.getElementById('drive-link').value.trim();
  const tel = document.getElementById('telebirr-number').value.trim();

  if (!link || !/^09\d{8}$/.test(tel)) {
    alert("❌ Invalid link or Telebirr number");
    return;
  }

  await fetch(`${API_URL}/id/${currentJobId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      status: "delivered",
      delivery_link: link,
      editor_telebirr: tel
    })
  });

  document.getElementById('delivery-modal').classList.add('hidden');
  loadMyProjects();
}

function closeModal() {
  document.getElementById('delivery-modal').classList.add('hidden');
  currentJobId = null;
}