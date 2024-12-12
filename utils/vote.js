document.addEventListener("DOMContentLoaded", async () => {
  const jsonFilePath = "./json/cand.json";

  const voteModal = document.getElementById("voteModal");
  const cancelVote = document.getElementById("cancelVote");
  const voteForm = document.getElementById("voteForm");
  const voteCodesContainer = document.getElementById("voteCodesContainer");
  const addVoteCodeButton = document.getElementById("addVoteCode");
  const candidateList = document.getElementById("candidate-list");
  const selectedCandidate = document.getElementById("selectedCandidate");
  const modalFeedback = document.getElementById("modalFeedback");

  let currentCandidateId = null;
  let currentCandidateName = null;
  let voteCodeCounter = 1;

  function addVoteCodeInput() {
    voteCodeCounter++;
    const voteCodeWrapper = document.createElement("div");
    voteCodeWrapper.className = "voteCodeWrapper";
    voteCodeWrapper.innerHTML = `
      <label for="voteCode${voteCodeCounter}" class="block text-gray-700 font-semibold mb-2">Enter Vote Code:</label>
      <input
        type="text"
        id="voteCode${voteCodeCounter}"
        name="voteCodes"
        class="w-full border border-gray-300 rounded-lg p-2 mb-4"
        placeholder="Enter your vote code"
        required
      />
    `;
    voteCodesContainer.appendChild(voteCodeWrapper);
    voteCodesContainer.scrollTop = voteCodesContainer.scrollHeight;
  }
  addVoteCodeButton.addEventListener("click", addVoteCodeInput);

  function showFeedback(message, type) {
    modalFeedback.textContent = message;
    modalFeedback.className = `mt-4 rounded-lg p-4 text-center ${type === "success"
        ? "bg-green-100 border border-green-400 text-green-700"
        : "bg-red-100 border border-red-400 text-red-700"
      }`;
    modalFeedback.classList.remove("hidden");
  }

  function hideFeedback() {
    modalFeedback.className = "mt-4 hidden";
  }
  cancelVote.addEventListener("click", () => {
    voteModal.classList.add("hidden");
    voteForm.reset();
    hideFeedback();
    voteCodesContainer.innerHTML = "";
    voteCodeCounter = 1;
    addVoteCodeInput();
  });

  voteForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const voteCodes = Array.from(document.getElementsByName("voteCodes")).map(
      (input) => input.value
    );

    try {
      const response = await fetch("https://fanbasebackenend.vercel.app/api/vote/submit-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          voteCodes, 
          candidateId: currentCandidateId,
          candidateName: currentCandidateName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showFeedback(`Vote berhasil! Anda memilih kandidat fanbase terbaik.`, "success");
        setTimeout(() => {
          voteForm.reset();
          hideFeedback();
          voteModal.classList.add("hidden");
          voteCodesContainer.innerHTML = "";
          voteCodeCounter = 1;
          addVoteCodeInput();
        }, 3000);
      } else {
        showFeedback(data.message || "Gagal mengirimkan vote. Coba lagi.", "error");
      }
    } catch (error) {
      console.error("Error submitting vote:", error);
      showFeedback("Terjadi kesalahan. Silakan coba lagi nanti.", "error");
    }
  });

  async function loadCandidates() {
    try {
      const response = await fetch(jsonFilePath);
      const candidates = await response.json();
      candidates.forEach((candidate) => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-md p-6 text-center";

        card.innerHTML = `
          <img src="${candidate.imageUrl}" alt="${candidate.name}" class="w-full h-48 object-cover rounded-lg mb-4">
          <h3 class="text-xl font-semibold mb-2 text-blue-900">${candidate.name}</h3>
          <p class="text-gray-600">${candidate.description}</p>
          <button
            class="mt-4 inline-block bg-blue-900 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition voteButton"
            data-id="${candidate.id}"
            data-name="${candidate.name}"
          >
            Vote
          </button>
        `;
        candidateList.appendChild(card);

        card.querySelector(".voteButton").addEventListener("click", () => {
          currentCandidateId = candidate.id;
          currentCandidateName = candidate.name;
          selectedCandidate.textContent = `You are voting for: ${candidate.name}`;
          voteModal.classList.remove("hidden");
        });
      });
    } catch (error) {
      console.error("Error loading candidates:", error);
    }
  }

  loadCandidates();
  addVoteCodeInput();
});
