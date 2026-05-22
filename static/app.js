async function loadCalendar() {

    const response = await fetch("/api/calendar");

    const data = await response.json();

    const calendar = document.getElementById("calendar");

    const summary = document.getElementById("summary");

    const daysInMonth = 31;

    // May 1st 2026 starts on Friday
    const blankDays = 5;

    // Blank starting boxes
    for (let i = 0; i < blankDays; i++) {

        const blank = document.createElement("div");

        blank.className = "day";

        blank.style.visibility = "hidden";

        calendar.appendChild(blank);
    }

    // Build calendar days
    for (let day = 1; day <= daysInMonth; day++) {

        const dateKey =
            `2026-05-${String(day).padStart(2, "0")}`;

        const dayData = data.days[dateKey];

        const box = document.createElement("div");

        box.classList.add("day");

        // No trade day
        if (!dayData) {

            box.classList.add("gray");

            // Memorial Day special
            if (day === 25) {

                box.innerHTML = `
                    <div class="date">${day}</div>

                    <div class="trade">
                        MEMORIAL DAY
                    </div>

                    <div class="trade" style="font-size:34px;">
                        🇺🇸
                    </div>
                `;

            } else {

                box.innerHTML = `
                    <div class="date">${day}</div>

                    <div class="trade">
                        No Trade Day
                    </div>
                `;
            }

        } else {

            // Profit vs loss coloring
            if (dayData.total >= 0) {

                box.classList.add("green");

            } else {

                box.classList.add("red");
            }

            let tradesHtml = "";

            // Build trade rows
            dayData.trades.forEach(trade => {

                const sign = trade >= 0 ? "+" : "-";

                tradesHtml += `
                    <div class="trade">
                        ${sign}$${Math.abs(trade).toFixed(2)}
                    </div>
                `;
            });

            const totalSign =
                dayData.total >= 0 ? "+" : "-";

            // Special May 22 labels
            if (day === 22) {

                box.innerHTML = `
                    <div class="date">${day}</div>

                    <div class="trade">
                        SPY &nbsp;&nbsp;&nbsp; +$12.00
                    </div>

                    <div class="trade">
                        TSLA &nbsp;&nbsp; +$12.00
                    </div>

                    <div class="total">
                        ${totalSign}$${Math.abs(dayData.total).toFixed(2)}
                    </div>
                `;

            } else {

                box.innerHTML = `
                    <div class="date">${day}</div>

                    ${tradesHtml}

                    <div class="total">
                        ${totalSign}$${Math.abs(dayData.total).toFixed(2)}
                    </div>
                `;
            }
        }

        calendar.appendChild(box);
    }

    // Summary footer cards
    summary.innerHTML = `

    <div class="card">
        <div class="card-title">
            WINNING DAYS
        </div>

        <div class="card-value">
            ${data.winning_days}
        </div>

        <div class="card-icon">
            <i class="fa-solid fa-trophy"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            LOSING DAYS
        </div>

        <div class="card-value red-text">
            ${data.losing_days}
        </div>

        <div class="card-icon red-text">
            <i class="fa-solid fa-chart-line-down"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            NO TRADE DAYS
        </div>

        <div class="card-value gray-text">
            ${data.no_trade_days}
        </div>

        <div class="card-icon gray-text">
            <i class="fa-solid fa-calendar-days"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            TOTAL REALIZED P/L
        </div>

        <div class="card-value">
            +$${data.total_pl.toFixed(2)}
        </div>

        <div class="card-icon">
            <i class="fa-solid fa-sack-dollar"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            TODAY (MAY 22)
        </div>

        <div class="card-value">
            +$24.00
        </div>

        <div class="card-icon">
            <i class="fa-solid fa-chart-column"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            CURRENT ACCOUNT VALUE
        </div>

        <div class="card-value">
            $${data.account_value.toFixed(2)}
        </div>

        <div class="card-icon gray-text">
            <i class="fa-solid fa-building-columns"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            AVAILABLE FUNDS
        </div>

        <div class="card-value">
            $324.64
        </div>

        <div class="card-icon gray-text">
            <i class="fa-solid fa-wallet"></i>
        </div>
    </div>

    <div class="card">
        <div class="card-title">
            HISTORICAL BALANCE GAIN
        </div>

        <div class="card-value">
            +292.00%
        </div>

        <div class="card-icon">
            <i class="fa-solid fa-chart-line"></i>
        </div>
    </div>

    `;
}

loadCalendar();
