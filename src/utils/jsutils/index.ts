import './jsutils.scss';


// observer: do something now or in the future if the target does not exist. 
// event return: undefined (i.e. not returned): stop monitoring. 
// event return: 'continue': continue monitoring for future changes. 
function wait_for(ancestor: string, target: string, callback_proc: (Element) => 'continue' | undefined) {
    const node_ancestor = document.querySelector(ancestor);
    
    const check = () => {
        const tar = node_ancestor.querySelector(target);
        return tar && callback_proc(tar) === undefined;
    };

    if (typeof MutationObserver === 'function' && !check()) {
        const observer = new MutationObserver(() => {
            if (check()) {
                observer.disconnect();
            }
        });
        observer.observe(node_ancestor, { subtree: true, childList: true });
    }
}

function is_portrait(): boolean {
    return window.getComputedStyle(document.documentElement).getPropertyValue('--cnblogx-portrait').trim() === '1';
}

function regi_scroll(callback: () => void) {
    window.addEventListener('scroll', callback);
    if (typeof ResizeObserver === 'function') {
        (new ResizeObserver(callback)).observe(document.body);
    } else {
        window.addEventListener('resize', callback);
    }
    callback();
}

function literal_as_str(raw: string): string {
    const inner = raw.match(/^'(.*)'$/);
    return inner ? inner[1] : raw;
}

function literal_as_strs(raw: string): string[] {
    return raw.split(',').map((str) => literal_as_str(str.trim()));
}

function debounce(func: (...args) => void, wait: number, immediate = false) {
    let timeout: NodeJS.Timeout | null = null;

    return function execIt(...args) {

        const later = function () {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };

        const callNow = immediate && !timeout;

        clearTimeout(timeout);

        timeout = setTimeout(later, wait);

        if (callNow) func.apply(this, args);
    };
}

function throttle(func: (...args) => void, wait: number) {
    let previous = 0;
    return function (...args) {
        const now = Date.now();
        if (now - previous > wait) {
            func.apply(this, args);
            previous = now;
        }
    }
}

function one_shot(el: HTMLElement, type: keyof HTMLElementEventMap, func: (...args) => void): () => void {
    
    function once(...args) {
        el.removeEventListener(type, once);
        func.apply(el, args);
    }

    el.addEventListener(type, once);

    return () => el.removeEventListener(type, once);
}

export {
    wait_for,
    one_shot,
    throttle, 
    debounce,
    is_portrait,
    regi_scroll,
    literal_as_str,
    literal_as_strs,
};