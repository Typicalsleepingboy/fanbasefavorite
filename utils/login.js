document.getElementById("adminLoginForm").addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const feedbackContainer = document.getElementById("feedbackMessage"); 

    try {
        const response = await fetch("https://fanbasebackenend.vercel.app/api/admin/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (response.ok) {
            feedbackContainer.textContent = data.message;
            feedbackContainer.className = "mb-4 p-4 text-sm rounded-lg bg-green-100 text-green-700 border border-green-300";
            setTimeout(() => {
                localStorage.setItem("isLoggedIn", "true");
                window.location.href = "/page/dashboard.html";
            }, 2000);
        } else {
            feedbackContainer.textContent = data.message || "Login failed.";
            feedbackContainer.className = "mb-4 p-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-300";
        }
    } catch (error) {
        console.error("Error during login:", error);
        feedbackContainer.textContent = "Something went wrong. Please try again later.";
        feedbackContainer.className = "mb-4 p-4 text-sm rounded-lg bg-red-100 text-red-700 border border-red-300";
    }
});
