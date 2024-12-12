const isLoggedIn = localStorage.getItem("isLoggedIn");

if (!isLoggedIn) {

    window.location.href = "login.html";
} else {

    fetchAndRenderChart();
}

document.getElementById("generateCodeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const numCodes = parseInt(document.getElementById("numCodes").value);

    if (!numCodes || numCodes <= 0) {
        alert("Please enter a valid number of codes.");
        return;
    }

    const codes = [];
    for (let i = 0; i < numCodes; i++) {
        codes.push(generateVoteCode());
    }

    const generatedCodesSection = document.getElementById("generatedCodesSection");
    const generatedCodesDiv = document.getElementById("generatedCodes");

    generatedCodesDiv.innerHTML = "";
    codes.forEach((code) => {
        const codeElement = document.createElement("div");
        codeElement.textContent = code;
        codeElement.className = "bg-white p-2 rounded-lg shadow-md border border-gray-200";
        generatedCodesDiv.appendChild(codeElement);
    });

    generatedCodesSection.classList.remove("hidden");
    prepareDownload(codes);
});



function generateVoteCode() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let voteCode = "";
    for (let i = 0; i < 16; i++) {
        voteCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return voteCode;
}

function prepareDownload(codes) {
    const downloadButton = document.getElementById("downloadCodes");
    if (!downloadButton) {
        console.error("Download button not found");
        return;
    }

    const blob = new Blob([codes.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    downloadButton.href = url;
    downloadButton.download = "generated-vote-byfanbasefavorite.txt";

    downloadButton.click();
    URL.revokeObjectURL(url);
}


async function fetchAndRenderChart() {
    try {
        const response = await fetch("https://fanbasebackenend.vercel.app/api/admin/votes");
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) {
            console.error("Invalid data format or empty data received.");
            return;
        }
        const labels = data.map(item => item._id);
        const votes = data.map(item => item.voteCount);

        const ctx = document.getElementById("voteChart").getContext("2d");
        new Chart(ctx, {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Votes",
                    data: votes,
                    backgroundColor: "#3b82f6",
                    borderColor: "#1e40af",
                    borderWidth: 1,
                    hoverBackgroundColor: "#2563eb",
                    hoverBorderColor: "#1e40af",
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuad',
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            label: function (tooltipItem) {
                                return `${tooltipItem.label}: ${tooltipItem.raw} votes`;
                            }
                        }
                    },
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1,
                            min: 0,
                        },
                    },
                },
                plugins: {
                    datalabels: {
                        align: 'top',
                        anchor: 'end',
                        formatter: function (value, context) {
                            const rank = context.dataIndex + 1;
                            return `${rank}. ${value}`;
                        },
                        font: {
                            weight: 'bold',
                            size: 14,
                        },
                        color: '#ffffff',
                    }
                }
            }
        });
    } catch (error) {
        console.error("Error fetching vote data:", error);
    }
}

const logoutButton = document.getElementById("logoutButton");
if (logoutButton) {
    logoutButton.addEventListener("click", () => {
        localStorage.removeItem("isLoggedIn");
        window.location.href = "login.html";
    });
} else {
    console.error("Logout button not found!");
}

document.getElementById("downloadVoteData").addEventListener("click", async () => {
    try {
        const response = await fetch("https://fanbasebackenend.vercel.app/api/admin/results/csv");
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = "vote_data.csv";
        link.click();
    } catch (error) {
        console.error("Error downloading CSV:", error);
        alert("Failed to download vote data.");
    }
});
