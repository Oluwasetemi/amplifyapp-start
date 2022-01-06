import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { API } from 'aws-amplify';
import React from 'react';
import './App.css';
import {
  createTodo as createTodoMutation,
  deleteTodo as deleteTodoMutation
} from './graphql/mutations';
import { listTodos } from './graphql/queries';
import logo from './logo.svg';


const initialFormState = { name: '', description: '' };

function App() {
  const [todos, setTodos] = React.useState([]);
  console.log(todos)
  const [formState, setFormState] = React.useState(initialFormState);

  React.useEffect(() => {
    fetchTodos();
  }, [])

  async function fetchTodos() {
		const apiData = await API.graphql({ query: listTodos });
		setTodos(apiData.data.listTodos.items);
	}

	async function createTodo() {
		if (!formState.name || !formState.description) return;
		await API.graphql({
			query: createTodoMutation,
			variables: { input: formState },
		});
		setTodos([...todos, formState]);
		setFormState(initialFormState);
	}

  async function deleteTodo({ id, _version }) {
    console.log(id)
    console.log(_version)
    console.log('====================')
    const newTodoArray = todos.filter(todo => todo.id !== id);
    // console.log(newTodoArray)
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
			</header>
			<main>
				<input
					onChange={e => setFormState({ ...formState, name: e.target.value })}
					placeholder="Todo name"
					value={formState.name}
				/>
				<input
					onChange={e =>
						setFormState({ ...formState, description: e.target.value })
					}
					placeholder="Todo description"
					value={formState.description}
				/>
        <button onClick={createTodo}>Create Todo</button>

        <section style={{ marginBottom: 30 }}>
          {
            todos.map(todo => (
              <div key={todo.id}>
                <h2>{todo.name}</h2>
                <p>{todo.description}</p>
                <button onClick={async () => await deleteTodo(todo)}>Delete</button>
              </div>
            ))
          }
        </section>
			</main>
			<AmplifySignOut />
		</div>
	);
}

export default withAuthenticator(App);
