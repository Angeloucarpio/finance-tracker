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

    // Load data only when the database is ready
    document.addEventListener("DOMContentLoaded", function () {
        loadGroups();
        loadPersons();
    });
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
    if (!db) {
        console.error("Database not ready yet.");
        return;
    }

    let transaction = db.transaction(["groups"], "readonly");
    let store = transaction.objectStore("groups");
    let request = store.getAll();

    request.onsuccess = function () {
        let groups = request.result;
        let groupList = document.getElementById("groupList");

        if (!groupList) return; // Avoid errors on pages without groupList

        groupList.innerHTML = "";

        groups.forEach(group => {
            let div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = `
                <strong>${group.name}</strong> (Pending: ${group.pending}) <br>
                <button onclick="toggleMembers('${group.id}')">Show Members</button>
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
    let amount = parseFloat(prompt(`Enter payment amount:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");
    let request = store.get(id);

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
function addTicketToGroup(id) {
    let amount = parseFloat(prompt(`Enter ticket amount:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");
    let request = store.get(id);

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

    let person = {
        name: name,
        ticketAmount: ticketAmount,
        pending: ticketAmount,
    };

    let request = store.add(person);
    request.onsuccess = function () {
        alert("Person added successfully!");
        loadPersons(); // Refresh person list
        document.getElementById("personName").value = "";
        document.getElementById("ticketAmountPerson").value = "";
    };
}

// Function to load persons
function loadPersons() {
    if (!db) {
        console.error("Database not ready yet.");
        return;
    }

    let transaction = db.transaction(["persons"], "readonly");
    let store = transaction.objectStore("persons");
    let request = store.getAll();

    request.onsuccess = function () {
        let persons = request.result;
        let personList = document.getElementById("personList");

        if (!personList) return; // Avoid errors on pages without personList

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
    let amount = parseFloat(prompt(`Enter payment amount:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["persons"], "readwrite");
    let store = transaction.objectStore("persons");
    let request = store.get(id);

    request.onsuccess = function () {
        let person = request.result;
        if (!person) return;

        person.pending -= amount;
        if (person.pending <= 0) {
            person.pending = 0;
        }

        store.put(person);
        alert("Payment added!");
        loadPersons();
    };
}

// Function to add a ticket to a person
function addTicketToPerson(id) {
    let amount = parseFloat(prompt(`Enter ticket amount:`));

    if (isNaN(amount) || amount <= 0) {
        alert("Invalid amount!");
        return;
    }

    let transaction = db.transaction(["persons"], "readwrite");
    let store = transaction.objectStore("persons");
    let request = store.get(id);

    request.onsuccess = function () {
        let person = request.result;
        if (!person) return;

        person.ticketAmount += amount;
        person.pending += amount;

        store.put(person);
        alert("Ticket added!");
        loadPersons();
    };
}
