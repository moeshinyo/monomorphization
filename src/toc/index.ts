import './toc.scss';
import { regi_scroll, throttle, debounce, from_icss_string } from '../utils/tsutils';
import literals from '../literals/text.icss.scss';

function init_toc(on_click?: () => void) {
    if (!document.querySelector('#cnblogs_post_body')) {
        return;
    }

    // create a new toc node. 
    class TocNode {
        el: HTMLElement;
        refel: HTMLElement;
        add_toc_child: (_: TocNode) => void;
        highlight: () => void;
        remove_highlight: () => void;

        constructor(refel: HTMLElement, opt_text?: string) {
            this.refel = refel;
            this.el = document.createElement('div');
            this.el.classList.add('cnblogx-toc-node');

            const subs = document.createElement('div');
            subs.classList.add('cnblogx-toc-sublist');

            const title = document.createElement('span');
            title.classList.add('cnblogx-toc-title');
            this.el.appendChild(title);
            this.el.appendChild(subs);

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

            this.add_toc_child = (child: TocNode) => subs.appendChild(child.el);
            this.highlight = () => title.classList.add('cnblogx-toc-title-hightlight');
            this.remove_highlight = () => title.classList.remove('cnblogx-toc-title-hightlight');
        }
    }

    const toc = document.createElement('div');
    toc.id = 'cnblogx-toc'
    const root_node = new TocNode(document.body, from_icss_string(literals.tocTextRoot));
    toc.appendChild(root_node.el);

    const SELECTOR_HEADERS = `.cnblogs-markdown>h1, .cnblogs-markdown>h2, .cnblogs-markdown>h3, \
        .cnblogs-markdown>h4, .cnblogs-markdown>h5, .cnblogs-markdown>h6`;
    const node_stack = [root_node];
    const node_list = [root_node];
    const level = (node: Element) => Object.is(node, root_node.refel) ? '0' : node.tagName[1];
    const node_stack_top = (): TocNode => node_stack[node_stack.length - 1];

    document.querySelector('#cnblogs_post_body.cnblogs-markdown')?.querySelectorAll(SELECTOR_HEADERS).forEach(function (header) {
        const node = new TocNode(header as HTMLElement);

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
        const comment_node = new TocNode(comment, from_icss_string(literals.tocTextComment));
        toc.appendChild(comment_node.el);
        node_list.push(comment_node);
    }
    
    document.querySelector('#sideBarMain')?.appendChild(toc);

    let last_highlight: TocNode | null = null;
    
    const update_current_node = () => {
        const get_el_top = (index: number) => node_list[index].refel.getBoundingClientRect().top;
        let left = 0;
        let right = node_list.length - 1;

        while (left + 1 < right) {
            const mid = Math.floor((left + right) / 2);

            if (get_el_top(mid) <= 0) {
                left = mid;
            } else {
                right = mid;
            }
        }

        if (node_list.at(left)) {
            if (Math.abs(get_el_top(left)) > get_el_top(right) 
                    && (node_list.at(right) as TocNode).refel.getBoundingClientRect().top < window.innerHeight / 3) {
                left = right;
            }
            last_highlight?.remove_highlight();
            last_highlight = node_list.at(left) as TocNode;
            last_highlight?.highlight();
        }
    };

    const last_update_current_node = debounce(() => {
        update_current_node();
    }, 400);

    regi_scroll(throttle(() => {
        update_current_node();
        last_update_current_node();
    }, 200));
}


export {
    init_toc,
};

