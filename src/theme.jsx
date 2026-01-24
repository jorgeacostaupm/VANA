export const theme = {
  components: {
    Slider: {
      trackBg: "var(--secondary-color)",
      trackHoverBg: "var(--secondary-color)",
      handleColor: "var(--secondary-color)",
      handleActiveColor: "var(--secondary-color)",
      railBg: "#e5e7eb",
    },
    Button: {
      defaultBg: "var(--secondary-color)",
      defaultColor: "white",
      defaultBorderColor: "transparent",

      // hover
      defaultHoverBg: "white",
      defaultHoverColor: "var(--secondary-color)",
      defaultHoverBorderColor: "var(--secondary-color)",

      // active
      defaultActiveBg: "#f3f4f6",
      defaultActiveBorderColor: "#0958d9",
    },
    Tooltip: {
      colorBgSpotlight: "white",
      colorTextLightSolid: "var(--primary-color)",
    },
    Popover: {
      colorBgElevated: "white",
      colorText: "var(--primary-color)",
    },
  },

  token: { fontSize: 16, colorPrimary: "#1a254c" },
};
