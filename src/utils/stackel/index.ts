import './stackel.scss';

interface Stackel {
    tar: HTMLElement,
    zord: number,
}

declare global {
    interface Window {
        cnblogx_stackel: Stackel[],
    }
}

function bind_stackel(tar: HTMLElement, zord: number) {
    if (window.cnblogx_stackel === undefined) {
        Object.defineProperty(window, 'cnblogx_stackel', {
            value: [],
        });
    }

    window.cnblogx_stackel.push({ tar: tar, zord: zord });
    window.cnblogx_stackel.sort((a, b) => (a.zord - b.zord));

    tar.classList.add('cnblogx_stackel');

    window.cnblogx_stackel.forEach(({ tar }, i) => {
        tar.style.setProperty('--cnblogx-stackel', `${24 + i * (36 + 16)}px`);
    });
}


export {
    bind_stackel,
};