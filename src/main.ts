// TIP: 导出一个`main`函数：该函数将在页面加载时被调用。
import { init_avatar } from "./avatar";
import { init_back2top } from "./back2top";
import { init_comment } from "./comment";
import { init_toc } from "./toc";
import { init_coscroll } from "./coscroll";
import { one_shot } from "./utils/tsutils";


export function main() {
    // TIP: 在这里添加代码。

    // 添加一个“回到顶部”指示器。 
    init_back2top();

    // 添加评论区头像。
    init_avatar();

    // 装饰一下评论区。 
    init_comment();
    
    // 实现侧边栏的协同滚动。 
    const { copin, counpin} = init_coscroll();
    
    // 添加目录，并在点击目录导致页面滚动时锁定侧边栏。  
    const cancel_list: (NodeJS.Timeout | (() => void))[] = [];
    const cancel = () => cancel_list
        .forEach(e => typeof(e) === 'function' ? e() : clearTimeout(e));

    init_toc(() => {
        // 用户点了第二次也解除锁定。
        counpin();
        cancel();

        // 锁定侧边栏。
        copin();
        
        // 用户自己滚了就解除锁定。
        cancel_list.push(one_shot(document.body, 'wheel', () => {
            counpin();
            cancel();
        }));

        // 超时了也解除锁定。
        cancel_list.push(setTimeout(() => {
            counpin();
            cancel();
        }, 1200));
    });
}
