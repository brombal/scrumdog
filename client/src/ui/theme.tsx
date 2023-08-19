import color from "color";

export const stylixTheme = {
  color: "#091D6F",
  highlight: color("#091D6F").desaturate(0).lighten(1.7).string(),
};

// export const materialTheme = createMuiTheme({
//   palette: {
//     primary: { main: stylixTheme.highlight, contrastText: "white" },
//   },
//   typography: {
//     fontFamily: `"Baloo Chettan 2", sans-serif;`,
//   },
//   overrides: {
//     MuiInputBase: {
//       root: {
//         fontSize: "inherit",
//       },
//     },
//     MuiInput: {
//       input: {
//         padding: "6px 8px 4px",
//         color: "white",
//         font: "inherit",
//
//         "&::placeholder": {
//           color: "rgba(255,255,255,0.3)",
//         },
//       },
//       underline: {
//         "&::before": { borderBottom: "2px solid rgba(255, 255, 255, 0.42)" },
//         "&:hover:not(.Mui-disabled)::before": {
//           borderBottom: "2px solid rgba(255, 255, 255, 0.87)",
//         },
//         "&::after": {
//           borderWidth: 3,
//         },
//       },
//     },
//     MuiOutlinedInput: {
//       root: {
//         color: "white",
//         "&:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline": {
//           borderColor: "rgba(255,255,255, 0.9)",
//         },
//       },
//       notchedOutline: {
//         borderWidth: 2,
//         borderRadius: 6,
//         borderColor: "rgba(255,255,255, 0.6)",
//       },
//       input: {
//         "&::placeholder": {
//           color: "rgba(255, 255, 255, 0.5)",
//         },
//       },
//     },
//     MuiTooltip: {
//       tooltip: {
//         backgroundColor: "rgba(0,0,0,0.8)",
//         fontSize: 22,
//         padding: "6px 16px",
//       },
//       arrow: {
//         color: "rgba(0,0,0,0.5)",
//       },
//       tooltipPlacementBottom: {
//         margin: "4px 0 !important",
//       },
//     },
//   },
// });
