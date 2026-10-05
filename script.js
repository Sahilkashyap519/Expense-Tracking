const form = document.getElementById("expenseForm");
const expenseList = document.getElementById("expenseList");

const totalAmount = document.getElementById("totalAmount");
const totalTransactions = document.getElementById("totalTransactions");

let expenses = JSON.parse(localStorage.getItem("expenses")) || [];


// Currently editing expense
let editingId = null;


// ========================================
// ADD / UPDATE EXPENSE
// ========================================

form.addEventListener("submit", function (event) {

    event.preventDefault();

    const title = document.getElementById("title").value.trim();
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;

    if (!title || !amount || !category || !date) {
        alert("Please fill all details.");
        return;
    }


    // ====================================
    // UPDATE EXISTING EXPENSE
    // ====================================

    if (editingId !== null) {

        const expense = expenses.find(function (item) {
            return item.id === editingId;
        });

        if (expense) {

            expense.title = title;
            expense.amount = amount;
            expense.category = category;
            expense.date = date;

        }

        editingId = null;

        resetFormButton();

    }


    // ====================================
    // ADD NEW EXPENSE
    // ====================================

    else {

        const expense = {

            id: Date.now(),

            title: title,

            amount: amount,

            category: category,

            date: date

        };

        expenses.push(expense);

    }


    saveExpenses();

    form.reset();

    displayExpenses();

});


// ========================================
// SAVE EXPENSES
// ========================================

function saveExpenses() {

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

}


// ========================================
// DISPLAY EXPENSES
// ========================================

function displayExpenses() {

    expenseList.innerHTML = "";


    if (expenses.length === 0) {

        expenseList.innerHTML = `
            <div class="empty">
                <div class="empty-icon">💸</div>

                <h3>No expenses yet</h3>

                <p>
                    Add your first expense above.
                </p>
            </div>
        `;

        updateOverallTotal();

        return;
    }


    // ====================================
    // GROUP BY MONTH
    // ====================================

    const months = {};


    expenses.forEach(function (expense) {

        const monthKey =
            expense.date.substring(0, 7);

        if (!months[monthKey]) {

            months[monthKey] = [];

        }

        months[monthKey].push(expense);

    });


    const monthKeys =
        Object.keys(months)
            .sort()
            .reverse();


    monthKeys.forEach(function (monthKey) {

        const monthExpenses =
            months[monthKey];


        // ====================================
        // MONTH TOTAL
        // ====================================

        let monthTotal = 0;

        monthExpenses.forEach(function (expense) {

            monthTotal += expense.amount;

        });


        // ====================================
        // MONTH BOX
        // ====================================

        const monthBox =
            document.createElement("div");

        monthBox.className = "month-box";


        monthBox.innerHTML = `

            <div class="month-header">

                <div class="month-name-area">

                    <span class="month-label">
                        MONTHLY RECORD
                    </span>

                    <h2>
                        ${formatMonth(monthKey)}
                    </h2>

                </div>


                <div class="month-total">

                    <span>
                        Monthly Total
                    </span>

                    <strong>
                        ₹${monthTotal}
                    </strong>

                </div>

            </div>

        `;


        // ====================================
        // GROUP BY DATE
        // ====================================

        const dates = {};


        monthExpenses.forEach(function (expense) {

            if (!dates[expense.date]) {

                dates[expense.date] = [];

            }

            dates[expense.date].push(expense);

        });


        const dateKeys =
            Object.keys(dates)
                .sort()
                .reverse();


        dateKeys.forEach(function (date) {

            const dateExpenses =
                dates[date];


            let dateTotal = 0;


            dateExpenses.forEach(function (expense) {

                dateTotal += expense.amount;

            });


            // ====================================
            // DATE BOX
            // ====================================

            const dateBox =
                document.createElement("div");

            dateBox.className = "date-box";


            dateBox.innerHTML = `

                <div class="date-header">

                    <div>

                        <span class="date-label">
                            EXPENSE DATE
                        </span>

                        <h3>
                            ${formatDate(date)}
                        </h3>

                        <span class="expense-count">
                            ${dateExpenses.length}
                            ${dateExpenses.length === 1
                                ? "Expense"
                                : "Expenses"}
                        </span>

                    </div>


                    <div class="date-total">

                        <span>
                            Day Total
                        </span>

                        <strong>
                            ₹${dateTotal}
                        </strong>

                    </div>

                </div>

            `;


            // ====================================
            // EXPENSE ITEMS
            // ====================================

            dateExpenses.forEach(function (expense) {

                const expenseItem =
                    document.createElement("div");

                expenseItem.className =
                    "expense-item";


                expenseItem.innerHTML = `

                    <div class="expense-left">

                        <div class="expense-icon">
                            ${getCategoryIcon(
                                expense.category
                            )}
                        </div>


                        <div class="expense-details">

                            <h4>
                                ${escapeHTML(
                                    expense.title
                                )}
                            </h4>

                            <span class="category-tag">
                                ${escapeHTML(
                                    expense.category
                                )}
                            </span>

                        </div>

                    </div>


                    <div class="expense-right">

                        <strong>
                            ₹${expense.amount}
                        </strong>


                        <div class="expense-actions">

                            <button
                                class="edit-btn"
                                onclick="editExpense(${expense.id})">

                                ✏️ Edit

                            </button>


                            <button
                                class="delete-btn"
                                onclick="deleteExpense(${expense.id})">

                                Delete

                            </button>

                        </div>

                    </div>

                `;


                dateBox.appendChild(expenseItem);

            });


            monthBox.appendChild(dateBox);

        });


        expenseList.appendChild(monthBox);

    });


    updateOverallTotal();

}


