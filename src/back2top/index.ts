import './back2top.scss';
import { regi_scroll, throttle } from '../utils/jsutils'
import { bind_stackel } from '../utils/stackel';


//
// add a to-top indicator.
function init_back2top() {
    const CLS_HIDDEN = 'cnblogx-back2top-hidden';
    const back2top = document.createElement('div');
    back2top.id = 'cnblogx-back2top';
    back2top.className = CLS_HIDDEN;
    document.body.appendChild(back2top);

    bind_stackel(back2top, 32);

    const is_at_top = () => window.pageYOffset <= 72;
    const update_indicator = () => {
        if (is_at_top()) {
            back2top.classList.add(CLS_HIDDEN);
        } else {
            back2top.classList.remove(CLS_HIDDEN);
        }
    };

    back2top.onclick = () => {
        if (!is_at_top()) {
            document.body.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        }
    };

    let timeout: NodeJS.Timeout | null = null;
    
    regi_scroll(throttle(() => {
        update_indicator();
        if (!timeout) {
            timeout = setTimeout(() => {
                update_indicator();
                timeout = null;
            }, 600);
        }
    }, 300));
}


export {
    init_back2top,
};