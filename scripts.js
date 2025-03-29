// Open or create IndexedDB
let db;
const request = indexedDB.open("financeTrackerDB", 1);

request.onupgradeneeded = function (event) {
    let db = event.target.result;

    // Create Object Stores if not exist
    if (!db.objectStoreNames.contains("groups")) {
        db.createObjectStore("groups", { keyPath: "id", autoIncrement: true });
    }
    if (!db.objectStoreNames.contains("persons")) {
        db.createObjectStore("persons", { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = function (event) {
    db = event.target.result;
    console.log("Database connected successfully");
    loadGroups(); // Load groups on page load
    loadPersons(); // Load persons on page load
};

request.onerror = function () {
    console.log("Error connecting to database");
};

// Function to add a group
function addGroup() {
    let name = document.getElementById("groupName").value.trim();
    let members = document.getElementById("groupMembers").value.split(",");
    let ticketAmount = parseFloat(document.getElementById("ticketAmount").value);

    if (!name || members.length === 0 || isNaN(ticketAmount) || ticketAmount <= 0) {
        alert("Please fill out all fields correctly!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");

    let group = {
        name: name,
        members: members.map(m => m.trim()),
        ticketAmount: ticketAmount,
        pending: ticketAmount,
    };

    let request = store.add(group);
    request.onsuccess = function () {
        alert("Group added successfully!");
        loadGroups(); // Refresh group list
        document.getElementById("groupName").value = "";
        document.getElementById("groupMembers").value = "";
        document.getElementById("ticketAmount").value = "";
    };
}

// Function to load groups
function loadGroups() {
    if (!document.getElementById("groupList")) return; // Prevents errors on other pages

    let transaction = db.transaction(["groups"], "readonly");
    let store = transaction.objectStore("groups");
    let request = store.getAll();

    request.onsuccess = function () {
        let groups = request.result;
        let groupList = document.getElementById("groupList");
        groupList.innerHTML = "";

        groups.forEach(group => {
            let div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = `
                <strong>${group.name}</strong> (Pending: ${group.pending}) <br>
                <button onclick="toggleMembers('${group.id}')">Show Members</button>
                <button onclick="addPaymentToGroup('${group.id}', '${group.name}')">Add Payment</button>
                <button onclick="addTicketToGroup('${group.id}', '${group.name}')">Add Ticket</button>
                <div id="members-${group.id}" style="display: none;">
                    <p><strong>Members:</strong></p>
                    ${group.members.map(member => `<p>- ${member}</p>`).join("")}
                </div>
            `;
            groupList.appendChild(div);
        });
    };
}

// Toggle group members
function toggleMembers(groupId) {
    let membersDiv = document.getElementById(`members-${groupId}`);
    membersDiv.style.display = membersDiv.style.display === "none" ? "block" : "none";
}

// Function to add a payment to a group
function addPaymentToGroup(id, name) {
    let amount = parseFloat(prompt(`Enter payment amount for group ${name}:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");
    let request = store.get(parseInt(id));

    request.onsuccess = function () {
        let group = request.result;
        if (!group) return;

        group.pending -= amount;
        if (group.pending <= 0) {
            group.pending = 0;
        }

        store.put(group);
        alert("Payment added!");
        loadGroups();
    };
}

// Function to add a ticket to a group
function addTicketToGroup(id, name) {
    let amount = parseFloat(prompt(`Enter ticket amount for group ${name}:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");
    let request = store.get(parseInt(id));

    request.onsuccess = function () {
        let group = request.result;
        if (!group) return;

        group.ticketAmount += amount;
        group.pending += amount;

        store.put(group);
        alert("Ticket added!");
        loadGroups();
    };
}