// ========================================
// EDIT EXPENSE
// ========================================

function editExpense(id) {

    const expense =
        expenses.find(function (item) {

            return item.id === id;

        });


    if (!expense) {
        return;
    }


    // Fill form
    document.getElementById("title").value =
        expense.title;

    document.getElementById("amount").value =
        expense.amount;

    document.getElementById("category").value =
        expense.category;

    document.getElementById("date").value =
        expense.date;


    // Store editing ID
    editingId = id;


    // Change button
    const submitButton =
        form.querySelector("button[type='submit']");

    submitButton.textContent =
        "✓ Update Expense";

    submitButton.classList.add(
        "update-mode"
    );


    // Add cancel button
    addCancelButton();


    // Scroll to form
    form.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

}


// ========================================
// CANCEL EDIT
// ========================================

function cancelEdit() {

    editingId = null;

    form.reset();

    resetFormButton();

}


// ========================================
// ADD CANCEL BUTTON
// ========================================

function addCancelButton() {

    if (document.getElementById("cancelEdit")) {
        return;
    }


    const cancelButton =
        document.createElement("button");

    cancelButton.type = "button";

    cancelButton.id = "cancelEdit";

    cancelButton.textContent =
        "Cancel Edit";


    cancelButton.addEventListener(
        "click",
        cancelEdit
    );


    form.appendChild(cancelButton);

}


// ========================================
// RESET FORM BUTTON
// ========================================

function resetFormButton() {

    const submitButton =
        form.querySelector(
            "button[type='submit']"
        );


    if (submitButton) {

        submitButton.textContent =
            "+ Add Expense";

        submitButton.classList.remove(
            "update-mode"
        );

    }


    const cancelButton =
        document.getElementById(
            "cancelEdit"
        );


    if (cancelButton) {

        cancelButton.remove();

    }

}


// ========================================
// DELETE EXPENSE
// ========================================

function deleteExpense(id) {

    expenses =
        expenses.filter(function (expense) {

            return expense.id !== id;

        });


    saveExpenses();

    displayExpenses();

}


// ========================================
// OVERALL TOTAL
// ========================================

function updateOverallTotal() {

    let total = 0;


    expenses.forEach(function (expense) {

        total += expense.amount;

    });


    totalAmount.innerText =
        "₹" + total;


    totalTransactions.innerText =
        expenses.length;

}


// ========================================
// MONTH FORMAT
// ========================================

function formatMonth(monthKey) {

    const parts =
        monthKey.split("-");


    const year =
        parts[0];

    const month =
        Number(parts[1]);


    const months = [

        "January",
        "February",
        "March",
        "April",
        "May",
        "June",

        "July",
        "August",
        "September",
        "October",
        "November",
        "December"

    ];


    return (
        months[month - 1] +
        " " +
        year
    );

}


// ========================================
// DATE FORMAT
// ========================================

function formatDate(date) {

    const parts =
        date.split("-");


    const year =
        parts[0];

    const month =
        Number(parts[1]);

    const day =
        parts[2];


    const months = [

        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",

        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec"

    ];


    return (
        day +
        " " +
        months[month - 1] +
        " " +
        year
    );

}


// ========================================
// CATEGORY ICON
// ========================================

function getCategoryIcon(category) {

    const icons = {

        "Food": "🍔",

        "Travel": "🚌",

        "Shopping": "🛍️",

        "Education": "📚",

        "Entertainment": "🎮",

        "Other": "📦"

    };


    return icons[category] || "💰";

}


// ========================================
// ESCAPE HTML
// ========================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// INITIAL LOAD
// ========================================

displayExpenses();
