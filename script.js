import { db } from "./firebase.js";
import {
  collection, getDocs, query, where,
  updateDoc, doc
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

const jobList     = document.getElementById("job-list");
const myProjects  = document.getElementById("my-projects");
const btnHome     = document.getElementById("btn-home");
const btnMy       = document.getElementById("btn-my");

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
  const q = query(collection(db, "jobs"), where("status", "==", "posted"));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    jobList.innerHTML = `<p class="empty-state">No available projects. Admin will post jobs here.</p>`;
    return;
  }

  snapshot.forEach(docSnap => {
    const job = docSnap.data();
    const el = document.createElement("div");
    el.className = "job-card";
    el.innerHTML = `
      <h3>${job.title}</h3>
      <p>${job.description}</p>
      <p><strong>Expiry:</strong> ${job.expiry}</p>
      <p><strong>Salary:</strong> ${job.salary}</p>
      <button class="nav-btn">✅ Accept</button>
    `;
    el.querySelector("button").addEventListener("click", () =>
      acceptJob(docSnap.id, job, el)
    );
    jobList.appendChild(el);
  });
}

async function acceptJob(jobId, job, el) {
  await updateDoc(doc(db, "jobs", jobId), { status: "accepted" });
  el.querySelector("button").remove();
  const deliverBtn = document.createElement("button");
  deliverBtn.className = "nav-btn";
  deliverBtn.innerText = "📤 Submit";
  deliverBtn.addEventListener("click", () => deliverJob(jobId));
  el.appendChild(deliverBtn);
  myProjects.appendChild(el);
  btnMy.click();
}

async function deliverJob(jobId) {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "video/*";
  fileInput.click();

  fileInput.onchange = async () => {
    const file = fileInput.files[0];
    if (!file) return;

    const telebirr = prompt("📱 Enter your Telebirr number:");
    if (!telebirr) return;

    const storageRef = `deliveries/${jobId}/${file.name}`;
    const res = await fetch("https://firebasestorage.googleapis.com/v0/b/ethio-editor.appspot.com/o/" + encodeURIComponent(storageRef) + "?uploadType=media", {
      method: "POST",
      headers: {
        "Content-Type": file.type
      },
      body: file
    });

    const json = await res.json();
    const downloadURL = `https://firebasestorage.googleapis.com/v0/b/ethio-editor.appspot.com/o/${encodeURIComponent(storageRef)}?alt=media`;

    await updateDoc(doc(db, "jobs", jobId), {
      status: "delivered",
      deliverLink: downloadURL,
      editorTelebirr: telebirr
    });

    alert("✅ Delivery submitted!");
  };
                                                }
