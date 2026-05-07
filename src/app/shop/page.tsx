import { PageShell } from "@/app/page-shell";

export default function ShopPage() {
  return (
    <PageShell
      eyebrow="Cultural Shop"
      title="把岭南文创做成文化故事与购买场景并行的国际化商城。"
      description="商城页将围绕文化主题分类、推荐商品、商品详情与结算入口展开，同时让商品内容与文化页面、路线页面相互导流。"
      bullets={[
        "按文化主题和使用场景组织商品分类",
        "统一商品卡片与清晰购买入口",
        "商品详情突出文化故事与使用场景",
        "为购物车、结算与售后结构预留扩展空间",
      ]}
    />
  );
}
