import urlJoin from 'url-join';
import mime from 'mime';
import moment from 'moment';
import { createResource, createSignal, For, Show } from 'solid-js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/shift-away.css';
import './app.sass';

import { Icon } from '@iconify-icon/solid';
import { sizeFmt } from './utils';

interface File {
  name: string 
  type: 'file' | 'directory'
  size: number
  mtime: string
}

// const assets = ".web-static"
const assets = "/"
const host = "https://daisy-ddns.hydev.org/data/api"

const path = window.location.pathname
const fetchApi = async () => await (await fetch(urlJoin(host, path))).json() as File[]

function getIcon(f: File)
{
  if (f.type == "directory") return "/mime/folder.svg"
  
  const sp = f.name.split(".")
  const m = mime.getType(sp[sp.length - 1])
  if (m) return urlJoin(assets, `mime/${m.replace("/", "-")}.svg`)
  else return urlJoin(assets, 'mime/application-blank.svg')
}

function getHref(f: File)
{
  return f.type == "directory" ? urlJoin(path, f.name) : urlJoin(host, path, f.name)
}

function getParent(level: number)
{
  return urlJoin(path, "../")
}

export default function App() {
  let bcMax: number
  const [api] = createResource(fetchApi)
  const [bcLeft, setBcLeft] = createSignal(0)
  const paths = [window.location.host, ...path.split("/").filter(it => it)]

  // Handle wheel for breadcrumb
  function wheel(e: WheelEvent)
  {
    let direction = (e.detail < 0 || e.deltaY > 0) ? 1 : -1
    setBcLeft(Math.max(Math.min(bcLeft() + direction * 20, bcMax), 0))
  }

  // Set initial breadcrumb wheel to show the end path
  const initWheel = (w: HTMLDivElement) => setTimeout(() => 
    setBcLeft(bcMax = Math.round(w.clientWidth - w.parentElement.clientWidth)), 100)

  return (
    // Full screen container
    <div class="p-10 bg-dark-800 color-main min-h-full">

      {/* Content container */}
      <div class="max-w-screen-md m-auto">

        <p class="text-4xl color-emp text-center py-10">File Listing</p>

        {/* Breadcrumbs */}
        <div id="breadcrumbs" class="flex bg-dark-600 p-2 px-5 mb-5 rounded-xl whitespace-nowrap">
          <Icon icon="ion:wifi-outline" class="text-xl mr-2"/>
          <div class="overflow-hidden flex-1">
            <div class="w-min" onWheel={e => wheel(e)} 
                style={{'margin-left': -bcLeft() + 'px'}} ref={w => initWheel(w)}> 
              <For each={paths}>{(p, i) => 
                <>
                  <a class="breadcrumb-link ml-2 first:ml-0" 
                    classList={{active: i() + 1 == paths.length}} 
                    href={urlJoin(path, "../".repeat(paths.length - i() - 1))}>{decodeURIComponent(p)}</a>
                  <span class="color-subsub ml-2 last:hidden">/</span>
                </>
              }</For>
            </div>
          </div>
          <Icon icon="ion:search-outline" class="text-xl ml-2"/>
        </div>
        
        {api.loading && "Loading..."}

        {/* Files */}
        <div class="flex flex-col gap-1">

          {/* For each file */}
          <For each={api()}>{(f, i) => 
            <a class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center" href={getHref(f)}>
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
