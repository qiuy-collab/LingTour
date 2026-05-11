type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "section";
};

export function Container({
  children,
  className = "",
  as: Tag = "div",
}: ContainerProps) {
  return <Tag className={["site-container", className].filter(Boolean).join(" ")}>{children}</Tag>;
}
