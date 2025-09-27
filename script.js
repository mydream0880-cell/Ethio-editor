import { db } from "./firebase.js";
import {
  collection, getDocs, query, where,
  updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const jobList   = document.getElementById("job-list");
const myProjects= document.getElementById("my-projects");
const btnHome   = document.getElementById("btn-home");
const btnMy     = document.getElementById("btn-my");

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

btnHome.click();

async function loadJobs() {
  jobList.innerHTML = "";
  const q        = query(collection(db, "jobs"), where("status","==","posted"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    jobList.innerHTML = `<p class="empty-state">No available projects. Admin will post jobs here.</p>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const job = docSnap.data();
    const el  = document.createElement("div");
    el.innerHTML = `
      <p><strong>${job.title}</strong> (Deadline: ${job.deadline})</p>
      <button class="nav-btn">Accept</button>
    `;
    el.querySelector("button").addEventListener("click", () => acceptJob(docSnap.id, el));
    jobList.appendChild(el);
  });
}

async function acceptJob(id, el) {
  await updateDoc(doc(db,"jobs",id),{status:"accepted"});
  el.querySelector("button").innerText = "Deliver";
  el.querySelector("button").onclick = () => deliverJob(id, el);
  myProjects.appendChild(el);
  btnMy.click();
}

async function deliverJob(id, el) {
  const link    = prompt("Paste your delivery link:");
  const telebirr= prompt("Enter your Telebirr number:");
  if (!link||!telebirr) return;
  await updateDoc(doc(db,"jobs",id), {
    status:"delivered",
    deliverLink:link,
    editorTelebirr:telebirr
  });
  el.remove();
  alert("✅ Delivery submitted!");
}
