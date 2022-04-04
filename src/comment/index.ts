import './comment.scss';
import { wait_for } from '../utils/jsutils';


//
// init comments
function init_comment() {
    if (!document.querySelector('#blog-comments-placeholder')) {
        return;
    }

    const TAG_PROCESSED = 'cnblogx_comment_done';

    wait_for('#blog-comments-placeholder', '.feedbackItem', () => {
        document.querySelectorAll('#blog-comments-placeholder>.feedbackItem').forEach((item) => {
            
            if (item.classList.contains(TAG_PROCESSED)) {
                return;
            } else {
                (item as HTMLElement).tabIndex = -1;
                item.classList.add(TAG_PROCESSED);
            }

            const author = item.querySelector(`a[id^='a_comment_author_']`);
            const layer = item.querySelector(`.layer`);

            if (layer && author) {
                layer.insertAdjacentElement('afterend', author);
                layer.insertAdjacentText('afterend', ' ');
            }

            // item.querySelectorAll('.comment_digg').forEach((el) => {
            //     el.textContent = '';
            // });
            // item.querySelectorAll('.comment_burry').forEach((el) => {
            //     el.textContent = '';
            // });
        });
        return 'continue'; // keep tracking...
    });
}


export {
    init_comment
};