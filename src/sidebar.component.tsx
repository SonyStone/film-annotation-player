import { createSignal } from 'solid-js';

import { For } from 'solid-js';
import { effect } from 'solid-js/web';

import AddIcon from './icons/add.svg';

export function Sidebar(props: { isOpen?: (value: boolean) => void }) {
  const [isOpen, setIsOpen] = createSignal(true);

  effect(() => {
    props.isOpen?.(isOpen());
  });

  return (
    <>
      <div
        class={[
          'w-360px  bg-#eeeeee border-l-solid border-coolgray absolute inset-y-0 right-10 box-border box-border flex flex-col border transition-transform',
          isOpen() ? 'translate-x-0%  ' : 'translate-x-100%'
        ].join(' ')}
      >
        <div id="chat-header" class="box-border box-border grid grid-cols-[0.6fr_0.4fr] gap-2 p-2">
          <div class="flex w-full gap-2">
            <span class="border-coolgray flex-1 border border-solid p-2 text-center">ABR_Ep01_010</span>
            <span class="w-40px border-coolgray border border-solid p-2 text-center">v01</span>
          </div>
          <span class="border-coolgray border border-solid p-2 text-center">Comp</span>
          <span class="border-coolgray border border-solid p-2 text-center">Дмитрий Корников</span>
          <span class="border-coolgray border border-solid p-2 text-center">В разработке</span>
        </div>
        <div id="chat" class="relative box-border flex flex-1 flex-col gap-2 overflow-y-scroll p-2">
          <div class="min-h-1 bg-#eeeeee pointer-events-none sticky -top-2 w-full shadow-[0_0_0.5rem_0.5rem_#eeeeee]"></div>
          <For each={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]}>
            {(item) => (
              <div id="chat-comment" class="min-h-4 box-border flex w-full flex-[0_0_auto] gap-2 p-2">
                <div class="w-40px h-40px box-border flex place-content-center place-items-center rounded-full bg-white">
                  A
                </div>
                <div class="box-border flex-1 rounded bg-white p-2 text-black">Comment</div>
              </div>
            )}
          </For>
          <div class="min-h-1 bg-#eeeeee pointer-events-none sticky -bottom-2 w-full shadow-[0_0_0.5rem_0.5rem_#eeeeee]"></div>
        </div>
        <div id="input" class="box-border flex w-full p-2">
          <textarea class="h-10 flex-1" />
          <button>
            <AddIcon />
          </button>
        </div>
      </div>
      <div class="bg-#eeeeee z-1 border-coolgray min-w-10 border-l-solid box-border flex w-10 flex-col border">
        <button
          class="border-b-solid border-coolgray hover:bg-#00000010 box-border h-10 border border-none bg-transparent text-black"
          onClick={() => setIsOpen(!isOpen())}
        >
          T
        </button>
      </div>
    </>
  );
}
