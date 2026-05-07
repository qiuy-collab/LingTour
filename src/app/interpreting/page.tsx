import { PageShell } from "@/app/page-shell";

export default function InterpretingPage() {
  return (
    <PageShell
      eyebrow="Interpreting Service"
      title="让海外游客用最少决策成本完成陪游口译预约。"
      description="预约页会突出服务介绍、语言选择、时间和路线匹配、价格说明、口译员简介、FAQ 与下单表单，让转化路径更直接可信。"
      bullets={[
        "可选语言、城市与路线快速筛选",
        "日期、人数、服务时长和价格结构清晰呈现",
        "口译员简介与用户评价增强信任",
        "后续可接入真实预约表单与订单流程",
      ]}
    />
  );
}
