import urlJoin from 'url-join';
import mime from 'mime';
import moment from 'moment';
import { createResource, For, Show } from 'solid-js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/shift-away.css';
import './app.sass';

const host = "https://daisy-ddns.hydev.org/data/api"

const path = window.location.pathname
const fetchApi = async () => await (await fetch(urlJoin(host, path))).json()

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
    <div class="p-10 bg-dark-800 text-rose-300 min-h-full">
      <div class="max-w-screen-md m-auto">
        <p class="text-4xl text-rose-400 text-center py-10">File Listing</p>
        {api.loading && "Loading..."}
        <div class="flex flex-col gap-1">
          <For each={api()}>{(f, i) => 
            <a class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center" href={urlJoin(path, f.name)}>
              <img class="w-10" src={getIcon(f)}></img>
              <span class="flex-1 font-bold truncate" ref={el => tippy(el, {
                  content: f.name, placement: 'top', animation: 'shift-away', theme: 'light', delay: [1000, 100]
                })}>
                {f.name}
              </span>
              <Show when={f.size !== undefined}>
                <span class="text-right basis-30">{sizeFmt(f.size)}</span>
              </Show>
              <span class="text-right basis-30 select-none">
                {moment(f.mtime).fromNow()}
              </span>
            </a>
          }</For>
        </div>
      </div>
    </div>
  );
}
