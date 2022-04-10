# Monomorphization

一个简单的博客园皮肤扩展，基于[CNBlogX][CNBlogX]与[Simple Memory][SimpleMemory]。

[CNBlogX]: <https://github.com/moeshinyo/create-cnblogx>
[SimpleMemory]: <https://www.cnblogs.com/SkinUser.aspx?SkinName=SimpleMemory>

- 使用Github风格的Markdown主题。
- 添加了一个目录。
  - 目录能够高亮离页面顶部最近的标题。
  - 目录能够与页面协同滚动。
- 添加了评论区头像显示。
  - 如果没有高清头像，回退到普通头像。
  - 如果没有普通头像，回退到主题提供的默认头像。
  - 默认头像每人一个颜色，达到配置的颜色数量上限后开始循环使用。
- 添加了一个回到顶部按钮。
- 作为[CNBlogX][CNBlogX]的示例项目。

# 部署

1. 将博客主题更改为[Simple Memory][SimpleMemory]。

2. 执行编译：

   ```bash
   npm install
   npm run build
   ```

2. 将`dist/`下的生成物复制到[博客园-管理-设置](<https://i.cnblogs.com/settings>)的对应选项中：

   - 将`custom.css`的内容复制到*页面定制CSS代码*中。
   - 将`custom.html`的内容复制到*页脚HTML代码*中。

   保存博客后台设置。
   
4. 更多配置请参考：[起步](<https://github.com/moeshinyo/cnblogx-starter#%E8%B5%B7%E6%AD%A5>)

# 代码组织

> 本项目建立在[CNBlogX][CNBlogX]的基础上，只需要关心`src/`下的代码。

```bash
src/
  │   main.ejs # 没有任何内容。
  │   main.scss # 引入styles/下的样式。
  │   main.ts # 引入各个子模块，并处理coscroll与toc之间的逻辑关系。
  ├───avatar
  │       avatar.icss.scss.d.ts # 为默认头像的颜色列表声明类型。
  │       avatar.icss.scss # 定义默认头像的颜色列表。
  │       avatar.scss # 头像样式。
  │       index.ts # 为评论区添加头像。
  ├───back2top
  │       back2top.scss # 回到顶部按钮的样式。
  │       index.ts # 为所有页面添加一个回到顶部按钮。
  ├───comment
  │       comment.scss # 评论区样式。
  │       index.ts # 重新组织评论区。
  ├───coscroll
  │       coscroll.scss # 辅助coscroll控制侧边栏的偏移与锁定。
  │       index.ts # 实现内容页面与侧边栏的协同滚动。
  ├───literals
  │       links.icss.scss # 重导出链接，用于传递给其它有需要的js代码。
  │       links.scss # 声明项目中用到的链接。
  ├───styles
  │       markdown.scss # Markdown样式。
  │       patches-simplememory.scss # 对simplememory做出了一点修改。
  ├───toc
  │       index.ts # 为文章添加一个目录。
  │       toc.scss # 目录的样式。
  └───utils
      │   styleutils.scss # 一些Sass工具函数。
      ├───jsutils
      │       index.ts # 一些工具函数，如防抖、节流等。
      │       jsutils.scss # 辅助jsutils获取信息。
      └───stackel
              index.ts # 为手机端的按钮们组织布局。
              stackel.scss # 辅助stackel完成布局。
```

