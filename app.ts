import { Backend } from "@staticbackend/js";

const bkn = new Backend("pub-key", "dev");

// current user's session token
let token = null;

// main div
let noAuth = document.getElementById("no-auth");
let todos = document.getElementById("todos");

// register/login buttons
let btnReg = document.getElementById("register");
let btnLogin = document.getElementById("login");
let authForm = document.forms["auth"];

// prevent page refresh
authForm.addEventListener("submit", (e) => e.preventDefault());

// register/login click event handlers
btnReg.addEventListener("click", async (e) => {
	const result = await bkn.register(authForm.email.value, authForm.password.value);
	if (!result.ok) {
		console.error(result.content);
		return;
	}

	token = result.content;

	toggleAuth(true);
});

btnLogin.addEventListener("click", async (e) => {
	const result = await bkn.login(authForm.email.value, authForm.password.value);
	if (!result.ok) {
		console.error(result.content);
		return;
	}

	token = result.content;

	await loadTodos();

	toggleAuth(true);
});

const toggleAuth = (state) => {
	if (state) {
		noAuth.style.display = "none";
		todos.style.display = "block";
	} else {
		noAuth.style.display = "block";
		todos.style.display = "none";
	}
}

// we show the register/login div by default
toggleAuth(false);

// add to-do form
const addForm = document.forms["todo"];

addForm.addEventListener("submit", async (e) => {
	e.preventDefault();

	const doc = {
		name: addForm.name.value,
		done: false
	}
	const result = await bkn.create(token, "todos", doc);
	if (!result.ok) {
		console.error(result.content);
		return;
	}

	appendItem(result.content);

	addForm.name.value = "";
	addForm.focus();
});

// the to-do container
let items = document.getElementById("items");

const appendItem = (todo) => {
	console.log(todo);
	const li = document.createElement("li");
	li.innerText = todo.name;
	li.dataset["done"] = todo.done;
	li.style.textDecoration = todo.done ? "line-through" : "none";


	li.addEventListener("click", async (e) => {
		const update = { name: todo.name, done: li.dataset["done"] == "false" };
		const result = await bkn.update(token, "todos", todo.id, update);
		if (!result.ok) {
			console.error(result.content);
			return;
		}

		li.style.textDecoration = update.done ? "line-through" : "none";
		li.dataset["done"] = update.done ? "true" : "false";
	});

	items.appendChild(li);
}

const loadTodos = async () => {
	const result = await bkn.list(token, "todos");
	if (!result.ok) {
		console.error(result.content);
		return;
	}

	result.content.results.forEach(appendItem);
}