<script type="module">
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
  import { getDatabase } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

  const firebaseConfig = {
    apiKey: "AIzaSyDDgQT6W2OULkePu9KMlfc04u8v2We40OI",
    authDomain: "ethio-editor.firebaseapp.com",
    databaseURL: "https://ethio-editor-default-rtdb.firebaseio.com",
    projectId: "ethio-editor",
    storageBucket: "ethio-editor.appspot.com",
    messagingSenderId: "480278426413",
    appId: "1:480278426413:web:e7daa9e7ec76db50f819a4",
    measurementId: "G-8CH4HXS95B"
  };

  const app = initializeApp(firebaseConfig);
  const db = getDatabase(app);

  window.__db = db; // Make it globally available
</script>