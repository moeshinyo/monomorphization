import './avatar.scss';
import { literals } from './avatar.icss'
import { wait_for } from '../utils/jsutils';


// 
// get the url of the high-definition avatar
function get_hi_definition_avatar_src(src: string) {
    return src.replace('pic.cnblogs.com/face', 'pic.cnblogs.com/avatar');
}


//
// display avatars for users and assign a default avatar for users have no avatar image. 
function init_avatar() {
    if (!document.querySelector('#blog-comments-placeholder')) {
        return;
    }

    const TAG_PROCESSED = 'cnblogx-avatars-added';
    const assigned_avatars = new Map();
    let assigned_avatar_counter = 0;
    const new_default_avatar = (nick: string) => {
        const avatar = document.createElement('div');
        if (!assigned_avatars.has(nick)) {
            assigned_avatars.set(nick, (assigned_avatar_counter++ % literals.defaultAvatarsLength).toString());
        }
        avatar.classList.add('cnblogx-default-avatar-' + assigned_avatars.get(nick));
        avatar.classList.add('cnblogx-default-avatar');
        avatar.classList.add('cnblogx-avatar');
        return avatar;
    };

    wait_for('#blog-comments-placeholder', '.feedbackItem', () => {
        document.querySelectorAll('#blog-comments-placeholder>.feedbackItem').forEach((item) => {
            if (item.classList.contains(TAG_PROCESSED)) {
                return;
            } else {
                item.classList.add(TAG_PROCESSED)
            }
            let avatar: null | HTMLImageElement | HTMLDivElement = null;

            const nickel = item.querySelector('.feedbackListSubtitle>a:last-child') as HTMLElement;
            const addrel = item.querySelector('.feedbackCon>span:last-child') as HTMLElement;
            const nick = nickel.innerText.trim();
            const addr = addrel.innerText.trim();

            if (addr.endsWith('.png')) {
                avatar = document.createElement('img');
                (avatar as HTMLImageElement).src = get_hi_definition_avatar_src(addr);
                avatar.classList.add('cnblogx-avatar');
                avatar.addEventListener('error', () => {
                    const _avatar = avatar as HTMLImageElement;
                    if (_avatar.src != addr) { // fallback to original avatar
                        _avatar.src = addr;
                    } else { // fallback to default avatar
                        _avatar.replaceWith(new_default_avatar(nick));
                    }
                });
            } else {
                avatar = new_default_avatar(nick);
            }
            item.querySelectorAll('.feedbackCon').forEach(function (con) {
                con.insertBefore(avatar as HTMLElement, con.firstChild);
            });
        });
        return 'continue'; // keep tracking...
    });
}


export {
    init_avatar
};