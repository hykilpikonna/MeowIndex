import urlJoin from 'url-join';
import mime from 'mime';
import moment from 'moment';
import { createResource, For, Show } from 'solid-js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/shift-away.css';
import './app.sass';

import { Icon } from '@iconify-icon/solid';

interface File {
  name: string 
  type: 'file' | 'directory'
  size: number
  mtime: string
}

const host = "https://daisy-ddns.hydev.org/data/api"

const path = window.location.pathname
const fetchApi = async () => await (await fetch(urlJoin(host, path))).json() as File[]

function sizeFmt(size: number) {
  var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
  return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

function getIcon(f: File)
{
  if (f.type == "directory") return "/mime/folder.svg"
  
  const sp = f.name.split(".")
  const m = mime.getType(sp[sp.length - 1])
  if (m) return `/mime/${m.replace("/", "-")}.svg`
  else return '/mime/application-blank.svg'
}

export default function App() {
  const [api] = createResource(fetchApi)
  const paths = [window.location.host, ...path.split("/").filter(it => it)]

  return (
    // Full screen container
    <div class="p-10 bg-dark-800 color-main min-h-full">

      {/* Content container */}
      <div class="max-w-screen-md m-auto">

        <p class="text-4xl color-emp text-center py-10">File Listing</p>

        {/* Breadcrumbs */}
        <div id="breadcrumbs" class="flex gap-2 bg-dark-600 p-2 px-5 mb-5 rounded-xl">
          <Icon icon="ion:wifi-outline" class="text-xl"/>
          <For each={paths}>{(p, i) => 
            <>
              <span class="color-sub" classList={{active: i() + 1 == paths.length}}>{p}</span>
              <span class="color-subsub last:hidden">/</span>
            </>
          }</For>
        </div>
        
        {api.loading && "Loading..."}

        {/* Files */}
        <div class="flex flex-col gap-1">

          {/* For each file */}
          <For each={api()}>{(f, i) => 
            <a class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center" href={urlJoin(path, f.name)}>
              <img class="w-10" src={getIcon(f)}></img>
              
              {/* File name tooltip */}
              <span class="flex-1 font-bold truncate" ref={el => tippy(el, {
                  content: f.name, placement: 'top', animation: 'shift-away', theme: 'light', delay: [1000, 100]
                })}>
                {f.name}
              </span>

              {/* File size */}
              <Show when={f.size !== undefined}>
                <span class="text-right basis-30">{sizeFmt(f.size)}</span>
              </Show>

              {/* Modification date */}
              <span class="text-right basis-30 select-none">{moment(f.mtime).fromNow()}</span>
            </a>
          }</For>
        </div>
      </div>
    </div>
  );
}
