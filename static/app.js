async function loadCalendar() {

    try {

        const response = await fetch("/api/calendar");

        const data = await response.json();

        console.log(data);

        document.querySelector("h1").innerHTML =
            `${data.month.toUpperCase()} ${data.year} <span>ORH/ORL BOT PERFORMANCE</span>`;

        const calendar = document.getElementById("calendar");
        const summary = document.getElementById("summary");

        calendar.innerHTML = "";
        summary.innerHTML = "";

        const daysInMonth = data.days_in_month || 31;
        const blankDays = data.first_weekday || 0;

        // Blank starting boxes
        for (let i = 0; i < blankDays; i++) {

            const blank = document.createElement("div");

            blank.className = "day";

            blank.style.visibility = "hidden";

            calendar.appendChild(blank);
        }

        // Build days
        for (let day = 1; day <= daysInMonth; day++) {

            const dateKey =
                `${data.year}-${String(data.month_number).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

            const dayData =
                data.days
                    ? data.days[dateKey]
                    : null;

            const holiday =
                data.holidays
                    ? data.holidays[dateKey]
                    : null;

            const box =
                document.createElement("div");

            box.classList.add("day");

            // HOLIDAY
            if (holiday) {

                box.classList.add("gray");

                box.innerHTML = `
                    <div class="date">${day}</div>

                    <div class="trade">
                        ${holiday}
                    </div>
                `;
            }

            // NO TRADE
            else if (!dayData) {

                box.classList.add("gray");

                box.innerHTML = `
                    <div class="date">${day}</div>

                    <div class="trade">
                        No Trade Day
                    </div>
                `;
            }

            // TRADE DAY
            else {

                box.classList.add(
                    dayData.total >= 0
                        ? "green"
                        : "red"
                );

                let tradesHtml = "";

                const symbols =
                    dayData.symbols || [];

                const trades =
                    dayData.trades || [];

                for (let i = 0; i < symbols.length; i++) {

                    const symbol =
                        symbols[i] || "";

                    const tradeAmount =
                        trades[i] || 0;

                    // CLEAN ticker extraction
                    const match =
                        symbol.match(/^[A-Z]+/);

                    const ticker =
                        match
                            ? match[0]
                            : symbol;

                    const sign =
                        tradeAmount >= 0
                            ? "+"
                            : "-";

                    tradesHtml += `
                        <div class="trade">
                            ${ticker}
                            &nbsp;&nbsp;
                            ${sign}$${Math.abs(tradeAmount).toFixed(2)}
                        </div>
                    `;
                }

                const totalSign =
                    dayData.total >= 0
                        ? "+"
                        : "-";

                box.innerHTML = `
                    <div class="date">${day}</div>

                    ${tradesHtml}

                    <div class="total">
                        ${totalSign}$${Math.abs(dayData.total).toFixed(2)}
                    </div>
                `;
            }

            calendar.appendChild(box);
        }

        const todaySign =
            data.today_pl >= 0 ? "+" : "-";

        const totalSign =
            data.total_pl >= 0 ? "+" : "-";

        summary.innerHTML = `

        <div class="card">
            <div class="card-title">
                WINNING DAYS
            </div>

            <div class="card-value">
                ${data.winning_days || 0}
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
                ${data.losing_days || 0}
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
                ${data.no_trade_days || 0}
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
                ${totalSign}$${Math.abs(data.total_pl || 0).toFixed(2)}
            </div>

            <div class="card-icon">
                <i class="fa-solid fa-sack-dollar"></i>
            </div>
        </div>

        <div class="card">
            <div class="card-title">
                TODAY
            </div>

            <div class="card-value">
                ${todaySign}$${Math.abs(data.today_pl || 0).toFixed(2)}
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
                $${(data.account_value || 0).toFixed(2)}
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
                $${(data.available_funds || 0).toFixed(2)}
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

    } catch (error) {

        console.error(error);

        document.body.innerHTML += `
            <div style="
                color:red;
                padding:20px;
                font-size:24px;
            ">
                JavaScript Error:
                ${error}
            </div>
        `;
    }
}

loadCalendar();
