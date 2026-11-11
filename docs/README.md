# 完整目录与文档说明

```text
个人网站/
├── README.md                    项目入口与状态
├── AGENTS.md                    后续开发协作规则
├── .gitignore                   网站忽略规则
├── .github/pull_request_template.md 合并审查清单
├── .cursor/                     原编辑器技能配置，原位保留
├── docs/
│   ├── README.md                本索引
│   ├── PRD_REGISTRY.md          已有需求登记
│   ├── product/roadmap.md       原根目录版本规划
│   ├── prd/
│   │   ├── PRD-001.md           原产品需求（Draft）
│   │   └── PRD-001-测试用例.md  原产品验收用例
│   ├── process/development-workflow.md 开发与 Git 规则
│   ├── templates/
│   │   ├── SPEC.md              迭代开发测试契约模板
│   │   └── TEST-REPORT.md       实测结果模板
│   ├── specs/SPEC-000-project-structure/
│   │   ├── SPEC.md              本轮整理范围与验收
│   │   └── TEST-REPORT.md       本轮检查记录
│   ├── testing/README.md        跨轮测试约定
│   └── releases/README.md       发布记录说明
├── src/README.md                源码预留
├── public/README.md             公开静态资源预留
├── tests/README.md              自动测试预留
├── scripts/README.md            构建/验证脚本预留
└── tools/
    ├── README.md                来源与迁移说明
    ├── skills-library/          原根技能库，整体保留
    │   ├── agent/ assets/ brand/ coding/ learning/
    │   ├── thinking/ visualization/ writing/
    │   └── README.md README.en.md CHANGELOG.md LICENSE
    ├── yunshu_skillshub/        完整上游仓库，自有 .git
    └── prd-doc-writer/          历史技能、assets 与 references
```

第三方技能内部目录沿用其 README，不逐文件展开。当前无网站代码、依赖清单或部署配置。

## 阅读与使用顺序

1. [路线图](product/roadmap.md)：版本目标与优先级。
2. [PRD 登记](PRD_REGISTRY.md) → [产品需求](prd/PRD-001.md) → [产品验收用例](prd/PRD-001-测试用例.md)：产品基线。
3. [开发流程](process/development-workflow.md)：分支、验证、合并与备份。
4. [SPEC 模板](templates/SPEC.md)：每轮复制到 specs/SPEC-NNN-short-name/SPEC.md；编号递增不复用。
5. [测试报告模板](templates/TEST-REPORT.md)：复制为同轮 TEST-REPORT.md，证据放同轮 evidence/。
6. [本轮 SPEC](specs/SPEC-000-project-structure/SPEC.md)：目录整理示例。

PRD 定产品行为，SPEC 定本轮实施与验证，TEST-REPORT 记录事实。冲突先更新文档；合并后的 SPEC 保留历史，新需求建立新编号。状态 Draft → Ready → In Progress → Verified → Merged，未经实测和实际合并不得提前推进。

## 当前需求定稿轮

[SPEC-001：需求定稿](specs/SPEC-001-prd-finalization/SPEC.md) · [文档检查报告](specs/SPEC-001-prd-finalization/TEST-REPORT.md)。产品用例尚未执行。

- [SPEC-002：整站版本路线图](specs/SPEC-002-site-roadmap/SPEC.md) · [检查报告](specs/SPEC-002-site-roadmap/TEST-REPORT.md)

- [SPEC-013：Supabase 数据后台](specs/SPEC-013-supabase-backoffice/SPEC.md)
