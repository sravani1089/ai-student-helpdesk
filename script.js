
const form = document.querySelector("#issueForm");
const issueList = document.getElementById("issueList");

// Load saved issues
let issues = JSON.parse(localStorage.getItem("studentIssues")) || [];

// Add missing information to older issues
issues.forEach(function(issue) {
    if (!issue.id) {
        issue.id = "ISS-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
    }

    if (!issue.status) {
        issue.status = "Open";
    }

    const analysis = analyzeIssue(issue.description || "");

    if (!issue.category) {
        issue.category = analysis.category;
    }

    if (!issue.suggestion) {
        issue.suggestion = analysis.suggestion;
    }
});

// Save issues
function saveIssues() {
    localStorage.setItem("studentIssues", JSON.stringify(issues));
}

// Update dashboard counts
function updateDashboard() {
    document.getElementById("totalCount").textContent = issues.length;

    document.getElementById("openCount").textContent =
        issues.filter(issue => issue.status === "Open").length;

    document.getElementById("progressCount").textContent =
        issues.filter(issue => issue.status === "In Progress").length;

    document.getElementById("resolvedCount").textContent =
        issues.filter(issue => issue.status === "Resolved").length;
}

// Analyse issue descriptions
function analyzeIssue(description) {
    const text = description.toLowerCase();

    if (text.includes("login") || text.includes("password") ||
        text.includes("portal") || text.includes("account")) {
        return {
            category: "Account & Login",
            suggestion: "Check your login details and try resetting your password. If the problem continues, contact the college IT support team."
        };
    }

    if (text.includes("fee") || text.includes("payment") ||
        text.includes("refund") || text.includes("transaction")) {
        return {
            category: "Fees & Payments",
            suggestion: "Check your payment receipt and transaction status. Contact the college accounts department if the payment issue continues."
        };
    }

    if (text.includes("wifi") || text.includes("internet") ||
        text.includes("network") || text.includes("connection")) {
        return {
            category: "Network",
            suggestion: "Check your internet connection and reconnect to the college network. Contact technical support if the issue continues."
        };
    }

    if (text.includes("exam") || text.includes("marks") ||
        text.includes("result") || text.includes("attendance")) {
        return {
            category: "Exams & Academics",
            suggestion: "Check the latest college academic updates. Contact your department or examination section for further help."
        };
    }

    return {
        category: "General Issue",
        suggestion: "Your issue needs further review. Please contact the appropriate college support team for assistance."
    };
}

// Create search box
const searchBox = document.createElement("input");
searchBox.type = "text";
searchBox.placeholder = "Search by Tracking ID or Issue Title...";
searchBox.style.width = "100%";
searchBox.style.padding = "12px";
searchBox.style.margin = "10px 0 18px";
searchBox.style.boxSizing = "border-box";

issueList.parentNode.insertBefore(searchBox, issueList);

// Display issues
function displayIssues(searchText = "") {
    issueList.innerHTML = "";

    // Refresh dashboard counts
    updateDashboard();

    const search = searchText.toLowerCase().trim();

    const filteredIssues = issues.filter(function(issue) {
        return issue.title.toLowerCase().includes(search) ||
               issue.id.toLowerCase().includes(search);
    });

    if (filteredIssues.length === 0) {
        issueList.innerHTML = "<p>No matching issues found.</p>";
        return;
    }

    filteredIssues.forEach(function(issue) {
        const card = document.createElement("div");
        card.className = "issue-card";

        const heading = document.createElement("h3");
        heading.textContent = issue.title;

        const tracking = document.createElement("p");
        tracking.textContent = "Tracking ID: " + issue.id;

        const student = document.createElement("p");
        student.textContent = "Student: " + issue.name;

        const description = document.createElement("p");
        description.textContent = "Description: " + issue.description;

        const category = document.createElement("p");
        category.textContent = "Suggested Category: " + issue.category;

        const assistantTitle = document.createElement("p");
        assistantTitle.textContent = "Issue Assistant Suggestion:";

        const suggestion = document.createElement("p");
        suggestion.textContent = issue.suggestion;

        // Status dropdown
        const statusLabel = document.createElement("label");
        statusLabel.textContent = "Issue Status: ";

        const statusSelect = document.createElement("select");

        ["Open", "In Progress", "Resolved"].forEach(function(statusName) {
            const option = document.createElement("option");
            option.value = statusName;
            option.textContent = statusName;
            statusSelect.appendChild(option);
        });

        statusSelect.value = issue.status;

        statusSelect.addEventListener("change", function() {
            issue.status = statusSelect.value;
            saveIssues();
            displayIssues(searchBox.value);
        });

        statusLabel.appendChild(statusSelect);

        // Edit button
        const editButton = document.createElement("button");
        editButton.textContent = "Edit Issue";
        editButton.style.margin = "10px 8px 0 0";

        editButton.addEventListener("click", function() {
            const newTitle = prompt("Enter the updated issue title:", issue.title);

            if (newTitle === null) return;

            if (!newTitle.trim()) {
                alert("Issue title cannot be empty.");
                return;
            }

            const newDescription = prompt(
                "Enter the updated issue description:",
                issue.description
            );

            if (newDescription === null) return;

            if (!newDescription.trim()) {
                alert("Issue description cannot be empty.");
                return;
            }

            issue.title = newTitle.trim();
            issue.description = newDescription.trim();

            const analysis = analyzeIssue(issue.description);
            issue.category = analysis.category;
            issue.suggestion = analysis.suggestion;

            saveIssues();
            displayIssues(searchBox.value);

            alert("Issue updated successfully!");
        });

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete Issue";
        deleteButton.style.margin = "10px 0 0 8px";
        deleteButton.style.backgroundColor = "#dc2626";

        deleteButton.addEventListener("click", function() {
            const confirmDelete = confirm(
                "Are you sure you want to delete this issue?"
            );

            if (confirmDelete) {
                issues = issues.filter(function(item) {
                    return item.id !== issue.id;
                });

                saveIssues();
                displayIssues(searchBox.value);

                alert("Issue deleted successfully!");
            }
        });

        card.append(
            heading,
            tracking,
            student,
            description,
            category,
            assistantTitle,
            suggestion,
            statusLabel,
            editButton,
            deleteButton
        );

        issueList.appendChild(card);
    });
}

// Search while typing
searchBox.addEventListener("input", function() {
    displayIssues(searchBox.value);
});

// Save and display existing issues
saveIssues();
displayIssues();

// Submit a new issue
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const title = document.getElementById("issueTitle").value.trim();
    const description = document.getElementById("issueDescription").value.trim();

    if (!name || !title || !description) {
        alert("Please fill in all fields!");
        return;
    }

    const analysis = analyzeIssue(description);

    const newIssue = {
        id: "ISS-" + Date.now(),
        name: name,
        title: title,
        description: description,
        status: "Open",
        category: analysis.category,
        suggestion: analysis.suggestion
    };

    issues.push(newIssue);

    saveIssues();
    searchBox.value = "";
    displayIssues();

    form.reset();

    alert("Your issue has been submitted successfully!");
});








