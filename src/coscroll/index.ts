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
    
    const main = document.getElementById("main");
    const sidebar = document.getElementById("sideBar");
    const sidebarmain = document.getElementById("sideBarMain");

    const updateVar = (name, val) => sidebar.style.setProperty(`--cnblogx-coscroll-${name}`, `${val}px`);
    const setOffsetY = (offset) => updateVar('offsety', offset);
    
    let copinned = false;
    let pinned = false;
    
    const pin = (top) => {
        if (!pinned) {
            updateVar('pinning-offsety', top);
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
        if (!copinned) {
            pin(sidebar.getBoundingClientRect().top);
            copinned = true;
        }
    }; 
    const counpin = () => {
        if (copinned) {
            setOffsetY(sidebarmain.getBoundingClientRect().top - main.getBoundingClientRect().top);
            unpin();
            copinned = false;
        }
    };

    regi_scroll(() => {
        const outer = main.getBoundingClientRect();
        const middle = sidebar.getBoundingClientRect();
        const inner = sidebarmain.getBoundingClientRect();

        updateVar('middle-width', middle.width);
        updateVar('inner-height', inner.height);
        updateVar('middle-left', middle.left);
        
        // sidebar is shorter than window height. 
        if (middle.height <= window.innerHeight) {
            if (outer.top < 0) {
                setOffsetY(0 - outer.top);
                pin(0);
            } else {
                unpin();
                setOffsetY(0);
            }
            return;
        }
        
        // scroll down
        if (middle.bottom < window.innerHeight) {
            if (outer.bottom < window.innerHeight) {
                unpin();
                setOffsetY(outer.height - middle.height);
            } else {
                setOffsetY(window.innerHeight - middle.height - outer.top);
                pin(window.innerHeight - inner.height);
            }
            return;
        }
        
        // scroll up
        if (middle.top >= 0) {
            if (outer.top > 0) {
                unpin();
                setOffsetY(0);
            } else {
                setOffsetY(0 - outer.top);
                pin(0);
            }
            return;
        }

        // coscroll
        if (!copinned) {
            unpin();
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