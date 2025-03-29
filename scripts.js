// Open or create IndexedDB
let db;
const request = indexedDB.open("financeTrackerDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result; // Use global db variable

    // Create Object Stores if they don't exist
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

    // Load data when the database is ready
    loadGroups();
    loadPersons();
};

request.onerror = function () {
    console.error("Error connecting to database");
};

// Function to add a group
function addGroup() {
    let name = document.getElementById("groupName").value.trim();
    let members = document.getElementById("groupMembers").value.split(",").map(m => m.trim());
    let ticketAmount = parseFloat(document.getElementById("ticketAmount").value);

    if (!name || members.length === 0 || isNaN(ticketAmount) || ticketAmount <= 0) {
        alert("Please fill out all fields correctly!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");

    let group = { name, members, ticketAmount, pending: ticketAmount };

    store.add(group).onsuccess = function () {
        alert("Group added successfully!");
        loadGroups();
        document.getElementById("groupName").value = "";
        document.getElementById("groupMembers").value = "";
        document.getElementById("ticketAmount").value = "";
    };
}

// Function to load groups
function loadGroups() {
    if (!db) return;

    let transaction = db.transaction(["groups"], "readonly");
    let store = transaction.objectStore("groups");

    store.getAll().onsuccess = function (event) {
        let groups = event.target.result;
        let groupList = document.getElementById("groupList");

        if (!groupList) return;

        groupList.innerHTML = "";

        groups.forEach(group => {
            let div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = `
                <strong>${group.name}</strong> (Pending: ${group.pending}) <br>
                <button onclick="toggleMembers(${group.id})">Show Members</button>
                <button onclick="addPaymentToGroup(${group.id})">Add Payment</button>
                <button onclick="addTicketToGroup(${group.id})">Add Ticket</button>
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
function addPaymentToGroup(id) {
    id = Number(id);
    let amount = parseFloat(prompt("Enter payment amount:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");

    store.get(id).onsuccess = function (event) {
        let group = event.target.result;
        if (!group) return;

        group.pending = Math.max(0, group.pending - amount);
        store.put(group).onsuccess = function () {
            alert("Payment added!");
            loadGroups();
        };
    };
}

// Function to add a ticket to a group
function addTicketToGroup(id) {
    id = Number(id);
    let amount = parseFloat(prompt("Enter ticket amount:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");

    store.get(id).onsuccess = function (event) {
        let group = event.target.result;
        if (!group) return;

        group.ticketAmount += amount;
        group.pending += amount;

        store.put(group).onsuccess = function () {
            alert("Ticket added!");
            loadGroups();
        };
    };
}

// Function to add a person
function addPerson() {
    let name = document.getElementById("personName").value.trim();
    let ticketAmount = parseFloat(document.getElementById("ticketAmountPerson").value);

    if (!name || isNaN(ticketAmount) || ticketAmount <= 0) {
        alert("Please fill out all fields correctly!");
        return;
    }

    let transaction = db.transaction(["persons"], "readwrite");
    let store = transaction.objectStore("persons");

    let person = { name, ticketAmount, pending: ticketAmount };

    store.add(person).onsuccess = function () {
        alert("Person added successfully!");
        loadPersons();
        document.getElementById("personName").value = "";
        document.getElementById("ticketAmountPerson").value = "";
    };
}

// Function to load persons
function loadPersons() {
    if (!db) return;

    let transaction = db.transaction(["persons"], "readonly");
    let store = transaction.objectStore("persons");

    store.getAll().onsuccess = function (event) {
        let persons = event.target.result;
        let personList = document.getElementById("personList");

        if (!personList) return;

        personList.innerHTML = "";

        persons.forEach(person => {
            let div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = `
                <strong>${person.name}</strong> (Pending: ${person.pending}) <br>
                <button onclick="addPaymentToPerson(${person.id})">Add Payment</button>
                <button onclick="addTicketToPerson(${person.id})">Add Ticket</button>
            `;
            personList.appendChild(div);
        });
    };
}

// Function to add a payment to a person
function addPaymentToPerson(id) {
    id = Number(id);
    let amount = parseFloat(prompt("Enter payment amount:"));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["persons"], "readwrite");
    let store = transaction.objectStore("persons");

    store.get(id).onsuccess = function (event) {
        let person = event.target.result;
        if (!person) return;

        person.pending = Math.max(0, person.pending - amount);
        store.put(person).onsuccess = function () {
            alert("Payment added!");
            loadPersons();
        };
    };
}
