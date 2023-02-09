import { Component, createResource, createSignal, For, lazy, Show } from 'solid-js';

const host = "https://daisy-ddns.hydev.org/data/api/OS"

const fetchApi = async () => await (await fetch(host)).json()
export default function App() {
  const [api] = createResource(fetchApi)

  return (
    <div class="p-10 bg-dark-800 text-rose-300 mh-full">
      <div class="max-w-screen-md m-auto">
        <p class="text-4xl text-rose-400 text-center py-10">File Listing</p>
        {api.loading && "Loading..."}
        <div class="flex flex-col gap-1">
          <For each={api()}>{(f, i) => 
            <span class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center">
              <span class="flex-1 font-bold">{f.name}</span>
              <Show when={f.size !== undefined}>
                <span class="text-right basis-30">{f.size}</span>
              </Show>
              <span class="text-right basis-30 select-none">
                {f.mtime}
              </span>
            </span>
          }</For>
        </div>
      </div>
    </div>
  );
}
