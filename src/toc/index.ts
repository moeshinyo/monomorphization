import './toc.scss';
import { regi_scroll, throttle } from '../utils/jsutils';


function init_toc(on_click?: () => void) {
    if (!document.querySelector('#cnblogs_post_body')) {
        return;
    }

    // create a new toc node
    const CreateTocNode = (refel: HTMLElement, opt_text?: string) => {
        const node = document.createElement('div');
        node.classList.add('cnblogx-toc-node');

        const subs = document.createElement('div');
        subs.classList.add('cnblogx-toc-sublist');

        const title = document.createElement('span');
        title.classList.add('cnblogx-toc-title');
        node.appendChild(title);
        node.appendChild(subs);

        title.addEventListener('click', () => {
            on_click?.apply(refel);
            refel.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
            window.history.pushState({}, '',
                window.location.protocol + '//' +
                window.location.host +
                window.location.pathname +
                window.location.search + '#' + encodeURIComponent(refel.id ?? ''));
        });
        title.innerText = opt_text ? opt_text : refel.innerText;

        const add = (child) => subs.appendChild(child.el);
        const hlit = () => title.classList.add('cnblogx-toc-title-hightlight');
        const rmhl = () => title.classList.remove('cnblogx-toc-title-hightlight');

        return {
            el: node, 
            refel, 
            add, 
            hlit, 
            rmhl, 
        };
    };

    // create table of contents
    const toc = document.createElement('div');
    toc.id = 'cnblogx-toc'
    const rootNode = CreateTocNode(document.querySelector(`a[name='top']`), '目录');
    toc.appendChild(rootNode.el);

    const SEL_HEADERS = `.cnblogs-markdown>h1, .cnblogs-markdown>h2, .cnblogs-markdown>h3, .cnblogs-markdown>h4, .cnblogs-markdown>h5, .cnblogs-markdown>h6`;
    const nodeStack = [rootNode];
    const nodeSeq = [rootNode];
    const level = (node) => Object.is(node, rootNode.refel) ? '0' : node.tagName[1];
    const topNode = () => nodeStack[nodeStack.length - 1];

    document.querySelector('#cnblogs_post_body.cnblogs-markdown').querySelectorAll(SEL_HEADERS).forEach(function (header) {
        const node = CreateTocNode(header as HTMLElement);

        for (; ;) {
            if (level(topNode().refel) < level(header)) {
                topNode().add(node);
                nodeStack.push(node);
                break;
            } else {
                nodeStack.pop();
            }
        }

        nodeSeq.push(node);
        nodeStack.push(node);
    });

    const comment = document.getElementById(`blog-comments-placeholder`);

    if (comment) {
        const commentNode = CreateTocNode(comment, '评论列表');
        toc.appendChild(commentNode.el);
        nodeSeq.push(commentNode);
    }
    
    document.querySelector('#sideBarMain').appendChild(toc);

    let last_highlight = null;
    let timeout = null;
    
    const updateCurrentNode = () => {
        const distance = (index) => nodeSeq[index].refel.getBoundingClientRect().top;
        let left = 0;
        let right = nodeSeq.length - 1;

        while (left + 1 < right) {
            const mid = Math.floor((left + right) / 2);

            if (distance(mid) <= 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        if (nodeSeq.at(left)) {
            if (Math.abs(distance(left)) > distance(right)) {
                left = right;
            }
            last_highlight?.rmhl();
            last_highlight = nodeSeq.at(left);
            last_highlight?.hlit();
        }
    };

    regi_scroll(throttle(() => {
        updateCurrentNode();
        if (!timeout) {
            timeout = setTimeout(() => {
                updateCurrentNode();
                timeout = null;
            }, 400);
        }
    }, 200));
}


export {
    init_toc,
};