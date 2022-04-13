import "./coscroll.scss";
import { regi_scroll } from "../utils/tsutils";


interface PinningUtils {
    copin: () => void, 
    counpin: () => void, 
}

type UnionToIntersaction<T> = 
    (T extends any ? (_: T) => void : never) extends ((_: infer I) => void) 
    ? I : never;
type ParamToFunction<T> = T extends { copinned: infer C, point: infer P} 
    ? P extends void ? (_1: C) => void: (_1: C, _2: P) => void: never;
    
interface CheckedPinParam1 { copinned: number, point: void, }
interface CheckedPinParam2 { copinned: number | null, point: number, }
type CheckedPinParam = CheckedPinParam1 | CheckedPinParam2;

type CheckedPin = UnionToIntersaction<ParamToFunction<CheckedPinParam>>;

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
    let pinned: null | number = null;
    
    const pin = (top: number) => {
        if (pinned !== top) {
            update_cssvar('pinning-point', top);
            sidebar.classList.add(CLS_PINNED);
            pinned = top;
        }
    };
    const unpin = () => {
        if (pinned !== null) {
            sidebar.classList.remove(CLS_PINNED);
            pinned = null;
        }
    };

    const coscroll = () => {
        const outer = main.getBoundingClientRect();
        const middle = sidebar.getBoundingClientRect();
        const inner = sidebarmain.getBoundingClientRect();

        update_cssvar('middle-width', middle.width);
        update_cssvar('inner-height', inner.height);
        update_cssvar('middle-left', middle.left);

        const nearest_pinning_point = (point: number): number => {
            const lower_bound = window.innerHeight - inner.height;
            // ensure the sidebar covers all visible space. 
            const _point = point > 0 ? 0 : (point < lower_bound ? lower_bound : point);
            // ensure the main container covers the sidebar. 
            return Math.min(Math.max(outer.top, _point), outer.bottom - inner.height);
        };
        const checked_pin: CheckedPin = (copinned: number | null, point?: number) => {
            if (copinned !== null) {
                pin(nearest_pinning_point(copinned));
            } else {
                pin(point as number);
            }
        };

        // sidebar is shorter than window height. 
        if (middle.height <= window.innerHeight) {
            if (outer.top < 0) {
                pin(0);
                set_offsety(0 - outer.top);
            } else {
                unpin();
                set_offsety(0);
            }
            return;
        }
        
        // top boundary. 
        if (middle.top >= 0) {
            if (outer.top > 0) {
                // at the top. 
                unpin();
                set_offsety(0);
            } else {
                // scroll up. 
                checked_pin(copinned, 0);
                set_offsety(0 - outer.top);
                // console.log("top", middle.top);
            }
            return;
        }

        // bottom boundary. 
        if (middle.bottom < window.innerHeight) {
            if (outer.bottom < window.innerHeight) {
                // at the bottom. 
                unpin();
                set_offsety(outer.height - middle.height);
            } else {
                // scroll down. 
                checked_pin(copinned, window.innerHeight - inner.height);
                set_offsety(-outer.top + window.innerHeight - middle.height);
                // console.log("bottom", middle.top);
            }
            return;
        }

        // coscroll. 
        if (copinned === null) {
            unpin();
            // console.log("coscroll", middle.top);
        } else {
            checked_pin(copinned);
        }
    };

    regi_scroll(coscroll);

    const copin = () => {
        if (copinned === null) {
            copinned = sidebar.getBoundingClientRect().top;
            coscroll(); // this will finally invoke `checked_pin`. 
        }
    }; 
    const counpin = () => {
        if (copinned !== null) {
            copinned = null;
            set_offsety(sidebarmain.getBoundingClientRect().top - main.getBoundingClientRect().top);
            unpin();
        }
    };

    return {
        copin, 
        counpin, 
    };
}


export {
    init_coscroll
};