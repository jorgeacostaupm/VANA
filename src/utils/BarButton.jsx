import { Button } from "antd";
import buttonStyles from "@/utils/Buttons.module.css";
import AutoCloseTooltip from "./AutoCloseTooltip";

export default function BarButton({
  title,
  icon,
  onClick,
  disabled,
  className = buttonStyles.barButton,
}) {
  return (
    <AutoCloseTooltip title={title}>
      <Button
        size="small"
        className={className}
        icon={icon}
        onClick={onClick}
        disabled={disabled}
      />
    </AutoCloseTooltip>
  );
}
