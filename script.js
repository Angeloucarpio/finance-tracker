document.addEventListener("DOMContentLoaded", loadData);

function loadData() {
    loadGroups();
    loadPersons();
}

// Function to load Groups
function loadGroups() {
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
                <strong>${group.name}</strong> (Pending: ${group.pending})
                <div class="dropdown">Show Members</div>
                <div class="members" style="display: none;">
                    ${group.members.map(member => `<p>${member}</p>`).join("")}
                </div>
            `;
            div.querySelector(".dropdown").addEventListener("click", function () {
                let membersDiv = this.nextElementSibling;
                membersDiv.style.display = membersDiv.style.display === "none" ? "block" : "none";
            });
            groupList.appendChild(div);
        });
    };
}

// Function to load Persons
function loadPersons() {
    let transaction = db.transaction(["persons"], "readonly");
    let store = transaction.objectStore("persons");
    let request = store.getAll();

    request.onsuccess = function () {
        let persons = request.result;
        let personList = document.getElementById("personList");
        personList.innerHTML = "";

        persons.forEach(person => {
            let div = document.createElement("div");
            div.classList.add("list-item");
            div.innerHTML = `<strong>${person.name}</strong> (Pending: ${person.pending})`;
            personList.appendChild(div);
        });
    };
}

// Function to add a group
function addGroup() {
    let name = document.getElementById("groupName").value;
    let members = document.getElementById("groupMembers").value.split(",");
    let ticketAmount = parseFloat(document.getElementById("ticketAmount").value);

    if (!name || members.length === 0 || isNaN(ticketAmount)) {
        alert("Please fill out all fields!");
        return;
    }

    let transaction = db.transaction(["groups"], "readwrite");
    let store = transaction.objectStore("groups");

    let group = {
        name: name.trim(),
        members: members.map(m => m.trim()),
        ticketAmount: ticketAmount,
        pending: ticketAmount,
    };

    store.add(group);
    alert("Group added successfully!");
    loadGroups();
}

// Function to add a person
function addPerson() {
    let name = document.getElementById("personName").value;
    let ticketAmount = parseFloat(document.getElementById("ticketAmountPerson").value);

    if (!name || isNaN(ticketAmount)) {
        alert("Please fill out all fields!");
        return;
    }

    let transaction = db.transaction(["persons"], "readwrite");
    let store = transaction.objectStore("persons");

    let person = {
        name: name.trim(),
        ticketAmount: ticketAmount,
        pending: ticketAmount,
    };

    store.add(person);
    alert("Person added successfully!");
    loadPersons();
}
