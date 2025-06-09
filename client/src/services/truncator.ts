export function truncator(text: string, maxLength:number = 25) {
    return text.length > maxLength ? text.slice(0, maxLength).trim() + '...' : text;
}