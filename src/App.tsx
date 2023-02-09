import mime from 'mime';
import moment from 'moment';
import { Component, createResource, createSignal, For, lazy, Show } from 'solid-js';

const host = "https://daisy-ddns.hydev.org/data/api/OS"

const fetchApi = async () => await (await fetch(host)).json()

function sizeFmt(size: number) {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function getIcon(f)
{
  if (f.type == "directory") return "/mime/folder.svg"
  
  const sp = f.name.split(".")
  const m = mime.getType(sp[sp.length - 1])
  if (m) return `/mime/${m.replace("/", "-")}.svg`
  else return '/mime/application-blank.svg'
}
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
              <img class="w-10" src={getIcon(f)}></img>
              <span class="flex-1 font-bold">{f.name}</span>
              <Show when={f.size !== undefined}>
                <span class="text-right basis-30">{sizeFmt(f.size)}</span>
              </Show>
              <span class="text-right basis-30 select-none">
                {moment(f.mtime).fromNow()}
              </span>
            </span>
          }</For>
        </div>
      </div>
    </div>
  );
}
