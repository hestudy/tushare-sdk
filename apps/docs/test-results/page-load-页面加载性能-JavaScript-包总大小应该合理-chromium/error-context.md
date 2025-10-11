# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - link "logo" [ref=e6] [cursor=pointer]:
      - /url: /index.html
      - img "logo" [ref=e8]
    - generic [ref=e10]:
      - button "Search ⌘K" [ref=e13] [cursor=pointer]:
        - img [ref=e14]
        - paragraph [ref=e16]: Search
        - generic [ref=e17]: ⌘K
      - generic [ref=e18]:
        - link "指南" [ref=e19] [cursor=pointer]:
          - /url: /guide/installation.html
          - generic [ref=e20]: 指南
        - link "API 文档" [ref=e21] [cursor=pointer]:
          - /url: /api/stock/basic.html
          - generic [ref=e22]: API 文档
        - link "更新日志" [ref=e23] [cursor=pointer]:
          - /url: /changelog/index.html
          - generic [ref=e24]: 更新日志
        - link "GitHub" [ref=e25] [cursor=pointer]:
          - /url: https://github.com/your-org/tushare-sdk
          - generic [ref=e26]: GitHub
      - generic [ref=e27]:
        - img [ref=e31] [cursor=pointer]
        - link [ref=e35] [cursor=pointer]:
          - /url: https://github.com/your-org/tushare-sdk
          - img [ref=e38]
  - generic [ref=e41]:
    - generic [ref=e46]:
      - heading "modern" [level=1] [ref=e47]
      - paragraph [ref=e48]: modern ssg
      - paragraph [ref=e49]: modern ssg
      - text: "0"
    - generic [ref=e52]: Released under the MIT License.
```