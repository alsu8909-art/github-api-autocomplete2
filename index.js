function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const searchInput = document.getElementById("search-input");
const autocompleteList = document.getElementById("autocomplete-list");
const repoList = document.getElementById("repo-list");

let selectedRepos = [];

const searchRepos = debounce(async (query) => {
  if (!query.trim()) {
    autocompleteList.style.display = "none";
    autocompleteList.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=5`,
    );

    if (!res.ok) {
      throw new Error(`GitHub error: ${res.status}`);
    }

    const { items = [] } = await res.json();
    showResults(items);
  } catch (err) {
    console.error("Не удалось загрузить репозитории:", err);
    autocompleteList.innerHTML =
      '<li style="color: #e11d48; padding: 16px;">Ошибка</li>';
    autocompleteList.style.display = "block";
  }
}, 400);

function showResults(list) {
  autocompleteList.innerHTML = "";

  if (list.length === 0) {
    autocompleteList.innerHTML =
      '<li style="padding: 16px; color: var(--text-light);">Ничего не найдено</li>';
    autocompleteList.style.display = "block";
    return;
  }

  list.forEach((repo) => {
    const li = document.createElement("li");
    li.textContent = repo.full_name;
    li.addEventListener("click", () => addRepo(repo));
    autocompleteList.appendChild(li);
  });

  autocompleteList.style.display = "block";
}

function addRepo(item) {
  searchInput.value = "";
  autocompleteList.style.display = "none";
  autocompleteList.innerHTML = "";

  selectedRepos.push(item);
  updateSelected();
}

function updateSelected() {
  repoList.innerHTML = "";

  selectedRepos.forEach((repo, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
							<div class="repo-card">
								<h3 class="repo-name">Name: ${repo.full_name}</h3>
								<p class="repo-owner">Owner: ${repo.owner.login}</p>
								<p class="repo-stars">Stars: ${repo.stargazers_count.toLocaleString()}</p>
							</div>
						<button class="remove-btn" data-index="${index}">Удалить</button>
					`;
    repoList.appendChild(li);
  });

  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.target.dataset.index);
      selectedRepos.splice(index, 1);
      updateSelected();
    });
  });
}

searchInput.addEventListener("input", (e) => {
  searchRepos(e.target.value);
});

document.addEventListener("click", (e) => {
  if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
    autocompleteList.style.display = "none";
  }
});
