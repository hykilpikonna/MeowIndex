/**
 * Format bytes to human-readable size
 * 
 * @param size Size in bytes
 * @returns Human readable size in string
 */
export function sizeFmt(size: number): string {
    var i = size == 0 ? 0 : Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(1024, i)).toFixed(1) + ' ' + ['B', 'kB', 'MB', 'GB', 'TB'][i];
}

export function clamp(num: number, min: number, max: number) {
    return Math.max(Math.min(num, max), min)
}