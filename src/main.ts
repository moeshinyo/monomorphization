// TIP: 导出一个`main`函数：该函数将在页面加载时被调用。
import { init_avatar } from "./avatar";
import { init_back2top } from "./back2top";
import { init_comment } from "./comment";
import { init_toc } from "./toc";
import { init_coscroll } from "./coscroll";
import { one_shot } from "./utils/jsutils";


export function main() {
    // TIP: 在这里添加代码。

    // 添加一个“回到顶部”指示器。 
    init_back2top();

    // 添加评论区头像。
    init_avatar();

    // 修改一下评论区。 
    init_comment();
    
    // 实现侧边栏的协同滚动。 
    const { copin, counpin} = init_coscroll();
    
    // 添加目录，并在点击目录导致页面滚动时锁定侧边栏。 
    init_toc(() => {
        copin();
        const cancel = one_shot(document.body, 'wheel', () => {
            counpin();
        });
        setTimeout(() => {
            cancel();
            counpin();
        }, 1000);
    });
}
