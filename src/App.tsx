import urlJoin from 'url-join';
import mime from 'mime';
import moment from 'moment';
import {createResource, createSignal, ErrorBoundary, For, Show} from 'solid-js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/animations/shift-away.css';
import './app.sass';

import { Icon } from '@iconify-icon/solid';
import { clamp, sizeFmt } from './utils';
import InfiniteScroll from 'solid-infinite-scroll-fork';

interface File {
  name: string 
  type?: 'file' | 'directory'
  file_type?: 'file' | 'directory' | 'link'
  size: number
  mtime: string
  mime?: string
  has_thumb?: boolean
}

const getType = (f: File) => f.type ?? f.file_type

// Placeholder for nginx to replace
let assetsPath = "{ASSETS-PATH-PLACEHOLDER}"
let deployPath = "{DEPLOY-PATH-PLACEHOLDER}"
let host = "{HOST-PLACEHOLDER}"

// Default paths and host for testing
if (assetsPath.includes("-PLACEHOLDER")) assetsPath = "/"
if (deployPath.includes("-PLACEHOLDER")) deployPath = "/"
if (host.includes("-PLACEHOLDER")) host = "https://daisy.hydev.org/data/api"

// Compute path
let fullPath = window.location.pathname
let filePath = fullPath.startsWith(deployPath) ? fullPath.substring(deployPath.length) : fullPath
if (!filePath.startsWith('/')) filePath = `/${filePath}`

const fetchApi = async () =>
{
  const req = await fetch(urlJoin(host, filePath))
  if (req.status == 404) throw "404"
  return await req.json() as File[]
}

function getIcon(f: File)
{
  if (getType(f) == "directory") return urlJoin(assetsPath, "mime/folder.svg")

  if (f.has_thumb) return urlJoin(host, filePath, f.name) + "?thumb=1"
  
  const sp = f.name.split(".")
  const m = f.mime ?? mime.getType(sp[sp.length - 1])
  if (m) return urlJoin(assetsPath, `mime/${m.replace("/", "-")}.svg`)
  else return urlJoin(assetsPath, 'mime/application-blank.svg')
}

function getHref(f: File)
{
  return getType(f) == "directory" ? (urlJoin(fullPath, f.name) + "/") : urlJoin(host, filePath, f.name)
  // return urlJoin(fullPath, f.name)
}

const alpNum = new Set("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")

export default function App() {
  const [api] = createResource(fetchApi)
  const paths = [window.location.host, ...fullPath.split("/").filter(it => it)]

  // Infinite Scroll
  const [scrollIndex, setScrollIndex] = createSignal(50)
  const scrollNext = () => setScrollIndex(Math.min(scrollIndex() + 20, api().length))

  // Search
  let searchInp: HTMLInputElement
  const [search, setSearch] = createSignal("")
  const [searchOn, setSearchOn] = createSignal(false)
  const searchChange = e => {
    const val = (e.target as HTMLInputElement).value
    setSearch(val)
    if (val.length == 0) setSearchOn(false)
  }
  const searchActivate = () => {
    setSearchOn(true)
    searchInp.focus()
    console.log("Search activate")
  }
  const searchDeactivate = () => {
    setSearchOn(false)
    setSearch("")
    console.log("Search deactivate")
  }
  window.addEventListener("keydown", searchActivate)

  const filteredApi = () => api()?.filter(it => search() ? it.name.toLowerCase().includes(search().toLowerCase()) : true)
    .slice(0, scrollIndex())

  // Handle wheel for breadcrumb
  let bcMax: number
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

        <div class="heading color-emp text-center py-10">
          <p class="text-4xl">File Listing</p>
          <div class="flex justify-center opacity-50">
            <a class="flex gap-1" href="https://github.com/hykilpikonna/MeowIndex">
              Powered by Nginx MeowIndex
              <Icon class="text-lg" icon="mdi:github"/>
            </a>
          </div>
        </div>

        {/* Breadcrumb slot */}
        <div id="breadcrumbs" class="flex bg-dark-600 p-2 px-5 mb-5 rounded-xl whitespace-nowrap relative z-30">
          <Icon icon="ion:wifi-outline" class="text-xl mr-2"/>

          {/* Search bar */}
          <Show when={searchOn()} keyed>
            <input ref={searchInp} class="bg-transparent flex-1 outline-none"
                   value={search()} onkeyup={searchChange} />
          </Show>

          {/* Breadcrumbs */}
          <Show when={!searchOn()} keyed>
            <div class="overflow-hidden flex-1">
              <div class="w-min" onWheel={e => wheel(e)}
                   style={{'margin-left': -bcLeft() + 'px'}} ref={w => initWheel(w)}>
                <For each={paths}>{(p, i) =>
                  <>
                    <a class="breadcrumb-link ml-2 first:ml-0"
                       classList={{active: i() + 1 == paths.length}}
                       href={urlJoin(fullPath, "../".repeat(paths.length - i() - 1))}>{decodeURIComponent(p)}</a>
                    <span class="color-subsub ml-2 last:hidden">/</span>
                  </>
                }</For>
              </div>
            </div>
          </Show>

          <Icon icon="ion:search-outline" class="text-xl ml-2" onclick={e => searchOn() ? searchDeactivate() : searchActivate()}/>
        </div>

        {/*{api.loading && "Loading..."}*/}

        {/* Files */}
        <ErrorBoundary fallback={e => <div class="flex w-full flex-1 text-xl justify-center">
          {e == "404" ? "404: Not found" : `Error: ${e}`}
        </div>}>
        <div class="flex flex-col gap-1">

          {/* For each file */}
          <InfiniteScroll each={filteredApi()}
                          loadingMessage={<></>}
                          hasMore={scrollIndex() < api()?.length} next={scrollNext}>{(f, i) =>
            <a class="w-full flex gap-4 transition-all duration-300 bg-dark-800 hover:bg-dark-300 hover:duration-0 rounded-xl p-2 items-center"
               href={getHref(f)}>
              <img class="w-10 max-h-10 object-contain" src={getIcon(f)} alt=""></img>
              
              {/* File name tooltip */}
              <span class="flex-1 font-bold truncate" ref={el => tippy(el, {
                  content: f.name, placement: 'top', animation: 'shift-away', theme: 'light', delay: [1000, 100]
                })}>
                {f.name}
              </span>

              {/* File size */}
              <Show when={f.size !== undefined} keyed>
                <span class="text-right basis-30 <sm:basis-15 overflow-hidden whitespace-nowrap">{sizeFmt(f.size)}</span>
              </Show>

              {/* Modification date */}
              <span class="text-right basis-30 select-none <sm:hidden">{moment(f.mtime).fromNow()}</span>
            </a>
          }</InfiniteScroll>
        </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
