import { createSubscription } from '@utils/create-subscription';
import {
  animationFrameScheduler,
  fromEvent,
  merge,
  switchMapTo,
  takeUntil,
  timer,
} from 'rxjs';

declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      onHold: (event: number) => void;
    }
  }
}

export function onHold(
  element: HTMLElement,
  accessor: () => (event: number) => void
) {
  const setDrag = accessor();

  const start$ = fromEvent(element, 'pointerdown');
  const end$ = merge(
    fromEvent(element, 'pointerup'),
    fromEvent(element, 'pointerleave')
  );

  const frameByFrame = start$.pipe(
    switchMapTo(timer(250, 50, animationFrameScheduler).pipe(takeUntil(end$)))
  );

  const subscription = createSubscription();

  subscription.add(frameByFrame.subscribe((event) => setDrag(event)));
}
