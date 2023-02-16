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
import { clamp, sizeFmt } from './utils';
import InfiniteScroll from 'solid-infinite-scroll';

interface File {
  name: string 
  type: 'file' | 'directory'
  size: number
  mtime: string
}

// Placeholder for nginx to replace
let deployPath = "{DEPLOY-PATH-PLACEHOLDER}"
let host = "{HOST-PLACEHOLDER}"

// Default deploy path and host for testing
if (deployPath.includes("-PLACEHOLDER")) deployPath = "/"
if (host.includes("-PLACEHOLDER")) host = "https://daisy.hydev.org/data/api"

// Compute path
let fullPath = window.location.pathname
let filePath = fullPath.startsWith(deployPath) ? fullPath.substring(deployPath.length) : fullPath
if (!filePath.startsWith('/')) filePath = `/${filePath}`

const fetchApi = async () => await (await fetch(urlJoin(host, filePath))).json() as File[]

function getIcon(f: File)
{
  if (f.type == "directory") return urlJoin(deployPath, "mime/folder.svg")
  
  const sp = f.name.split(".")
  const m = mime.getType(sp[sp.length - 1])
  if (m) return urlJoin(deployPath, `mime/${m.replace("/", "-")}.svg`)
  else return urlJoin(deployPath, 'mime/application-blank.svg')
}

function getHref(f: File)
{
  return f.type == "directory" ? urlJoin(fullPath, f.name) : urlJoin(host, filePath, f.name)
}

export default function App() {
  let bcMax: number
  const [api] = createResource(fetchApi)
  const paths = [window.location.host, ...filePath.split("/").filter(it => it)]

  // Infinite Scroll
  const [scrollIndex, setScrollIndex] = createSignal(50)
  const scrollNext = () => setScrollIndex(Math.min(scrollIndex() + 20, api().length))

  // Search
  const [search, setSearch] = createSignal<string>()

  // Handle wheel for breadcrumb
  const [bcLeft, setBcLeft] = createSignal(0)
  function wheel(e: WheelEvent)
  {
    e.preventDefault()
    e.stopPropagation()

    let direction = (e.detail < 0 || e.deltaY > 0) ? 1 : -1
    setBcLeft(clamp(bcLeft() + direction * 20, 0, bcMax))
  }

  // Set initial breadcrumb wheel to show the end path
  const initWheel = (w: HTMLDivElement) => setTimeout(() => {
    setBcLeft(Math.max(bcMax = Math.round(w.clientWidth - w.parentElement.clientWidth), 0))
  }, 100)

  return (
    // Full screen container
    <div class="p-2 text-sm bg-dark-800 color-main min-h-full lg:(p-10 text-base)">

      {/* Content container */}
      <div class="max-w-screen-md m-auto">

        <p class="text-4xl color-emp text-center py-10">File Listing</p>

        {/* Breadcrumb slot */}
        <div id="breadcrumbs" class="flex bg-dark-600 p-2 px-5 mb-5 rounded-xl whitespace-nowrap">
          <Icon icon="ion:wifi-outline" class="text-xl mr-2"/>

          {/* Search bar */}
          <Show when={search() !== undefined} keyed>
            <input value={search()} onchange={e => setSearch((e.target as HTMLInputElement).value)} />
          </Show>

          {/* Breadcrumbs */}
          <Show when={search() === undefined} keyed>
            <div class="overflow-hidden flex-1">
              <div class="w-min" onWheel={e => wheel(e)}
                   style={{'margin-left': -bcLeft() + 'px'}} ref={w => initWheel(w)}>
                <For each={paths}>{(p, i) =>
                  <>
                    <a class="breadcrumb-link ml-2 first:ml-0"
                       classList={{active: i() + 1 == paths.length}}
                       href={urlJoin(filePath, "../".repeat(paths.length - i() - 1))}>{decodeURIComponent(p)}</a>
                    <span class="color-subsub ml-2 last:hidden">/</span>
                  </>
                }</For>
              </div>
            </div>
          </Show>
          <Icon icon="ion:search-outline" class="text-xl ml-2"/>
        </div>
        
        {api.loading && "Loading..."}

        {/* Files */}
        <div class="flex flex-col gap-1">

          {/* For each file */}
          <InfiniteScroll each={api()?.filter(it => search() ? it.name.includes(search()) : true).slice(0, scrollIndex())}
                          hasMore={scrollIndex() < api()?.length} next={scrollNext}>{(f, i) =>
            <a class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center"
               href={getHref(f)}>
              <img class="w-10" src={getIcon(f)} alt=""></img>
              
              {/* File name tooltip */}
              <span class="flex-1 font-bold truncate" ref={el => tippy(el, {
                  content: f.name, placement: 'top', animation: 'shift-away', theme: 'light', delay: [1000, 100]
                })}>
                {f.name}
              </span>

              {/* File size */}
              <Show when={f.size !== undefined}>
                <span class="text-right basis-30 <sm:basis-15 overflow-hidden whitespace-nowrap">{sizeFmt(f.size)}</span>
              </Show>

              {/* Modification date */}
              <span class="text-right basis-30 select-none <sm:hidden">{moment(f.mtime).fromNow()}</span>
            </a>
          }</InfiniteScroll>
        </div>
      </div>
    </div>
  );
}
