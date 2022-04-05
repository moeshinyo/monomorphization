import './toc.scss';
import { regi_scroll, throttle } from '../utils/jsutils';


function init_toc(on_click?: () => void) {
    if (!document.querySelector('#cnblogs_post_body')) {
        return;
    }

    interface TocNode {
            el: HTMLElement, 
            refel: HTMLElement, 
            add_toc_child: (node: TocNode) => void, 
            highlight: () => void, 
            remove_highlight: () => void, 
    }

    // create a new toc node. 
    const CreateTocNode = (refel: HTMLElement, opt_text?: string): TocNode => {
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

        const add_toc_child = (child) => subs.appendChild(child.el);
        const highlight = () => title.classList.add('cnblogx-toc-title-hightlight');
        const remove_highlight = () => title.classList.remove('cnblogx-toc-title-hightlight');

        return {
            el: node, 
            refel, 
            add_toc_child, 
            highlight, 
            remove_highlight, 
        };
    };

    const toc = document.createElement('div');
    toc.id = 'cnblogx-toc'
    const root_node = CreateTocNode(document.querySelector(`a[name='top']`), '目录');
    toc.appendChild(root_node.el);

    const SELECTOR_HEADERS = `.cnblogs-markdown>h1, .cnblogs-markdown>h2, .cnblogs-markdown>h3, .cnblogs-markdown>h4, .cnblogs-markdown>h5, .cnblogs-markdown>h6`;
    const node_stack = [root_node];
    const node_list = [root_node];
    const level = (node) => Object.is(node, root_node.refel) ? '0' : node.tagName[1];
    const node_stack_top = () => node_stack[node_stack.length - 1];

    document.querySelector('#cnblogs_post_body.cnblogs-markdown').querySelectorAll(SELECTOR_HEADERS).forEach(function (header) {
        const node = CreateTocNode(header as HTMLElement);

        for (; ;) {
            if (level(node_stack_top().refel) < level(header)) {
                node_stack_top().add_toc_child(node);
                node_stack.push(node);
                break;
            } else {
                node_stack.pop();
            }
        }

        node_list.push(node);
    });

    const comment = document.getElementById(`!comments`);

    if (comment) {
        const comment_node = CreateTocNode(comment, '评论列表');
        toc.appendChild(comment_node.el);
        node_list.push(comment_node);
    }
    
    document.querySelector('#sideBarMain').appendChild(toc);

    let last_highlight: TocNode | null = null;
    let timeout: NodeJS.Timeout | null = null;
    
    const update_current_node = () => {
        const distance = (index) => node_list[index].refel.getBoundingClientRect().top;
        let left = 0;
        let right = node_list.length - 1;

        while (left + 1 < right) {
            const mid = Math.floor((left + right) / 2);

            if (distance(mid) <= 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        if (node_list.at(left)) {
            if (Math.abs(distance(left)) > distance(right)) {
                left = right;
            }
            last_highlight?.remove_highlight();
            last_highlight = node_list.at(left);
            last_highlight?.highlight();
        }
    };

    regi_scroll(throttle(() => {
        update_current_node();
        if (!timeout) {
            timeout = setTimeout(() => {
                update_current_node();
                timeout = null;
            }, 400);
        }
    }, 200));
}


export {
    init_toc,
};

