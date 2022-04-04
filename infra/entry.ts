import '../src/main.scss'; // 引入用户样式。
import { main } from '../src/main'; // 引入用户代码。

// 初始化基础设施。
enum STAGE_T {
    DISABLED, 
    LOCAL, 
    WAIT_HTML, 
    HTML_READY,
    LISTENING,
}

declare global {
    interface Window { 
        cnblogx_development: ((_: boolean) => void) & (() => boolean), 
        __cnblogx_stage: STAGE_T, 
    }

    const __DEV_SERVER_PORT: string;
    const __TAG_CUSTOM_HTML: string;
    const __CUSTOM_OUTPUT_HTML: string;
    const __PRESERVE_CSS: string;
}

if (!window.cnblogx_development || window.__cnblogx_stage === undefined) {
    
    Object.defineProperty(window, 'cnblogx_development', {
        value: (enable?: boolean) => {
            const KEY_CUSTOM_DEV_MODE = '__blog-custom-dev-mode';
            
            if (enable === undefined) {
                return window.localStorage.getItem(KEY_CUSTOM_DEV_MODE) === 'true';
            } else {
                window.localStorage.setItem(KEY_CUSTOM_DEV_MODE, enable.toString());
            }
            
            window.location.reload();
        }, 
    });
    
    Object.defineProperty(window, '__cnblogx_stage', {
        value: window.cnblogx_development() ? STAGE_T.LOCAL : STAGE_T.DISABLED, 
        writable: true, 
    });
}

// TIP: 热模块替换的代码会在Production优化中被去掉。
if (module.hot) {
    module.hot.accept();
}

switch (window.__cnblogx_stage) {
    case STAGE_T.DISABLED: {
        afterSetup(); 
        break;
    }
    case STAGE_T.LOCAL: {
        const askForExit = () => {
            if (window.confirm('开发者模式：与本地服务器通信失败，是否重试？')) {
                window.location.reload();
            } else {
                window.cnblogx_development(false);
            }
        };
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `http://localhost:${__DEV_SERVER_PORT}/${__CUSTOM_OUTPUT_HTML}`);
        xhr.onload = () => {
            if (xhr.readyState !== xhr.DONE) {
                askForExit();
            } else {
                const old_html = document.querySelector(`#${__TAG_CUSTOM_HTML}`);
                old_html.removeAttribute('id');
                old_html.innerHTML = xhr.response;

                const dev_html = old_html.querySelector(`#${__TAG_CUSTOM_HTML}`);
                old_html.replaceWith(dev_html);
                dev_html.querySelectorAll('script').forEach((dummy) => {
                    const script = document.createElement('script');
    
                    script.src = dummy.src;
                    dummy.insertAdjacentElement('afterend', script);
                });
                window.__cnblogx_stage = STAGE_T.HTML_READY;
            }
        }
        xhr.timeout = 1200;
        xhr.onerror = xhr.ontimeout = askForExit;
        xhr.send();
        window.__cnblogx_stage = STAGE_T.WAIT_HTML;
        break;
    }
    case STAGE_T.WAIT_HTML: {
        // TIP: 这个状态无法到达，保留以便未来使用。
        break;
    }
    case STAGE_T.HTML_READY: {
        // TIP: 这里已经切换到了本地服务器代码。
        if (__PRESERVE_CSS !== 'true') {
            document.head.querySelector('link[href*="custom.css" i]')?.remove();
        }

        afterSetup();
        window.__cnblogx_stage = STAGE_T.LISTENING;
        break;
    }
    case STAGE_T.LISTENING: {
        // TIP: 状态机停留在最终状态后不应有任何副作用。
        break;
    }
}

// 事件`afterSetup`：基础设施初始化完毕。
function afterSetup() {
    // 添加一个体验更好的开发者模式开关。
    document.querySelector('#footer')?.addEventListener('dblclick', () => {
        if (window.confirm(`开发者模式：是否${window.cnblogx_development() ? '退出' : '进入'}开发者模式？`)) {
            window.cnblogx_development(!window.cnblogx_development());
        }
    });
    // 执行用户代码。
    main();
}