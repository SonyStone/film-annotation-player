import { Accessor, createMemo } from 'solid-js';
import { createStore, produce } from 'solid-js/store';
import { effect } from 'solid-js/web';

export interface StateHistoryOptions<State> {
  maxAge: number;

  // comparatorFn: (prev, current) => isEqual(prev, current) === false
  comparatorFn: (prevState: State, currentState: State) => boolean;
}

type History<State> = {
  past: State[];
  present: State;
  future: State[];
};

export interface StateHistoryOptions<State> {
  maxAge: number;

  // comparatorFn: (prev, current) => isEqual(prev, current) === false
  comparatorFn: (prevState: State, currentState: State) => boolean;
}

export function createStoreHistory<T>(props: {
  store: Accessor<T>;
  setStore: (value: T) => void;
  options?: Partial<StateHistoryOptions<T>>;
}) {
  const mergedOptions = { maxAge: 10, comparatorFn: () => true, ...props.options };

  const [history, setHistory] = createStore<History<T>>({
    past: [],
    present: props.store(),
    future: []
  });

  let paused = false;
  let skipUpdate = false;

  const hasPast = createMemo(() => history.past.length > 0);
  const hasFuture = createMemo(() => history.future.length > 0);

  effect(() => {
    props.setStore(history.present);
  });

  effect(() => {
    const present = props.store();

    if (skipUpdate || paused) {
      return;
    }

    const past = history.present;
    const shouldUpdate = !past || mergedOptions.comparatorFn!(past, present);

    if (shouldUpdate) {
      setHistory(
        produce((state) => {
          if (state.past.length === mergedOptions.maxAge) {
            state.past = state.past.slice(1);
          }
          if (past) {
            state.past = [...state.past, past];
          }
          state.present = present;
        })
      );
    }

    console.log(`add-1`, history.present);
  });

  function undo() {
    console.log(`undo`, history.past.length);
    if (history.past.length) {
      setHistory(
        produce((state) => {
          const { past, present, future } = state;
          const previous = past[past.length - 1];
          state.past = past.slice(0, past.length - 1);
          state.present = previous;
          state.future = [present!, ...future];
        })
      );
    }
  }

  function redo() {
    if (history.future.length) {
      setHistory(
        produce((state) => {
          const { past, present, future } = state;
          const next = future[0];
          const newFuture = future.slice(1);
          state.past = [...past, present!];
          state.present = next;
          state.future = newFuture;
        })
      );
    }
  }

  // function jumpToPast(index: number) {
  //   if (index < 0 || index >= this.history.past.length) return;

  //   const { past, future, present } = this.history;
  //   const newPast = past.slice(0, index);
  //   const newFuture = [...past.slice(index + 1), present, ...future] as History<State>['future'];
  //   const newPresent = past[index];
  //   this.history.past = newPast;
  //   this.history.present = newPresent;
  //   this.history.future = newFuture;
  //   this.update();
  // }

  // function jumpToFuture(index: number) {
  //   if (index < 0 || index >= this.history.future.length) return;

  //   const { past, future, present } = this.history;

  //   const newPast = [...past, present, ...future.slice(0, index)];
  //   const newPresent = future[index];
  //   const newFuture = future.slice(index + 1);
  //   history.past = newPast as History<State>['past'];
  //   history.present = newPresent;
  //   history.future = newFuture;
  //   update();
  // }

  /**
   *
   * jump n steps in the past or forward
   *
   */
  // function jump(n: number) {
  //   if (n > 0) {
  //     return jumpToFuture(n - 1);
  //   }
  //   if (n < 0) {
  //     return jumpToPast(history.past.length + n);
  //   }
  // }

  /**
   *
   * Clear the history
   *
   * @param customUpdateFn Callback function for only clearing part of the history
   *
   * @example
   *
   * stateHistory.clear((history) => {
   *  return {
   *    past: history.past,
   *    present: history.present,
   *    future: []
   *  };
   * });
   */
  // function clear(customUpdateFn?: (history: History<State>) => History<State>) {
  //   history = isFunction(customUpdateFn)
  //     ? customUpdateFn(this.history)
  //     : {
  //         past: [],
  //         present: null,
  //         future: []
  //       };
  //   updateHasHistory();
  // }

  function pause() {
    paused = true;
  }

  function resume() {
    paused = false;
  }

  return {
    undo,
    redo
  };
}
