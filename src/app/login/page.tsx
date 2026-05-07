import { PageShell } from "@/app/page-shell";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="Account Access"
      title="为普通用户、商家与管理后台预留清晰的登录入口。"
      description="登录页初版会保留简单明了的账号入口，后续再根据业务扩展注册、找回密码、身份分层与订单中心。"
      bullets={[
        "普通用户登录 / 注册入口",
        "找回密码与身份扩展预留",
        "后续可接入预约订单与商城订单中心",
        "界面风格与全站保持一致的国际化表达",
      ]}
    />
  );
}
