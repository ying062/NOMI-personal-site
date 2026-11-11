# 开发、测试、合并与备份规范

## 分支约定

main 为可交付基线。每轮从 main 建 feat/SPEC-NNN-name、fix/SPEC-NNN-name、docs/SPEC-NNN-name 或 chore/SPEC-NNN-name。不设长期 develop/test 分支，测试在本轮分支明确提交上执行。提交格式如 feat: SPEC-001 首页布局。

## 每轮执行顺序

1. 检查 git status，先处理已有改动归属，不覆盖或重置。远端配置后 git fetch origin，再在干净 main 上 git pull --ff-only origin main。
2. git switch -c feat/SPEC-001-homepage。从模板建立本轮 SPEC，范围、验收与测试计划完整后状态 Draft → Ready → In Progress。
3. 实现代码、测试与文档同步提交。产品 PRD 仍为 Draft，涉及字段限制、外部服务等未决事项时先解决相应问题。
4. 执行 SPEC 指定的静态检查、单元/集成测试、构建、手工验收与相关回归。在 TEST-REPORT.md 记录命令、环境、被测 SHA、实际结果和证据路径。技术栈尚未确定，不虚构 npm 命令。
5. 所有验收项通过、无阻塞缺陷后标记 Verified。任何代码变化都需重跑受影响测试。
6. git push -u origin <branch>，通过 PR 审查合并 main。单人本地模式也可 git switch main 后 git merge --no-ff <branch>，仍需先满足同样测试与审查门槛。
7. 合并冲突或代码变化后重新验证；在 main 执行构建和冒烟测试，失败则修复或 revert，不能报告完成。
8. git push origin main；核对 git rev-parse main 与 git ls-remote origin refs/heads/main 的 SHA 相同，记录同步时间及 SHA。实际合并后 SPEC 状态改 Merged，记录更新也要提交推送，最后再次核对 SHA。
9. 发布时 git tag -a vX.Y.Z -m "release vX.Y.Z"，git push origin vX.Y.Z；在 docs/releases/vX.Y.Z.md 记录交付与回退。未部署不能标为已上线。

## 合并门槛

- SPEC 与实现一致，需求 → 验收 → 用例 → 结果可追踪。
- 相关测试与构建通过，手工验收可查；未执行和不适用项有理由。
- 无阻塞缺陷、密钥与无关文件；有审查结论和回退方式。
- 合并后复验通过、远端 SHA 一致，才可报告已合并并备份。

## 远端备份

当前没有网站 origin URL，未创建或推送远端。取得网站专属空仓库地址后执行 git remote add origin <网站仓库URL> 和 git push -u origin main。不得使用 tools/yunshu_skillshub 的上游 origin。

每个有意义的提交后推送工作分支，每次合并后推送 main，发布时推送标签。推送失败则明确备份未完成并保留本地提交重试。Git 仅备份已提交推送内容，忽略文件、环境变量和外部服务配置需独立安全备份。可增设 backup remote 作为独立副本。

远端可用后设置 main 保护：禁止强推与删除、要求 PR 和真实存在的 CI 检查通过。当前无 CI 和服务端保护，规则由人工/代理执行。

## 回退

共享提交使用 git revert，不重写 main 历史。合并提交确认父提交后可用 git revert -m 1 <merge-sha>，随后复验推送。Git 回退和部署平台回退分别记录；当前未配置部署平台。
