import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { API, Storage } from 'aws-amplify';
import React from 'react';
import './App.css';
import {
	createTodo as createTodoMutation,
	deleteTodo as deleteTodoMutation
} from './graphql/mutations';
import { listTodos } from './graphql/queries';
import logo from './logo.svg';

const initialFormState = {
	name: '',
	description: '',
	image: '',
};

function App() {
	const [todos, setTodos] = React.useState([]);
	console.log(todos);
	const [formState, setFormState] = React.useState(initialFormState);

	React.useEffect(() => {
		fetchTodos();
	}, []);

	async function onChange(e) {
		if (!e.target.files[0]) return;
		const file = e.target.files[0];
		setFormState({ ...formState, image: file.name });
		await Storage.put(file.name, file);
		fetchTodos();
	}

	async function fetchTodos() {
		const apiData = await API.graphql({ query: listTodos });
		const todosFromApi = apiData.data.listTodos.items;
		console.log(todosFromApi);
		await Promise.all(
			todosFromApi.map(async todo => {
				if (todo.image) {
					const image = await Storage.get(todo.image);
					todo.image = image;
				}
				return todo;
			}),
		);
		setTodos(apiData.data.listTodos.items);
	}

	async function createTodo() {
		if (!formState.name || !formState.description) return;
		await API.graphql({
			query: createTodoMutation,
			variables: { input: formState },
		});
		if (formState.image) {
			const image = await Storage.get(formState.image);
			formState.image = image;
		}
		setTodos([...todos, formState]);
		setFormState(initialFormState);
	}

	async function deleteTodo({ id, _version }) {
		const newTodoArray = todos.filter(todo => todo.id !== id);
		setTodos(newTodoArray);
		await API.graphql({
			query: deleteTodoMutation,
			variables: { input: { id, _version } },
		});
	}

	return (
		<div className="App">
			<header>
				<img src={logo} className="App-logo" alt="logo" />
				<h1>Todo App with Amplify and React</h1>
				<h2>Create Todo</h2>
			</header>
			<main>
				<div className="form-control">
					<input
						onChange={e => setFormState({ ...formState, name: e.target.value })}
						placeholder="Todo name"
						value={formState.name}
					/>
				</div>
				<div className="form-control">
					<input
						onChange={e =>
							setFormState({ ...formState, description: e.target.value })
						}
						placeholder="Todo description"
						value={formState.description}
					/>
				</div>
				<div className="form-control">
					<input type="file" onChange={onChange} />
				</div>
				<div className="form-control">
					<button onClick={createTodo}>Create Todo</button>
				</div>
				<div className="todos">
					<h2>Todos</h2>
					<section
						style={{
							marginBottom: 30,
							display: 'grid',
							gridTemplateColumns: 'repeat(3, 1fr)',
							marginTop: 10,
							padding: 10
						}}
					>
						{todos.map(todo => (
							<div key={todo.id} style={{ display: 'flex' }}>
								{todo.image && (
									<img
										src={todo.image}
										alt="todo"
										style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 5  }}
									/>
								)}
								<div style={{ marginBottom: 10, textAlign: 'justify', paddingLeft: 5 }}>
								<h2 style={{ margin: 0 }}>{todo.name}</h2>
								<p>{todo.description}</p>
									<button onClick={async () => await deleteTodo(todo)}>
										Delete
									</button>
								</div>
							</div>
						))}
					</section>
				</div>
			</main>
			<AmplifySignOut />
		</div>
	);
}

export default withAuthenticator(App);
