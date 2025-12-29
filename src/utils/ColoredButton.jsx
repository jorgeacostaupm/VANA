import { Button } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function ColoredButton({
  title = "",
  icon = null,
  onClick,
  placement,
  disabled = false,
  children,
  shape = "default",
}) {
  return (
    <AutoCloseTooltip title={title} placement={placement}>
      <Button
        shape={shape}
        className={buttonStyles.coloredButton}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      >
        {children}
      </Button>
    </AutoCloseTooltip>
  );
}
