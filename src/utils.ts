/**
 * Format bytes to human-readable size
 * 
 * @param size Size in bytes
 * @returns Human readable size in string
 */
export function sizeFmt(size: number): string {
    const i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    size = size / Math.pow(1024, i)
    const fmt = size >= 100 ? size.toFixed(0) : size.toFixed(1)
    return fmt + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function clamp(num: number, min: number, max: number) {
    return Math.max(Math.min(num, max), min)
}
