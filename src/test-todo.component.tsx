import { trackStore } from '@solid-primitives/deep';
import { createUndoHistory } from '@solid-primitives/history';
import { For } from 'solid-js';
import { createStore, produce, reconcile, unwrap } from 'solid-js/store';

export const TestTodo = () => {
  let input!: HTMLInputElement;
  let todoId = 0;
  const [todos, setTodos] = createStore<{ [key: number]: { image: { id: number } | undefined; text: string } }>({});

  const history = createUndoHistory(() => {
    trackStore(todos);
    const copy = structuredClone(unwrap(todos));

    return () => {
      setTodos(reconcile(structuredClone(copy)));
    };
  });

  const addTodo = (text: string) => {
    setTodos(
      produce((todos) => {
        todoId++;
        if (todos[0]) {
          todos[0].image = { id: todoId };
        } else {
          todos[0] = { image: { id: todoId }, text: 'new one' };
        }
      })
    );
  };

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
      <div>
        <For each={Object.values(todos)}>
          {(item) => (
            <span>
              {item.text} | {item.image?.id}
            </span>
          )}
        </For>
      </div>
    </>
  );
};
