import "./coscroll.scss";
import { regi_scroll } from "../utils/jsutils";


interface PinningUtils {
    copin: () => void, 
    counpin: () => void, 
}

//
// make the sidebar always visible inside the viewport. 
function init_coscroll(): PinningUtils {
    const CLS_PINNED = "cnblogx-coscroll-pinned";
    
    const main = document.getElementById("main") as HTMLDivElement;
    const sidebar = document.getElementById("sideBar") as HTMLDivElement;
    const sidebarmain = document.getElementById("sideBarMain") as HTMLDivElement;

    const update_cssvar = (name: string, val: number) => sidebar.style.setProperty(`--cnblogx-coscroll-${name}`, `${val}px`);
    const set_offsety = (offset: number) => update_cssvar('offsety', offset);
    
    let copinned: null | number = null;
    let pinned = false;
    
    const pin = (top: number) => {
        if (!pinned) {
            update_cssvar('pinning-point', top);
            sidebar.classList.add(CLS_PINNED);
            pinned = true;
        }
    };
    const unpin = () => {
        if (pinned) {
            sidebar.classList.remove(CLS_PINNED);
            pinned = false;
        }
    };
    const copin = () => {
        if (copinned === null) {
            copinned = sidebar.getBoundingClientRect().top;
            pin(copinned);
        }
    }; 
    const counpin = () => {
        if (copinned !== null) {
            copinned = null;
            set_offsety(sidebarmain.getBoundingClientRect().top - main.getBoundingClientRect().top);
            unpin();
        }
    };

    regi_scroll(() => {
        const outer = main.getBoundingClientRect();
        const middle = sidebar.getBoundingClientRect();
        const inner = sidebarmain.getBoundingClientRect();

        update_cssvar('middle-width', middle.width);
        update_cssvar('inner-height', inner.height);
        update_cssvar('middle-left', middle.left);

        const nearest_pinning_point = (point: number): number => {
            // ensure the sidebar covers all visible space. 
            const _point = point > 0 ? 0 : window.innerHeight - inner.height;
            // ensure the main container covers the sidebar. 
            return Math.min(Math.max(outer.top, _point), outer.bottom - inner.height);
        };
        const checked_pin = <T = typeof copinned>(point: T extends null ? number : null) => {
            if (copinned !== null) {
                pin(nearest_pinning_point(copinned));
            } else {
                pin(point as number);
            }
        };
        const update_offsety_pinned = () => {
            set_offsety(inner.top - outer.top);
        };

        // sidebar is shorter than window height. 
        if (middle.height <= window.innerHeight) {
            if (outer.top < 0) {
                set_offsety(0 - outer.top);
                pin(0);
            } else {
                unpin();
                set_offsety(0);
            }
            return;
        }
        
        // top. 
        if (middle.top >= 0) {
            if (outer.top > 0) {
                unpin();
                set_offsety(0);
            } else {
                checked_pin(0);
                update_offsety_pinned();
            }
            return;
        }

        // bottom. 
        if (middle.bottom < window.innerHeight) {
            if (outer.bottom < window.innerHeight) {
                unpin();
                set_offsety(outer.height - middle.height);
            } else {
                checked_pin(window.innerHeight - inner.height);
                update_offsety_pinned();
            }
            return;
        }

        // coscroll. 
        if (copinned === null) {
            unpin();
        } else {
            checked_pin<typeof copinned>(null);
        }
    });

    return {
        copin, 
        counpin, 
    };
}


export {
    init_coscroll
};