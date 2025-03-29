// Open or create IndexedDB
let db;
const request = indexedDB.open("FinanceDB", 1);

request.onupgradeneeded = function (event) {
    db = event.target.result;
    db.createObjectStore("groups", { keyPath: "name" });
    db.createObjectStore("persons", { keyPath: "name" });
    db.createObjectStore("transactions", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
};

// Save data to IndexedDB
function saveData(storeName, data) {
    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    store.put(data);
}

// Add a group
function addGroup() {
    let groupName = document.getElementById("groupName").value;
    let members = document.getElementById("members").value.split(",");
    let ticketAmount = parseFloat(document.getElementById("ticketAmount").value);

    if (groupName && members.length > 0 && ticketAmount) {
        let group = { name: groupName, members: members, total: ticketAmount, pending: ticketAmount };
        saveData("groups", group);
        alert("Group Added!");
        location.reload();
    } else {
        alert("Please fill all fields correctly.");
    }
}

// Add a specific person
function addPerson() {
    let personName = document.getElementById("personName").value;
    let ticketAmount = parseFloat(document.getElementById("ticketAmountPerson").value);

    if (personName && ticketAmount) {
        let person = { name: personName, total: ticketAmount, pending: ticketAmount };
        saveData("persons", person);
        alert("Person Added!");
        location.reload();
    } else {
        alert("Please fill all fields correctly.");
    }
}

// Add payment to group/person
function addPayment(name, amount, type) {
    const transaction = db.transaction([type], "readwrite");
    const store = transaction.objectStore(type);
    const request = store.get(name);

    request.onsuccess = function () {
        let data = request.result;
        if (data) {
            data.pending -= amount;
            saveData(type, data);
            saveTransaction(name, amount, type);
            checkIfFullyPaid(name, type);
        }
    };
}

// Save transaction history
function saveTransaction(name, amount, type) {
    const transaction = db.transaction(["transactions"], "readwrite");
    const store = transaction.objectStore("transactions");
    let now = new Date();
    let record = { name, amount, type, date: now.toLocaleString() };
    store.add(record);
}

// Check if fully paid
function checkIfFullyPaid(name, type) {
    const transaction = db.transaction([type], "readwrite");
    const store = transaction.objectStore(type);
    const request = store.get(name);

    request.onsuccess = function () {
        let data = request.result;
        if (data.pending <= 0) {
            moveToSuccessful(name, type);
        }
    };
}

// Move fully paid items to successful
function moveToSuccessful(name, type) {
    const transaction = db.transaction(["successful"], "readwrite");
    const store = transaction.objectStore("successful");
    store.put({ name, type });
}
