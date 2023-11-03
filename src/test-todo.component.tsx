import { trackStore } from '@solid-primitives/deep';
import { createUndoHistory } from '@solid-primitives/history';
import { createEffect } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';
import { For } from 'solid-js/web';

export const TestTodo = () => {
  let input!: HTMLInputElement;
  let todoId = 0;
  const [todos, setTodos] = createStore<{ [key: number]: string }>({});

  const history = createUndoHistory(() => {
    trackStore(todos);
    const copy = structuredClone(unwrap(todos));
    return () => {
      setTodos(reconcile(copy));
    };
  });

  const addTodo = (text: string) => {
    setTodos(
      produce((todos) => {
        todoId++;
        todos[todoId] = text;
      })
    );
  };

  createEffect(() => {
    console.log(`todos`, trackStore(unwrap(todos)));
  });

  return (
    <>
      <div>
        <input ref={input} />
        <button disabled={!history.canUndo()} onClick={() => history.undo()}>
          undo
        </button>
        <button disabled={!history.canRedo()} onClick={() => history.redo()}>
          undo
        </button>
        <button
          onClick={(e) => {
            if (!input.value.trim()) return;
            addTodo(input.value);
            input.value = '';
          }}
        >
          Add Todo
        </button>
      </div>
      <For each={Object.values(todos)}>
        {(todo) => {
          console.log(`Creating ${todo}`);
          return (
            <div>
              <span>{todo}</span>
            </div>
          );
        }}
      </For>
    </>
  );
};
