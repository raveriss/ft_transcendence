// frontend/static/js/social.js
console.log("✅ social.js chargé !");
  
  // 🔍 Charger tous les utilisateurs (hors amis et demandes)
  async function loadAllUsers() {
    console.log("🔍 Chargement de tous les utilisateurs...");
    const res = await fetch('/auth/users/search?q=', {
      credentials: 'include'
    });
    const data = await res.json();
    console.log("✅ Résultat reçu :", data);
  
    const container = document.getElementById("all-users-list");
    container.innerHTML = "";
    if (data.success && data.results.length > 0) {
      data.results.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${user.first_name} (${user.username})</span>
          <button class="add-btn" onclick="sendFriendRequest(${user.user_id})">+</button>
        `;
        container.appendChild(li);
      });
    } else {
      container.innerHTML = "<li>Aucun utilisateur trouvé.</li>";
    }
  }
  
  
  // 📤 Envoi de demande d’ami
  async function sendFriendRequest(targetId) {
    const res = await fetch('/auth/friends/request/', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ target_id: targetId })
    });
    const data = await res.json();
    console.log("📦 Résultat all users:", data);
    alert(data.message || data.error);
    loadAllUsers();
    loadIncomingRequests();
    loadFriends();
  }
  
  // ✅ Accepter une demande
  async function acceptRequest(fromUserId) {
    const res = await fetch('/auth/friends/accept/', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ target_id: fromUserId })
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadIncomingRequests();
    loadFriends();
    loadAllUsers();
  }
  
  // ❌ Refuser une demande ou supprimer un ami
  async function removeFriend(userId) {
    const res = await fetch('/auth/friends/remove/', {
      method: 'POST',
      credentials: 'include',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ target_id: userId })
    });
    const data = await res.json();
    alert(data.message || data.error);
    loadIncomingRequests();
    loadFriends();
    loadAllUsers();
  }
  
  // 👥 Liste d’amis
  async function loadFriends() {
    const res = await fetch('/auth/friends/list/', { credentials: 'include' });
    const data = await res.json();
    const list = document.getElementById("friends-list");
    list.innerHTML = "";
    if (data.success && data.friends.length > 0) {
      data.friends.forEach(friend => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${friend.first_name} (${friend.username})</span>
          <button onclick="removeFriend(${friend.user_id})">✖</button>
        `;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>Aucun ami pour l’instant.</li>";
    }
  }
  
  // 📥 Demandes entrantes
  async function loadIncomingRequests() {
    const res = await fetch('/auth/friends/incoming/', { credentials: 'include' });
    const data = await res.json();
    const list = document.getElementById("incoming-requests");
    list.innerHTML = "";
    if (data.success && data.requests.length > 0) {
      data.requests.forEach(user => {
        const li = document.createElement("li");
        li.innerHTML = `
          <span>${user.first_name} (${user.username})</span>
          <div>
            <button onclick="acceptRequest(${user.user_id})">✔</button>
            <button onclick="removeFriend(${user.user_id})">✖</button>
          </div>
        `;
        list.appendChild(li);
      });
    } else {
      list.innerHTML = "<li>Aucune demande en attente.</li>";
    }
  }

function initSocialPage() {
    console.log("🚀 initSocialPage appelé !");
    loadAllUsers();
    loadFriends();
    loadIncomingRequests();
  }
  
  