import { ErrorBoundary, For } from 'solid-js';
import { VideoApp } from './video-app';

declare module 'solid-js' {
  namespace JSX {
    interface ExplicitAttributes {
      type: string;
    }
  }
}

export default function App() {
  return (
    <ErrorBoundary
      fallback={(error) => {
        console.error(error);
        return <div>Error in the Player</div>;
      }}
    >
      <header class="box-border flex flex-col bg-black">
        <nav class="text-#ada69b box-content  flex h-[22.6771px] p-[7px_20px_2px_25px] text-[12.6px] leading-[16.38px]">
          <ul class="m-0 flex gap-4 p-0">
            <For
              each={[
                { title: 'Home', href: 'https://redmine.ireptu.film/' },
                { title: 'My page', href: 'https://redmine.ireptu.film/my/page' },
                { title: 'Projects', href: 'https://redmine.ireptu.film/projects' },
                { title: 'Help', href: 'https://www.redmine.org/guide' }
              ]}
            >
              {(item) => (
                <li class="float-left m-0 list-none whitespace-nowrap p-0">
                  <a>{item.title}</a>
                </li>
              )}
            </For>
          </ul>
        </nav>
        <div class="text-#e4e1de bg-#21292e box-border">
          <h1 class="ireptu-logo">IREPTU FILMS HQ</h1>
        </div>
      </header>
      <main class="mx-auto box-border max-w-6xl px-2 py-10">
        <VideoApp />
      </main>
    </ErrorBoundary>
  );
}
