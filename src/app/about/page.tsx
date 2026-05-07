import { PageShell } from "@/app/page-shell";

export default function AboutPage() {
  return (
    <PageShell
      eyebrow="About LingTour"
      title="用真实的项目叙事为高校创业背景与文化服务能力提供背书。"
      description="关于我们页将介绍项目定位、团队成员、服务目标、合作方式与联系方式，帮助访客快速理解这是一个兼具文化传播与旅行服务能力的项目。"
      bullets={[
        "项目简介与目标用户说明",
        "团队结构与跨文化服务能力展示",
        "合作联系与常见问题入口",
        "后续可加入媒体报道与合作案例模块",
      ]}
    />
  );
}
