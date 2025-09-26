import { db } from "./firebase.js";
import {
  collection, addDoc, getDocs, query, where, updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

// UI Elements
const jobList = document.getElementById("job-list");
const myProjects = document.getElementById("my-projects");
const btnHome = document.getElementById("btn-home");
const btnMy = document.getElementById("btn-my");

// Navigation
btnHome.addEventListener("click", () => {
  jobList.classList.remove("hidden");
  myProjects.classList.add("hidden");
  btnHome.classList.add("active");
  btnMy.classList.remove("active");
  loadJobs();
});

btnMy.addEventListener("click", () => {
  jobList.classList.add("hidden");
  myProjects.classList.remove("hidden");
  btnMy.classList.add("active");
  btnHome.classList.remove("active");
});

btnHome.click(); // Default view

// Firebase Functions
async function postJob(title, deadline) {
  await addDoc(collection(db, "jobs"), {
    title,
    deadline,
    status: "posted",
    deliverLink: ""
  });
  alert("✅ Job posted!");
  loadJobs();
}

async function loadJobs() {
  jobList.innerHTML = "";
  const q = query(collection(db, "jobs"), where("status", "==", "posted"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    jobList.innerHTML = <p class="empty-state">No available projects. Admin will post jobs here.</p>;
    return;
  }

  snapshot.forEach(docSnap => {
    const job = docSnap.data();
    const jobEl = document.createElement("div");
    jobEl.className = "job";
    jobEl.innerHTML = 
      <div class="job-details">
        <p class="job-title">${job.title}</p>
        <p class="job-deadline">${job.deadline}</p>
      </div>
      <div class="job-actions">
        <button class="nav-btn">Accept</button>
      </div>
    ;
    jobEl.querySelector("button").addEventListener("click", () => acceptJob(docSnap.id, jobEl));
    jobList.appendChild(jobEl);
  });
}

async function acceptJob(jobId, jobEl) {
  await updateDoc(doc(db, "jobs", jobId), { status: "accepted" });
  jobEl.querySelector(".job-actions").innerHTML = <button class="nav-btn">Deliver</button>;
  jobEl.querySelector("button").addEventListener("click", () => deliverJob(jobId, jobEl));
  myProjects.appendChild(jobEl);
  btnMy.click();
}

async function deliverJob(jobId, jobEl) {
  const link = prompt("Paste your delivery link:");
  if (!link) return;
  await updateDoc(doc(db, "jobs", jobId), {
    status: "delivered",
    deliverLink: link
  });
  jobEl.querySelector(".job-actions").remove();
  jobEl.innerHTML += <p><strong>Delivered:</strong> <a href="${link}" target="_blank">View File</a></p>;
  alert("✅ Delivery submitted!");
}

